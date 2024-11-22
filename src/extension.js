const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const dotenv = require('dotenv');
const providers = require('./providers');
const axios = require('axios'); // Added axios import

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

        // Check if API keys are configured (skip for AirForce)
        const needsApiKey = provider !== 'AirForce (Free)';
        if (needsApiKey && !validateAPIKeys(config)) {
            vscode.window.showErrorMessage('Please configure your API keys first using the "AI: Configure API Keys" command.');
            return;
        }

        // Get the prompt
        const prompt = await vscode.window.showInputBox({
            prompt: 'Enter your image generation prompt',
            placeHolder: 'A serene landscape with mountains...'
        });

        if (!prompt) return;

        // Ask if user wants to enhance the prompt (skip for AirForce)
        let finalPrompt = prompt;
        if (needsApiKey) {
            const shouldEnhance = await vscode.window.showQuickPick(
                ['Yes', 'No'],
                {
                    placeHolder: 'Would you like to enhance your prompt using Groq AI?',
                    title: 'Enhance Prompt'
                }
            );

            if (shouldEnhance === 'Yes') {
                const groqKey = config.get('groqApiKey');
                if (!groqKey) {
                    const useGroqAnyway = await vscode.window.showQuickPick(
                        ['Yes', 'No'],
                        {
                            placeHolder: 'Groq API key not found. Configure it now?',
                            title: 'Configure Groq API'
                        }
                    );
                    
                    if (useGroqAnyway === 'Yes') {
                        await vscode.commands.executeCommand('ai-image-generator.configure');
                        return;
                    }
                } else {
                    vscode.window.showInformationMessage('Enhancing prompt with Groq AI...');
                    finalPrompt = await providers.enhancePromptWithGroq(prompt, groqKey);
                    vscode.window.showInformationMessage(`Enhanced prompt: ${finalPrompt}`);
                }
            }
        }

        try {
            let imageUrl;
            
            switch (provider) {
                case 'OpenAI DALL-E':
                    imageUrl = await providers.generateWithOpenAI(finalPrompt, config.get('openaiApiKey'), context);
                    break;
                case 'Stable Diffusion':
                    imageUrl = await providers.generateWithStableDiffusion(finalPrompt, config.get('stableDiffusionApiKey'));
                    break;
                case 'Together AI':
                    imageUrl = await providers.generateWithTogetherAI(finalPrompt, config.get('togetherApiKey'));
                    break;
                case 'NVIDIA Consistory':
                    imageUrl = await providers.generateWithNvidia(finalPrompt, config.get('nvidiaApiKey'));
                    break;
                case 'AirForce (Free)':
                    vscode.window.showInformationMessage('Using AirForce free image generation service...');
                    imageUrl = await providers.generateWithAirForce(finalPrompt);
                    break;
            }

            if (imageUrl) {
                await saveImage(imageUrl, finalPrompt, config.get('saveDirectory'), context);
                vscode.window.showInformationMessage('Image generated successfully!');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating image: ${error.message}`);
        }
    });

    const configureCommand = vscode.commands.registerCommand('ai-image-generator.configure', async () => {
        const config = vscode.workspace.getConfiguration('ai-image-generator');
        
        const openaiKey = await vscode.window.showInputBox({
            prompt: 'Enter your OpenAI API Key',
            value: config.get('openaiApiKey')
        });

        const stableDiffusionKey = await vscode.window.showInputBox({
            prompt: 'Enter your Stable Diffusion API Key',
            value: config.get('stableDiffusionApiKey')
        });

        const togetherKey = await vscode.window.showInputBox({
            prompt: 'Enter your Together AI API Key',
            value: config.get('togetherApiKey')
        });

        const nvidiaKey = await vscode.window.showInputBox({
            prompt: 'Enter your NVIDIA API Key',
            value: config.get('nvidiaApiKey')
        });

        const groqKey = await vscode.window.showInputBox({
            prompt: 'Enter your Groq API Key (Optional - for prompt enhancement)',
            value: config.get('groqApiKey')
        });

        const saveDir = await vscode.window.showInputBox({
            prompt: 'Enter directory path to save images',
            value: config.get('saveDirectory')
        });

        await config.update('openaiApiKey', openaiKey, true);
        await config.update('stableDiffusionApiKey', stableDiffusionKey, true);
        await config.update('togetherApiKey', togetherKey, true);
        await config.update('nvidiaApiKey', nvidiaKey, true);
        await config.update('groqApiKey', groqKey, true);
        await config.update('saveDirectory', saveDir, true);

        vscode.window.showInformationMessage('API keys configured successfully!');
    });

    context.subscriptions.push(generateCommand, configureCommand);
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
