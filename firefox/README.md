# MinusMail Firefox Extension

A Firefox extension that provides autocomplete functionality for verification codes using the MinusMail API.

## Features

- **Automatic Username Generation**: Each user gets a unique username upon installation
- **Username Customization**: Users can update their username anytime through the popup
- **Verification Code Autocomplete**: Automatically fills verification code fields
- **Real-time Status**: Shows connection status to MinusMail API
- **Manual Code Retrieval**: Get latest verification codes manually

## Installation

1. Download the extension files
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" tab
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file

## First-Time Setup

When you first install the extension:

1. A unique username will be automatically generated (e.g., `swift_fox123`, `blue_cat456`)
2. You'll receive a browser notification with your username
3. The popup will show a welcome message with your username
4. You can change your username anytime using the popup interface

## Username Generation

The extension generates unique usernames using three different strategies:

1. **Random**: `user_XXXXXX` format with random alphanumeric characters
2. **Adjective + Noun**: `swift_fox123`, `brave_lion456` format
3. **Color + Animal**: `blue_cat789`, `red_dragon321` format

Each username includes a random number to ensure uniqueness.

## Usage

### Verification Code Autocomplete
- Click on any verification code input field
- The extension will automatically fill it with the latest code from MinusMail

### Manual Operations
- Use the popup to test API connection
- Manually retrieve verification codes
- Update your username
- Generate a new unique username

## Development

See `DEVELOPMENT.md` for development setup and testing instructions.

## Files

- `manifest.json` - Extension configuration
- `content.js` - Content script for web page interaction
- `background.js` - Background script for API communication
- `popup.html/css/js` - Extension popup interface
- `icons/` - Extension icons (add your own 48x48 and 96x96 PNG files)

## API Requirements

