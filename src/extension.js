const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const dotenv = require('dotenv');
const providers = require('./providers');
const axios = require('axios');

dotenv.config();

function activate(context) {
    const generateCommand = vscode.commands.registerCommand('ai-image-generator.generate', async () => {
        const config = vscode.workspace.getConfiguration('ai-image-generator');

        // Get the provider
        const provider = await vscode.window.showQuickPick([
            'OpenAI DALL-E',
            'Stable Diffusion',
            'Together AI',
            'NVIDIA Consistory',
            'AirForce (Free)',
        ], {
            placeHolder: 'Select AI Provider'
        });

        if (!provider) return;

        // Handle API key for selected provider
        let apiKey = null;
        if (provider !== 'AirForce (Free)') {
            const configKey = getConfigKeyForProvider(provider);
            apiKey = config.get(configKey);
            
            // If no API key is found, prompt for one
            if (!apiKey) {
                apiKey = await vscode.window.showInputBox({
                    prompt: `Please enter your ${provider} API key`,
                    password: true,
                    validateInput: text => {
                        return text && text.length > 0 ? null : 'API key is required';
                    }
                });

                if (!apiKey) return; // User cancelled

                // Save the API key
                await config.update(configKey, apiKey, true);
                vscode.window.showInformationMessage(`${provider} API key saved successfully!`);
            }
        }

        // Get the prompt
        const prompt = await vscode.window.showInputBox({
            prompt: 'Enter your image generation prompt',
            placeHolder: 'A serene landscape with mountains...'
        });

        if (!prompt) return;

        // Ask if user wants to enhance the prompt (skip for AirForce)
        let finalPrompt = prompt;
        if (provider !== 'AirForce (Free)') {
            const shouldEnhance = await vscode.window.showQuickPick(
                ['Yes', 'No'],
                {
                    placeHolder: 'Would you like to enhance your prompt using Groq AI?',
                    title: 'Enhance Prompt'
                }
            );

            if (shouldEnhance === 'Yes') {
                try {
                    const groqKey = config.get('groqApiKey');
                    if (!groqKey) {
                        const key = await vscode.window.showInputBox({
                            prompt: 'Please enter your Groq AI API key for prompt enhancement',
                            password: true,
                            validateInput: text => {
                                return text && text.length > 0 ? null : 'API key is required';
                            }
                        });
                        if (!key) return;
                        await config.update('groqApiKey', key, true);
                    }
                    finalPrompt = await providers.enhancePromptWithGroq(prompt, groqKey || config.get('groqApiKey'));
                    vscode.window.showInformationMessage(`Enhanced prompt: ${finalPrompt}`);
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to enhance prompt: ' + error.message);
                    return;
                }
            }
        }

        // Show progress during generation
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating image...",
            cancellable: false
        }, async (progress) => {
            try {
                let imageUrl;
                switch (provider) {
                    case 'OpenAI DALL-E':
                        imageUrl = await providers.generateWithOpenAI(finalPrompt, apiKey);
                        break;
                    case 'Stable Diffusion':
                        imageUrl = await providers.generateWithStableDiffusion(finalPrompt, apiKey);
                        break;
                    case 'Together AI':
                        imageUrl = await providers.generateWithTogetherAI(finalPrompt, apiKey);
                        break;
                    case 'NVIDIA Consistory':
                        imageUrl = await providers.generateWithNvidia(finalPrompt, apiKey);
                        break;
                    case 'AirForce (Free)':
                        imageUrl = await providers.generateWithAirForce(finalPrompt);
                        break;
                    default:
                        throw new Error('Unsupported provider');
                }

                if (imageUrl) {
                    await saveImage(imageUrl, finalPrompt, config.get('saveDirectory'), context);
                    vscode.window.showInformationMessage('Image generated successfully!');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error generating image: ${error.message}`);
            }
        });
    });

    context.subscriptions.push(generateCommand);
}

function getConfigKeyForProvider(provider) {
    const keyMap = {
        'OpenAI DALL-E': 'openaiApiKey',
        'Stable Diffusion': 'stableDiffusionApiKey',
        'Together AI': 'togetherApiKey',
        'NVIDIA Consistory': 'nvidiaApiKey'
    };
    return keyMap[provider];
}

function validateAPIKeys(config) {
    return config.get('openaiApiKey') || 
           config.get('stableDiffusionApiKey') || 
           config.get('togetherApiKey') ||
           config.get('nvidiaApiKey');
}

async function saveImage(imageUrl, prompt, saveDirectory, context) {
    if (!saveDirectory) {
        saveDirectory = path.join(process.env.USERPROFILE, 'AI Generated Images');
    }

    if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory, { recursive: true });
    }

    try {
        // Get custom filename from user
        const defaultFilename = prompt.split(' ').slice(0, 3).join('_').toLowerCase()
            .replace(/[^a-z0-9]/gi, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');

        const customFilename = await vscode.window.showInputBox({
            prompt: 'Enter filename (without extension)',
            value: defaultFilename,
            placeHolder: 'e.g., space_cat'
        });

        if (!customFilename) return null;

        // Get file format preference
        const format = await vscode.window.showQuickPick(
            ['webp', 'png', 'jpeg'],
            {
                placeHolder: 'Select image format',
                title: 'Choose File Format'
            }
        );

        if (!format) return null;

        // Check if there are pending URLs to save
        const pendingUrls = context.workspaceState.get('pendingImageUrls', []);
        const urlsToProcess = pendingUrls.length > 0 ? pendingUrls : [imageUrl];

        for (let [index, url] of urlsToProcess.entries()) {
            const filename = urlsToProcess.length > 1 
                ? `${customFilename}_${index + 1}.${format}`
                : `${customFilename}.${format}`;
            
            const filepath = path.join(saveDirectory, filename);

            // Check if file already exists
            if (fs.existsSync(filepath)) {
                const overwrite = await vscode.window.showQuickPick(
                    ['Yes', 'No'],
                    {
                        placeHolder: `${filename} already exists. Overwrite?`,
                        title: 'File Exists'
                    }
                );
                
                if (overwrite !== 'Yes') {
                    vscode.window.showInformationMessage(`Skipped saving ${filename}`);
                    continue;
                }
            }

            let imageBuffer;
            if (url.startsWith('data:image/')) {
                const base64Data = url.split(',')[1];
                imageBuffer = Buffer.from(base64Data, 'base64');
            } else {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(response.data);
            }

            const image = await Jimp.read(imageBuffer);
            const quality = format === 'png' ? 100 : 90;
            
            switch (format) {
                case 'png':
                    await image.writeAsync(filepath);
                    break;
                case 'jpg':
                case 'jpeg':
                    await image.quality(quality).writeAsync(filepath);
                    break;
                case 'webp':
                    await image.quality(quality).writeAsync(filepath);
                    break;
            }
            
            vscode.window.showInformationMessage(`Image saved as: ${filename}`);
        }

        // Clear pending URLs after saving
        if (pendingUrls.length > 0) {
            context.workspaceState.update('pendingImageUrls', undefined);
        }

        return urlsToProcess[0];
    } catch (error) {
        console.error('Error saving image:', error.message);
        throw new Error(`Failed to save image: ${error.message}`);
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
