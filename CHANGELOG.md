# Change Log

All notable changes to the "AI Image Generator" extension will be documented in this file.

## [0.0.3] - 2024-01-XX

### Added
- Replicate integration using recraft-v3 model
- Support for custom image sizes and styles in Replicate
- Performance tracking for Replicate image generation

## [0.0.2] - 2024-01-25

### Added
- New AI Providers:
  - NVIDIA Consistory AI integration
  - AirForce (Free) provider
- Groq AI-powered prompt enhancement using llama3-70b-8192 model
- Multiple image format support (webp, png, jpeg)
- Performance tracking for all providers
- Comprehensive error handling system
- Provider-specific optimizations

### Changed
- Improved provider selection interface
- Enhanced API key configuration process
- Updated base64 and URL image handling
- Optimized prompt parsing for better results
- Standardized error messages across providers

### Removed
- Replicate provider integration
- Leonardo AI provider
- Midjourney provider

### Security
- Enhanced API key storage security
- Improved error logging without sensitive data
- Added secure base64 image handling

### Dependencies
- Updated openai to ^4.26.0
- Added groq-sdk ^0.3.0
- Added together-ai ^0.1.0
- Updated axios to ^1.6.7

### Developer
- Added comprehensive documentation
- Improved code organization
- Enhanced provider architecture
- Added performance monitoring

## [0.0.1] - 2024-01-15

### Added
- Initial release
- Basic image generation functionality
- Support for OpenAI DALL-E
- Basic API key configuration
- Simple file saving system

### Known Issues
- Limited provider support
- Basic error handling
- No image format options
