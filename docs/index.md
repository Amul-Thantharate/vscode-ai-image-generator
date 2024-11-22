---
layout: default
title: 🎨 AI Image Generator for VS Code
description: Generate AI-powered images directly within Visual Studio Code using multiple leading AI providers
---

# 🎨 AI Image Generator for VS Code

Generate stunning AI-powered images directly within your favorite code editor! This powerful VS Code extension supports multiple leading AI providers and offers smart prompt enhancement capabilities.

[Get Started](#getting-started){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View on GitHub](https://github.com/Amul-Thantharate/vscode-ai-image-generator){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## ✨ Highlights

- 🖼️ Generate images without leaving VS Code
- 🤖 Multiple AI providers supported
- 🚀 Smart prompt enhancement
- 📁 Flexible output options
- ⚡ Fast and efficient workflow

## 🎯 Key Features

### Multi-Provider Support

Choose from multiple leading AI providers:
- **OpenAI DALL-E** (Paid)
- **Stable Diffusion** (Paid)
- **Together AI** (Paid)
- **NVIDIA Consistory** (Paid)
- **AirForce** (Free)
- **Replicate** (Paid)
- **Groq AI** (Paid)

### Smart Prompt Enhancement

- 🧠 Optional Groq AI-powered prompt enhancement
- 💡 Improved details for lighting, atmosphere, and composition
- 🔧 Uses advanced llama3-70b-8192 model

### Image Generation Options

- 🎨 Multiple output formats (webp, png, jpeg)
- 📂 Custom save directory
- 🛡️ File overwrite protection
- 📊 Performance tracking

## 🚀 Getting Started

### Prerequisites

Before installing, ensure you have:
- Visual Studio Code ^1.85.0
- Node.js and npm installed

### Quick Install

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P`
3. Type `ext install ai-image-generator`
4. Press Enter

### Using the Extension

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Generate AI Image"
3. Select your preferred AI provider
4. If it's your first time using the provider:
   - You'll be prompted to enter your API key
   - The key will be securely stored for future use
5. Enter your image prompt
6. Your image will be generated and saved!

## 📚 Documentation

- [Installation Guide](installation.html)
- [Usage Guide](usage.html)
- [Configuration](configuration.html)
- [API Keys Setup](api-keys.html)
- [Troubleshooting](troubleshooting.html)

## 💡 Usage Examples

```json
{
  "aiImageGenerator.defaultProvider": "openai",
  "aiImageGenerator.outputFormat": "png",
  "aiImageGenerator.saveDirectory": "./generated-images",
  "aiImageGenerator.rememberLastProvider": true  // Remember last used provider
}
```

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](contributing.html) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](license.html) file for details.

## 💬 Support

Need help? Check out our:
- [Troubleshooting Guide](troubleshooting.html)
- [GitHub Issues](https://github.com/yourusername/vscode-ai-image-generator/issues)
- [Documentation](https://yourusername.github.io/vscode-ai-image-generator)
