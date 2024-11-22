---
layout: default
title: API Keys Setup
nav_order: 2
---

# 🔑 API Keys Setup

This guide explains how to obtain API keys for each supported AI provider. The extension will automatically prompt you to enter your API key the first time you select a specific provider.

## Table of Contents
{: .no_toc }

1. TOC
{:toc}

## How API Keys Work

When you use the extension:
1. Select "Generate AI Image" from the Command Palette
2. Choose your preferred AI provider
3. If it's your first time using this provider:
   - You'll be prompted to enter your API key
   - The key will be securely stored for future use
4. For subsequent uses, the stored key will be used automatically

## Obtaining API Keys

### OpenAI DALL-E

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to the API section
4. Click "Create new secret key"
5. Copy your API key
6. Use it when prompted in VS Code

### Stable Diffusion

1. Go to [Stability AI](https://stability.ai)
2. Create an account and choose a subscription plan
3. Navigate to API Keys section
4. Generate a new API key
5. Copy your key
6. Use it when prompted in VS Code

### Together AI

1. Visit [Together AI Platform](https://together.ai)
2. Sign up for an account
3. Go to API section
4. Generate new API key
5. Copy your key
6. Use it when prompted in VS Code

### NVIDIA Consistory

1. Visit [NVIDIA Developer Portal](https://build.nvidia.com/explore/discover)
2. Create a developer account
3. Navigate to API section
4. Generate your API key
5. Copy your key
6. Use it when prompted in VS Code

### Replicate

1. Go to [Replicate](https://replicate.com)
2. Create an account
3. Navigate to Account Settings
4. Find or generate API token
5. Copy your token
6. Use it when prompted in VS Code

### Groq AI

1. Visit [Groq AI Console](https://console.groq.com/)
2. Sign up for an account
3. Navigate to API section
4. Generate new API key
5. Copy your key
6. Use it when prompted in VS Code

## 🔒 Security Best Practices

1. **Never share your API keys**
   - Keep keys private and secure
   - Don't commit them to version control
   - Don't share them in screenshots or logs

2. **Rotate keys regularly**
   - Change keys every few months
   - Immediately rotate if compromised
   - Keep track of key expiration dates

3. **Monitor usage**
   - Check API usage regularly
   - Set up usage alerts if available
   - Review billing statements

## Managing Stored Keys

The extension securely stores your API keys in VS Code's built-in secret storage. To update or remove a stored key:

1. Generate a new image using the desired provider
2. When prompted, enter your new API key
3. The old key will be automatically replaced

## ❗ Troubleshooting

If you encounter issues with your API keys:

1. **Invalid Key**
   - Verify the key is correctly copied
   - Check for extra spaces or characters
   - Ensure the key is not expired

2. **Authentication Errors**
   - Confirm you're using the correct key type
   - Check if your subscription is active
   - Verify billing information is up to date

3. **Rate Limiting**
   - Check your usage limits
   - Consider upgrading your plan
   - Implement request throttling

Need more help? Check our [Troubleshooting Guide](troubleshooting.html) or [open an issue](https://github.com/Amul-Thantharate/vscode-ai-image-generator/issues).
