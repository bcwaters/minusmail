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

### Visual Feedback (Recommended)
The extension now provides visual feedback through toast notifications:
- **Green toast**: Success (code filled)
- **Red toast**: Error (username not available, no input found)
- **Blue toast**: Info messages

**To test:**
1. Navigate to any website with verification code inputs
2. Click or focus on the input field
3. Look for toast notifications in the top-right corner of the page

### Console Logs

#### Method 1: Browser Console (Recommended)
1. Press `Ctrl+Shift+J` (or `Cmd+Shift+J` on Mac) to open Browser Console
2. In the dropdown at the top, select your extension's content script
3. View all MinusMail debug logs

#### Method 2: Extension Debugging Console
1. Go to `about:debugging` in Firefox
2. Click "This Firefox" tab
3. Find your MinusMail extension in the list
4. Click "Inspect" next to the extension
5. This opens a dedicated console for your extension

#### Method 3: Web Console with Content Script Filter
1. Press `F12` and go to Console tab
2. Look for a filter option and select "Content Scripts" or your extension name
3. View MinusMail logs there

### Debug Information Available

The extension logs detailed information about:
- **Username loading**: When username is loaded from background script
- **Field detection**: How many email/verification inputs are found
- **Event listeners**: When listeners are attached to input fields
- **Autocomplete process**: Step-by-step autocomplete execution
- **Error conditions**: Why autocomplete might fail

### Common Issues
1. **API Key Not Set**: Check if the API key is properly saved
2. **CORS Issues**: Ensure the API endpoint allows Firefox extension requests
3. **Input Detection**: Verify the selectors match your target websites
4. **Username Not Loaded**: Check if background script successfully loaded username
5. **No Toast Notifications**: Ensure content script is running on the page

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