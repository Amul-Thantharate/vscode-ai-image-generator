const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Replicate = require('replicate');
const { OpenAI } = require('openai');
const { performance } = require('perf_hooks');
const Jimp = require('jimp');
const dotenv = require('dotenv');
const { createWriteStream } = require('fs');
const Groq = require('groq-sdk');

dotenv.config();

function activate(context) {
    let generateImageCommand = vscode.commands.registerCommand('ai-image-generator.generateImage', async () => {
        const config = vscode.workspace.getConfiguration('aiImageGenerator');
        
        // Get the provider
        const provider = await vscode.window.showQuickPick([
            'OpenAI DALL-E',
            'Replicate',
            'Together AI',
            'AirForce',
            'Stable Diffusion'
        ], {
            placeHolder: 'Select AI Provider'
        });

        if (!provider) return;

        // Check if API keys are configured (except for AirForce which is free)
        if (provider !== 'AirForce' && !validateAPIKeys(config)) {
            vscode.window.showErrorMessage('Please configure your API keys first using the "AI: Configure API Keys" command.');
            return;
        }

        // Get the prompt
        const prompt = await vscode.window.showInputBox({
            placeHolder: 'Enter your image description',
            prompt: 'Describe the image you want to generate'
        });

        if (!prompt) return;

        // Ask if user wants to enhance the prompt
        const shouldEnhance = await vscode.window.showQuickPick(
            ['Yes', 'No'],
            {
                placeHolder: 'Would you like to enhance your prompt using Groq AI?',
                title: 'Enhance Prompt'
            }
        );

        let finalPrompt = prompt;
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
                finalPrompt = await enhancePromptWithGroq(prompt, groqKey);
                vscode.window.showInformationMessage(`Enhanced prompt: ${finalPrompt}`);
            }
        }

        try {
            let imageUrl;
            
            switch (provider) {
                case 'OpenAI DALL-E':
                    imageUrl = await generateWithOpenAI(finalPrompt, config.get('openaiApiKey'), context);
                    break;
                case 'Replicate':
                    imageUrl = await generateWithReplicate(finalPrompt, config.get('replicateApiKey'));
                    break;
                case 'Together AI':
                    imageUrl = await generateWithTogetherAI(finalPrompt, config.get('togetherApiKey'));
                    break;
                case 'AirForce':
                    imageUrl = await generateWithAirForce(finalPrompt);
                    break;
                case 'Stable Diffusion':
                    imageUrl = await generateWithStableDiffusion(finalPrompt, config.get('stableDiffusionApiKey'));
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

    let configureAPIKeysCommand = vscode.commands.registerCommand('ai-image-generator.configureAPIKeys', async () => {
        const config = vscode.workspace.getConfiguration('aiImageGenerator');
        
        const replicateKey = await vscode.window.showInputBox({
            prompt: 'Enter your Replicate API Key',
            value: config.get('replicateApiKey')
        });
        
        const openaiKey = await vscode.window.showInputBox({
            prompt: 'Enter your OpenAI API Key',
            value: config.get('openaiApiKey')
        });
        
        const togetherKey = await vscode.window.showInputBox({
            prompt: 'Enter your Together AI API Key',
            value: config.get('togetherApiKey')
        });

        const stableDiffusionKey = await vscode.window.showInputBox({
            prompt: 'Enter your Stable Diffusion API Key',
            value: config.get('stableDiffusionApiKey')
        });

        const groqKey = await vscode.window.showInputBox({
            prompt: 'Enter your Groq API Key (Optional - for prompt enhancement)',
            value: config.get('groqApiKey')
        });

        const saveDir = await vscode.window.showInputBox({
            prompt: 'Enter directory path to save images',
            value: config.get('saveDirectory')
        });

        await config.update('replicateApiKey', replicateKey, true);
        await config.update('openaiApiKey', openaiKey, true);
        await config.update('togetherApiKey', togetherKey, true);
        await config.update('stableDiffusionApiKey', stableDiffusionKey, true);
        await config.update('groqApiKey', groqKey, true);
        await config.update('saveDirectory', saveDir, true);

        vscode.window.showInformationMessage('API keys configured successfully!');
    });

    context.subscriptions.push(generateImageCommand, configureAPIKeysCommand);
}

function validateAPIKeys(config) {
    return config.get('replicateApiKey') || 
           config.get('openaiApiKey') || 
           config.get('togetherApiKey') ||
           config.get('stableDiffusionApiKey');
}

async function enhancePromptWithGroq(prompt, apiKey) {
    try {
        const groq = new Groq({ apiKey });
        
        const completion = await groq.chat.completions.create({
            model: "llama3-70b-8192",
            messages: [
                {
                    role: "system",
                    content: "You are an expert at crafting detailed, vivid image generation prompts. Enhance the given prompt to include more details about lighting, atmosphere, style, and composition. Keep the core idea but make it more descriptive and visually rich. Format your response as a single enhanced prompt without any explanations."
                },
                {
                    role: "user",
                    content: `Enhance this image generation prompt: "${prompt}"`
                }
            ],
            temperature: 0.7,
            max_tokens: 200,
            top_p: 1,
            stream: false
        });

        const enhancedPrompt = completion.choices[0]?.message?.content?.trim();
        if (!enhancedPrompt) {
            throw new Error('No enhanced prompt generated');
        }

        return enhancedPrompt;
    } catch (error) {
        console.error('Groq prompt enhancement error:', error.message);
        vscode.window.showWarningMessage(`Prompt enhancement failed: ${error.message}. Using original prompt.`);
        return prompt; // Return original prompt if enhancement fails
    }
}

async function generateWithOpenAI(prompt, apiKey, context) {
    const start = performance.now();
    try {
        // Get user preferences for OpenAI generation
        const model = await vscode.window.showQuickPick(
            ['dall-e-3', 'dall-e-2'],
            {
                placeHolder: 'Select DALL-E model',
                title: 'Choose OpenAI Model'
            }
        );

        if (!model) return null;

        const numImages = await vscode.window.showQuickPick(
            ['1', '2', '3', '4'],
            {
                placeHolder: 'Number of images to generate',
                title: 'Select number of images'
            }
        );

        if (!numImages) return null;

        const size = await vscode.window.showQuickPick(
            ['1024x1024', '1024x1792', '1792x1024'],
            {
                placeHolder: 'Select image size',
                title: 'Choose Image Size'
            }
        );

        if (!size) return null;

        const negativePrompt = await vscode.window.showInputBox({
            prompt: 'Enter negative prompt (optional)',
            placeHolder: 'What to avoid in the image'
        });

        // Combine prompts if negative prompt is provided
        const finalPrompt = negativePrompt 
            ? `${prompt}. Please avoid: ${negativePrompt}`
            : prompt;

        const openai = new OpenAI({ apiKey });
        const response = await openai.images.generate({
            model: model,
            prompt: finalPrompt,
            n: parseInt(numImages),
            size: size,
            quality: model === 'dall-e-3' ? 'hd' : 'standard'
        });

        const elapsedTime = (performance.now() - start) / 1000;
        console.log(`OpenAI image created in ${elapsedTime.toFixed(2)} seconds.`);

        // If multiple images were generated, save all of them
        if (response.data.length > 1) {
            // Return the first image URL for immediate display
            vscode.window.showInformationMessage(`Generated ${response.data.length} images. All will be saved.`);
            
            // Store all URLs for saving
            const urls = response.data.map(item => item.url);
            context.workspaceState.update('pendingImageUrls', urls);
            
            return response.data[0].url;
        }

        return response.data[0].url;
    } catch (error) {
        console.error('OpenAI generation error:', error.message);
        throw new Error(`OpenAI generation failed: ${error.message}`);
    }
}

async function generateWithReplicate(prompt, apiKey) {
    const start = performance.now();
    try {
        const replicate = new Replicate({ auth: apiKey });
        const output = await replicate.run(
            "recraft-ai/recraft-v3",
            {
                input: {
                    prompt: prompt,
                    negative_prompt: "ugly, disfigured, low quality, blurry, nsfw",
                    num_inference_steps: 50,
                    guidance_scale: 7.5,
                    scheduler: "DPMSolverMultistep",
                    num_outputs: 1
                }
            }
        );
        const elapsedTime = (performance.now() - start) / 1000;
        console.log(`Replicate image created in ${elapsedTime.toFixed(2)} seconds.`);
        return output[0];
    } catch (error) {
        console.error('Replicate generation error:', error.message);
        throw new Error(`Replicate generation failed: ${error.message}`);
    }
}

async function generateWithTogether(prompt, apiKey) {
    const start = performance.now();
    try {
        const response = await axios.post(
            'https://api.together.xyz/inference',
            {
                model: 'black-forest-labs/FLUX.1-schnell-Free',
                prompt,
                steps: 50,
                n: 1,
                negative_prompt: 'ugly, disfigured, low quality, blurry, nsfw',
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const elapsedTime = (performance.now() - start) / 1000;
        console.log(`Together AI image created in ${elapsedTime.toFixed(2)} seconds.`);

        // Handle the base64 response
        if (response.data && response.data.output && response.data.output.choices) {
            return `data:image/png;base64,${response.data.output.choices[0].image}`;
        } else {
            throw new Error('Unexpected response format from Together AI');
        }
    } catch (error) {
        console.error('Together AI generation error:', error.message);
        throw new Error(`Together AI generation failed: ${error.message}`);
    }
}

async function generateWithAirForce(prompt) {
    const start = performance.now();
    try {
        const response = await axios.get('https://api.airforce/v1/imagine2', {
            params: { prompt },
            responseType: 'arraybuffer'
        });

        const elapsedTime = (performance.now() - start) / 1000;
        console.log(`AirForce image created in ${elapsedTime.toFixed(2)} seconds.`);

        // Convert the binary response to base64
        const base64Image = Buffer.from(response.data).toString('base64');
        return `data:image/png;base64,${base64Image}`;
    } catch (error) {
        console.error('AirForce generation error:', error.message);
        throw new Error(`AirForce generation failed: ${error.message}`);
    }
}

async function generateWithStableDiffusion(prompt, apiKey) {
    const start = performance.now();
    try {
        if (!apiKey) {
            throw new Error('Stable Diffusion API key not found. Please add it to settings.');
        }

        // Get output format preference
        const outputFormat = await vscode.window.showQuickPick(
            ['webp', 'png', 'jpeg'],
            {
                placeHolder: 'Select output format',
                title: 'Choose Image Format'
            }
        );

        if (!outputFormat) return null;

        // Create payload
        const payload = {
            prompt: prompt,
            output_format: outputFormat,
            width: 1024,
            height: 1024,
            steps: 50,
            cfg_scale: 7
        };

        // Create form data
        const formData = new FormData();
        for (const [key, value] of Object.entries(payload)) {
            formData.append(key, value);
        }

        const response = await axios.postForm(
            'https://api.stability.ai/v2beta/stable-image/generate/core',
            formData,
            {
                validateStatus: undefined,
                responseType: 'arraybuffer',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: 'image/*'
                }
            }
        );

        if (response.status !== 200) {
            throw new Error(`Stability AI Error: ${response.status}: ${response.data.toString()}`);
        }

        const elapsedTime = (performance.now() - start) / 1000;
        console.log(`Stable Diffusion image created in ${elapsedTime.toFixed(2)} seconds.`);

        // Convert array buffer to base64
        const base64Image = Buffer.from(response.data).toString('base64');
        return `data:image/${outputFormat};base64,${base64Image}`;
    } catch (error) {
        console.error('Stable Diffusion generation error:', error.message);
        throw new Error(`Stable Diffusion generation failed: ${error.message}`);
    }
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
            ['png', 'jpg', 'jpeg', 'webp'],
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
            // Create filename with optional numbering for multiple images
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
                // Handle base64 image data
                const base64Data = url.split(',')[1];
                imageBuffer = Buffer.from(base64Data, 'base64');
            } else {
                // Handle URL-based images
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(response.data);
            }

            // Use Jimp to process and save the image
            const image = await Jimp.read(imageBuffer);
            
            // Set quality based on format
            const quality = format === 'png' ? 100 : 90;
            
            // Save with appropriate format
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

        return urlsToProcess[0]; // Return the first filepath for consistency
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
