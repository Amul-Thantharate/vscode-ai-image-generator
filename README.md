# AI Image Generator for VS Code

Generate AI-powered images directly within Visual Studio Code using multiple leading AI providers.

## Features

- 🎨 Multi-Provider Support:
  - OpenAI DALL-E (Paid)
  - Stable Diffusion (Paid)
  - Together AI (Paid)
  - NVIDIA Consistory (Paid)
  - AirForce (Free)
  - Replicate (Paid)

- 🚀 Smart Prompt Enhancement:
  - Optional Groq AI-powered prompt enhancement
  - Improved details for lighting, atmosphere, and composition
  - Uses advanced llama3-70b-8192 model

- 📸 Image Generation Options:
  - Multiple output formats (webp, png, jpeg)
  - Custom save directory
  - File overwrite protection
  - Performance tracking

## Screenshots

### Generate Images
![Generate Images](images/example1.svg)

### Configure Settings
![Configure Settings](images/example2.svg)

## Installation

1. Install the extension from the VS Code marketplace
2. Configure your API keys using the command palette
3. Start generating images!

## Requirements

- Visual Studio Code ^1.85.0
- Node.js and npm installed
- API keys for paid providers (optional)

## Configuration

### API Keys

Configure your API keys using the "AI: Configure API Keys" command:

1. OpenAI API Key (for DALL-E)
2. Stable Diffusion API Key
3. Together AI API Key
4. NVIDIA API Key
5. Groq API Key (optional - for prompt enhancement)
6. Replicate API Token

You can also configure them directly in VS Code settings:

```json
{
  "ai-image-generator.openaiApiKey": "your-key",
  "ai-image-generator.replicateApiToken": "YOUR_REPLICATE_TOKEN",
  "ai-image-generator.stableDiffusionApiKey": "your-key",
  "ai-image-generator.togetherApiKey": "your-key",
  "ai-image-generator.nvidiaApiKey": "your-key",
  "ai-image-generator.groqApiKey": "your-key",
  "ai-image-generator.saveDirectory": "path/to/save/dir"
}
```

## Usage

1. Open the command palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "AI: Generate Image"
3. Select your preferred provider
4. Enter your prompt
5. Optionally enhance your prompt with Groq AI
6. Choose image format and filename
7. Your image will be generated and saved!

### Provider-Specific Features

#### OpenAI DALL-E
- High-quality image generation
- Consistent results
- Professional-grade outputs

#### Stable Diffusion
- WebP format support
- Configurable generation steps
- Advanced image parameters

#### Together AI
- Fast generation
- FLUX.1-schnell model
- Efficient processing

#### NVIDIA Consistory
- Smart prompt parsing
- Scene composition
- Professional photo-realistic results

#### AirForce (Free)
- No API key required
- Quick results
- Great for testing

#### Replicate (recraft-v3)
- High-quality image generation
- Custom style support
- Flexible size options
- Fast generation times

Configuration:
```json
{
    "ai-image-generator.replicateApiToken": "YOUR_REPLICATE_TOKEN"
}
```

Example Usage:
```javascript
// Example prompt with style and size options
{
    "provider": "replicate",
    "prompt": "a wildlife photography photo of a red panda using a laptop in a snowy forest",
    "options": {
        "size": "1365x1024",
        "style": "photography"  // Available styles: photography, digital-art, anime, sketch, etc.
    }
}
```

Style Examples:
- `photography`: Realistic photographic style
- `digital-art`: Digital artwork style
- `anime`: Anime/manga style
- `sketch`: Hand-drawn sketch style
- `3d-render`: 3D rendered style
- `pixel-art`: Retro pixel art style
- `oil-painting`: Classical oil painting style
- `watercolor`: Watercolor painting style
- `any`: Let the model choose the best style

Size Options:
- `1024x1024`: Standard square format
- `1365x1024`: Landscape format (4:3)
- `1024x1365`: Portrait format (3:4)
- `1920x1080`: HD landscape format (16:9)

### Prompt Enhancement

The Groq AI prompt enhancement feature can improve your results by:
- Adding specific details about lighting
- Enhancing atmosphere descriptions
- Improving composition details
- Making prompts more effective

Example:
- Original: "a cat in garden"
- Enhanced: "a fluffy orange cat sitting gracefully in a sunlit garden with blooming flowers, soft natural lighting, shallow depth of field, golden hour atmosphere"

## Troubleshooting

### Common Issues and Solutions

#### General Issues

1. **Extension Not Loading**
   - Check VS Code version compatibility (requires ^1.85.0)
   - Try reloading VS Code (`Ctrl+R` or `Cmd+R`)
   - Verify extension installation in Extensions panel

2. **API Key Issues**
   - Ensure all required API keys are properly configured
   - Check for leading/trailing spaces in API keys
   - Verify API key permissions and quotas
   - Try re-entering the API keys

3. **Image Generation Fails**
   - Check internet connectivity
   - Verify API provider status
   - Ensure prompt meets provider guidelines
   - Check API usage limits

#### Provider-Specific Issues

##### Replicate Issues

1. **Authentication Errors**
   ```
   Error: Authentication failed for Replicate API
   ```
   Solutions:
   - Verify Replicate API token is correct
   - Check token hasn't expired
   - Ensure token has proper permissions
   - Try generating a new API token

2. **Generation Timeout**
   ```
   Error: Request timed out after 30 seconds
   ```
   Solutions:
   - Try a shorter/simpler prompt
   - Reduce image size
   - Check network stability
   - Retry during off-peak hours

3. **Invalid Size Error**
   ```
   Error: Invalid size parameter
   ```
   Solutions:
   - Use standard sizes (1024x1024, 1365x1024, etc.)
   - Ensure dimensions are within limits
   - Check size format (width x height)

4. **Style-Related Issues**
   ```
   Error: Invalid style parameter
   ```
   Solutions:
   - Use supported style keywords
   - Try 'any' for default style
   - Check style compatibility with model

5. **Output Quality Issues**
   - Poor Results:
     - Use more detailed prompts
     - Enable prompt enhancement
     - Try different styles
     - Adjust image size
   - Inconsistent Style:
     - Use explicit style parameter
     - Add style details in prompt
     - Check example configurations

#### Error Messages and Solutions

| Error Message | Possible Cause | Solution |
|--------------|----------------|----------|
| `Failed to generate image with Replicate` | General API error | Check API status and retry |
| `No image generated by Replicate` | Empty response | Verify prompt and retry |
| `Invalid API token` | Authentication issue | Update API token |
| `Rate limit exceeded` | Too many requests | Wait and retry later |
| `Model not found` | Invalid model reference | Check model availability |

### Performance Optimization

1. **Faster Generation**
   - Use optimal image sizes
   - Keep prompts concise
   - Use specific styles
   - Avoid complex prompt enhancement

2. **Better Results**
   - Use clear, detailed prompts
   - Specify artistic style
   - Enable prompt enhancement for important generations
   - Follow style-specific best practices

3. **Resource Usage**
   - Monitor API usage
   - Use appropriate image sizes
   - Cache frequently used images
   - Clean up temporary files

### Debug Mode

Enable debug mode for detailed logs:
```json
{
    "ai-image-generator.debug": true
}
```

Debug logs will show:
- API requests and responses
- Generation parameters
- Performance metrics
- Error details

### Getting Help

1. **Check Documentation**
   - Review README
   - Check CHANGELOG for known issues
   - Visit provider documentation

2. **Common Solutions**
   - Clear VS Code cache
   - Update extension
   - Verify dependencies
   - Check network connectivity

3. **Report Issues**
   - Provide error messages
   - Include debug logs
   - Describe reproduction steps
   - Specify provider and settings

### Best Practices

1. **API Management**
   - Rotate API keys regularly
   - Monitor usage limits
   - Keep keys secure
   - Use environment variables

2. **Prompt Writing**
   - Be specific and clear
   - Include style details
   - Use appropriate length
   - Follow provider guidelines

3. **Configuration**
   - Use recommended settings
   - Test in isolation
   - Backup configurations
   - Update regularly

## Error Handling

The extension includes comprehensive error handling:
- API key validation
- Provider-specific error messages
- Network error recovery
- File system error handling

## Performance

Each provider includes performance tracking:
- Generation time logging
- Response time monitoring
- Success rate tracking

## Security

- API keys are stored securely in VS Code settings
- No sensitive information in logs
- Secure image handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Known Issues

- Some providers may have rate limits
- Generation times can vary by provider
- API keys must be obtained separately

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

### 0.0.2
- Added NVIDIA Consistory support
- Implemented Groq AI prompt enhancement
- Added multiple image formats
- Improved error handling
- Added performance tracking

### 0.0.1
- Initial release
- Basic provider support
- Image generation functionality

## Publishing

To publish this extension to the VS Code Marketplace:

1. Install vsce (VS Code Extension Manager):
```bash
npm install -g @vscode/vsce
```

2. Create a Personal Access Token (PAT):
   - Go to https://dev.azure.com
   - Create a new organization or select existing
   - Click on User Settings (top right)
   - Select Personal Access Tokens
   - Click New Token
   - Set Organization to "All accessible organizations"
   - Set Scopes to "Marketplace > Manage"
   - Copy the token - you'll need it for publishing

3. Login to vsce:
```bash
vsce login <publisher-name>
```

4. Package the extension:
```bash
vsce package
```

5. Publish to Marketplace:
```bash
vsce publish
```

Note: Make sure to update the following in package.json before publishing:
- "publisher": Set to your marketplace publisher name
- "repository": Update with your actual repository URL
- "version": Ensure it matches your CHANGELOG.md

## Support

For support, please:
1. Check the documentation
2. Look for existing issues
3. Create a new issue if needed

## License

This extension is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- OpenAI for DALL-E API
- Stability AI for Stable Diffusion
- Together AI for their SDK
- NVIDIA for Consistory API
- Groq AI for prompt enhancement
- AirForce for free image generation
- Replicate for recraft-v3 API

## Privacy

This extension:
- Does not collect user data
- Only sends prompts to selected AI providers
- Stores API keys locally
- Saves images only in user-specified locations
