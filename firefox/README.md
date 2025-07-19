# MinusMail Firefox Extension

A Firefox browser extension that automatically fills verification codes from the MinusMail API into web forms.

## Features

- **Automatic Code Detection**: Detects verification code input fields on web pages
- **One-Click Filling**: Click on any verification code field to auto-fill with the latest code
- **API Integration**: Connects to MinusMail API to retrieve verification codes
- **Secure Storage**: Safely stores your API key locally
- **Status Monitoring**: Real-time connection status and error reporting

## Quick Start

1. **Load the Extension**:
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox" → "Load Temporary Add-on..."
   - Select the `manifest.json` file from this directory

2. **Configure API Key**:
   - Click the MinusMail extension icon in your toolbar
   - Enter your MinusMail API key
   - Click "Save API Key"

3. **Start Using**:
   - Navigate to any website with verification code fields
   - Click on the verification code input field
   - The code will be automatically filled

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development instructions.

## Files

- `manifest.json` - Extension configuration
- `content.js` - Content script for web page interaction
- `background.js` - Background script for API communication
- `popup.html/css/js` - Extension popup interface
- `icons/` - Extension icons (add your own 48x48 and 96x96 PNG files)

## API Requirements

The extension requires a MinusMail API key and communicates with:
- `https://api.minusmail.com/verification-codes/latest`
- `https://api.minusmail.com/status`

## License

MIT License - see LICENSE file for details.