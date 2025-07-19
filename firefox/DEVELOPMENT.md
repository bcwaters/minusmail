# MinusMail Firefox Extension - Development Guide

## Overview

This Firefox extension automatically fills verification codes from the MinusMail API into web forms. It detects verification code input fields and populates them with the latest code from your MinusMail account.

## File Structure

```
firefox/
├── manifest.json          # Extension configuration
├── content.js             # Content script (runs on web pages)
├── background.js          # Background script (handles API calls)
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── icons/                 # Extension icons
│   ├── icon-48.png
│   └── icon-96.png
├── README.md              # Basic description
└── DEVELOPMENT.md         # This file
```

## Development Setup

### 1. Load the Extension in Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the sidebar
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file from this directory

### 2. Testing the Extension

1. **API Key Setup**: Click the extension icon and enter your MinusMail API key
2. **Test Connection**: Use the "Test Connection" button to verify API connectivity
3. **Manual Code Retrieval**: Use "Get Latest Code" to manually fetch codes
4. **Automatic Filling**: Navigate to any website with verification code fields and click on them

### 3. Development Workflow

1. Make changes to the extension files
2. Go to `about:debugging` → "This Firefox"
3. Click "Reload" next to the MinusMail extension
4. Test your changes

## API Integration

The extension communicates with the MinusMail API at `https://api.minusmail.com`:

- **GET /verification-codes/latest** - Retrieve the latest verification code
- **GET /status** - Check API connection status

### Required Headers
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## Features

### Content Script (`content.js`)
- Detects verification code input fields using multiple selectors
- Listens for focus/click events on input fields
- Automatically fills codes when fields are activated
- Uses mutation observer to handle dynamically loaded content

### Background Script (`background.js`)
- Manages API communication
- Handles API key storage
- Provides status checking functionality
- Coordinates between content script and popup

### Popup Interface
- API key configuration
- Connection status display
- Manual code retrieval
- Test connection functionality

## Debugging

### Console Logs
- Content script logs appear in the web page console
- Background script logs appear in the browser console
- Popup logs appear in the popup console

### Common Issues
1. **API Key Not Set**: Check if the API key is properly saved
2. **CORS Issues**: Ensure the API endpoint allows Firefox extension requests
3. **Input Detection**: Verify the selectors match your target websites

## Building for Production

1. Create proper icons in the `icons/` directory
2. Update version number in `manifest.json`
3. Test thoroughly on target websites
4. Package the extension for distribution

## Security Considerations

- API keys are stored locally using browser storage
- No sensitive data is logged to console
- Extension only requests necessary permissions
- API communication uses HTTPS

## Contributing

1. Follow the existing code structure
2. Add appropriate error handling
3. Test on multiple websites
4. Update documentation as needed 