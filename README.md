# AI Image Generator for VS Code

Generate AI-powered images directly within Visual Studio Code using multiple leading AI providers.

## Features

- 🎨 Multi-Provider Support:
  - OpenAI DALL-E (Paid)
  - Stable Diffusion (Paid)
  - Together AI (Paid)
  - NVIDIA Consistory (Paid)
  - AirForce (Free)

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

You can also configure them directly in VS Code settings:

```json
{
  "ai-image-generator.openaiApiKey": "your-key",
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

### Prompt Enhancement

The Groq AI prompt enhancement feature can improve your results by:
- Adding specific details about lighting
- Enhancing atmosphere descriptions
- Improving composition details
- Making prompts more effective

Example:
- Original: "a cat in garden"
- Enhanced: "a fluffy orange cat sitting gracefully in a sunlit garden with blooming flowers, soft natural lighting, shallow depth of field, golden hour atmosphere"

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

## Privacy

This extension:
- Does not collect user data
- Only sends prompts to selected AI providers
- Stores API keys locally
- Saves images only in user-specified locations
