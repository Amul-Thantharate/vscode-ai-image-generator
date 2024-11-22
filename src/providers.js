const axios = require('axios');
const { Groq } = require('groq-sdk');
const OpenAI = require('openai');
const Together = require('together-ai');
const FormData = require('form-data');
const { performance } = require('perf_hooks');
const Replicate = require('replicate');

async function enhancePromptWithGroq(prompt, apiKey) {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: 'You are an expert at enhancing image generation prompts. Your goal is to add specific details about lighting, atmosphere, composition, and style to make the prompt more effective. Keep the enhanced prompt concise but detailed.'
            },
            {
                role: 'user',
                content: `Enhance this image generation prompt with more specific details: "${prompt}"`
            }
        ],
        model: 'llama3-70b-8192',
        temperature: 0.7,
        max_tokens: 200,
        top_p: 0.8
    });

    return completion.choices[0]?.message?.content || prompt;
}

async function generateWithOpenAI(prompt, apiKey, context) {
    const openai = new OpenAI({ apiKey });
    
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: "url"
        });

        return response.data[0].url;
    } catch (error) {
        console.error('OpenAI generation error:', error);
        throw new Error(`OpenAI generation failed: ${error.message}`);
    }
}

async function generateWithStableDiffusion(prompt, apiKey) {
    const start = performance.now();
    
    try {
        const payload = {
            prompt: prompt,
            output_format: 'webp',
            width: 1024,
            height: 1024,
            steps: 30,
            cfg_scale: 7
        };

        const response = await axios.postForm(
            'https://api.stability.ai/v2beta/stable-image/generate/core',
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: 'arraybuffer',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Accept: 'image/*'
                }
            }
        );

        const elapsedTime = (performance.now() - start) / 1000;
        console.log(`Stable Diffusion image created in ${elapsedTime.toFixed(2)} seconds.`);

        if (response.status !== 200) {
            throw new Error(`Stability AI Error: ${response.status}: ${response.data.toString()}`);
        }

        // Convert array buffer to base64
        const base64Image = Buffer.from(response.data).toString('base64');
        return `data:image/webp;base64,${base64Image}`;
    } catch (error) {
        console.error('Stable Diffusion generation error:', error);
        throw new Error(`Stable Diffusion generation failed: ${error.response?.status ? `Status ${error.response.status}: ${error.response.data.toString()}` : error.message}`);
    }
}

async function generateWithTogetherAI(prompt, apiKey) {
    try {
        const together = new Together({ apiKey });
        
        const response = await together.images.create({
            model: "black-forest-labs/FLUX.1-schnell-Free",
            prompt: prompt,
            steps: 10,
            n: 1
        });

        if (response.data && response.data.length > 0) {
            return `data:image/png;base64,${response.data[0].b64_json}`;
        }

        throw new Error('No image generated');
    } catch (error) {
        console.error('Together AI generation error:', error);
        throw new Error(`Together AI generation failed: ${error.response?.data?.message || error.message}`);
    }
}

async function generateWithAirForce(prompt) {
    const url = 'https://api.airforce/v1/imagine2';
    const start = performance.now();
    
    try {
        const response = await axios.get(url, {
            params: { prompt },
            responseType: 'arraybuffer'
        });

        const elapsedTime = (performance.now() - start) / 1000;
        console.log(`AirForce image created in ${elapsedTime.toFixed(2)} seconds.`);

        // Convert array buffer to base64
        const base64Image = Buffer.from(response.data).toString('base64');
        return `data:image/png;base64,${base64Image}`;
    } catch (error) {
        console.error('AirForce generation error:', error);
        throw new Error(`AirForce generation failed: ${error.response?.status || error.message}`);
    }
}

async function generateWithNvidia(prompt, apiKey) {
    const start = performance.now();
    const invokeUrl = "https://ai.api.nvidia.com/v1/genai/nvidia/consistory";
    
    try {
        // Split the prompt into subject and scene
        const promptParts = prompt.split(' in ');
        const subject = promptParts[0] || prompt;
        const scene = promptParts[1] || '';

        // Extract potential subject tokens (nouns) using simple splitting
        const subjectTokens = subject.split(' ').filter(word => 
            !['a', 'an', 'the', 'in', 'on', 'at', 'by', 'with'].includes(word.toLowerCase())
        );

        const payload = {
            mode: "init",
            subject_prompt: subject,
            subject_tokens: subjectTokens,
            subject_seed: Math.floor(Math.random() * 1000),
            style_prompt: "A photo of",
            scene_prompt1: scene || "in a beautiful setting",
            scene_prompt2: scene ? `in ${scene}` : "in an artistic environment",
            negative_prompt: "",
            cfg_scale: 5,
            same_initial_noise: false
        };

        const response = await axios.post(invokeUrl, payload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const elapsedTime = (performance.now() - start) / 1000;
        console.log(`NVIDIA image created in ${elapsedTime.toFixed(2)} seconds.`);

        if (response.status !== 200) {
            throw new Error(`NVIDIA API Error: ${response.status}: ${JSON.stringify(response.data)}`);
        }

        if (response.data.artifacts && response.data.artifacts.length > 0) {
            // Return the first generated image
            return `data:image/jpeg;base64,${response.data.artifacts[0].base64}`;
        }

        throw new Error('No image generated');
    } catch (error) {
        console.error('NVIDIA generation error:', error);
        throw new Error(`NVIDIA generation failed: ${error.response?.status ? `Status ${error.response.status}: ${JSON.stringify(error.response.data)}` : error.message}`);
    }
}

async function generateWithReplicate(prompt, options = {}) {
    try {
        const startTime = Date.now();
        
        // Initialize Replicate client
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        // Prepare input parameters
        const input = {
            size: options.size || "1024x1024",
            style: options.style || "any",
            prompt: prompt
        };

        // Track performance
        console.log(`Starting Replicate generation for prompt: ${prompt}`);
        
        // Generate image
        const output = await replicate.run("recraft-ai/recraft-v3", { input });
        
        // Handle response
        if (!output || !output.length) {
            throw new Error('No image generated by Replicate');
        }

        // Get image URL from output
        const imageUrl = output[0];
        
        // Download image and convert to base64
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');

        // Calculate performance metrics
        const endTime = Date.now();
        const generationTime = endTime - startTime;

        // Return result
        return {
            success: true,
            base64Image: base64Image,
            format: 'png',
            metadata: {
                provider: 'Replicate',
                model: 'recraft-v3',
                prompt: prompt,
                size: input.size,
                style: input.style,
                generationTime: generationTime,
                url: imageUrl
            }
        };
    } catch (error) {
        console.error('Replicate generation error:', error);
        
        return {
            success: false,
            error: {
                message: error.message || 'Failed to generate image with Replicate',
                details: error.response?.data || error,
                provider: 'Replicate'
            }
        };
    }
}

module.exports = {
    enhancePromptWithGroq,
    generateWithOpenAI,
    generateWithStableDiffusion,
    generateWithTogetherAI,
    generateWithAirForce,
    generateWithNvidia,
    generateWithReplicate
};
