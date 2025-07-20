# Verification Code Extraction Feature

This feature automatically detects and displays verification codes from emails in a prominent, user-friendly way.

## How It Works

When an email is viewed, the system automatically:

1. **Extracts text content** from both HTML and plain text versions of the email
2. **Searches for verification codes** using multiple regex patterns
3. **Displays the code prominently** if found, with a copy-to-clipboard feature

## Supported Code Patterns

The system can detect verification codes in these formats:

1. **Codes near keywords**: Codes that appear near words like "code", "verification", "pin", "OTP"
   - Example: "Your verification code is: 123456"
   - Example: "OTP: ABC123"

2. **Standalone numeric codes**: 4-8 digit numbers
   - Example: "123456", "78901234"

3. **Standalone alphanumeric codes**: 4-8 character codes with letters and numbers
   - Example: "ABC123", "XYZ7890"

## Features

### Visual Display
- **Prominent styling**: Gradient background with shimmer animation
- **Large, readable font**: Monospace font with letter spacing for easy reading
- **Copy button**: One-click copy to clipboard functionality
- **Success feedback**: Visual confirmation when code is copied

### Responsive Design
- Works on desktop and mobile devices
- Adaptive sizing and spacing for different screen sizes

## Testing the Feature

### Browser Console Testing
You can test the verification code extraction in the browser console:

```javascript
// Run comprehensive tests
testVerificationCodeExtraction()

// Test a custom email
testCustomEmail('<p>Your code is: 123456</p>', 'Your code is: 123456')
```

### Test Cases Included
The test suite includes various scenarios:
- Simple numeric codes
- Alphanumeric codes
- Codes with different keywords
- Standalone codes
- Complex HTML structures
- Emails without codes

## Implementation Details

### Files Added/Modified

1. **`src/utils/verificationCodeExtractor.ts`**
   - Core extraction logic
   - HTML parsing and text extraction
   - Regex pattern matching

2. **`src/components/VerificationCodeDisplay.tsx`**
   - React component for displaying codes
   - Copy-to-clipboard functionality
   - Visual styling

3. **`src/components/VerificationCodeDisplay.module.css`**
   - Styling for the verification code display
   - Animations and responsive design

4. **`src/components/EmailDisplay.tsx`** (modified)
   - Integration of verification code detection
   - Automatic display when codes are found

5. **`src/components/EmailDisplay.module.css`** (modified)
   - Added styles for copy feedback

6. **`src/utils/testVerificationCode.ts`**
   - Testing utilities for development and debugging

### How to Extend

To add new code patterns, modify the `patterns` array in `verificationCodeExtractor.ts`:

```typescript
const patterns = [
  // Add your new pattern here
  /your-new-pattern/,
  // ... existing patterns
];
```

## Usage

The feature works automatically - no user interaction required:

1. **View any email** in the MinusMail interface
2. **If a verification code is detected**, it will appear prominently above the email content
3. **Click the clipboard icon** to copy the code to your clipboard
4. **Use the code** wherever you need it

## Browser Compatibility

- **Modern browsers**: Full support with clipboard API
- **Older browsers**: Fallback to manual selection (code is still displayed)
- **Mobile browsers**: Touch-friendly interface with responsive design

## Security Considerations

- **No data storage**: Verification codes are only extracted and displayed, never stored
- **Client-side only**: All processing happens in the browser
- **Sanitized HTML**: Uses DOMPurify to prevent XSS attacks
- **Ephemeral**: Codes disappear when emails are deleted (15-minute TTL) 