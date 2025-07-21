import { extractVerificationCodeFromEmail } from '../utils/verificationCodeExtractor';

/**
 * Test utility for verification code extraction
 * You can use this in the browser console to test the functionality
 */
export const testVerificationCodeExtraction = () => {
  const testEmails = [
    {
      name: 'Simple numeric code',
      html: '<p>Your verification code is: 123456</p>',
      text: 'Your verification code is: 123456'
    },
    {
      name: 'Alphanumeric code',
      html: '<p>Your OTP is: ABC123</p>',
      text: 'Your OTP is: ABC123'
    },
    {
      name: 'Code with keyword',
      html: '<p>Please enter this verification code: 789012</p>',
      text: 'Please enter this verification code: 789012'
    },
    {
      name: 'Standalone code',
      html: '<p>Here is your code</p><h2>456789</h2>',
      text: 'Here is your code 456789'
    },
    {
      name: 'Complex HTML',
      html: `
        <div>
          <h1>Welcome to our service</h1>
          <p>Your verification code is: <strong>987654</strong></p>
          <p>Please enter this code to complete your registration.</p>
        </div>
      `,
      text: 'Welcome to our service. Your verification code is: 987654. Please enter this code to complete your registration.'
    },
    {
      name: 'No code present',
      html: '<p>Thank you for your email. We will get back to you soon.</p>',
      text: 'Thank you for your email. We will get back to you soon.'
    }
  ];

  console.log('🧪 Testing Verification Code Extraction');
  console.log('=====================================');

  testEmails.forEach((testCase, index) => {
    const result = extractVerificationCodeFromEmail(testCase.html, testCase.text);
    console.log(`\n${index + 1}. ${testCase.name}:`);
    console.log(`   HTML: ${testCase.html.substring(0, 50)}...`);
    console.log(`   Text: ${testCase.text.substring(0, 50)}...`);
    console.log(`   Result: ${result ? `✅ "${result}"` : '❌ No code found'}`);
  });

  console.log('\n🎯 Test completed!');
};

/**
 * Test a custom email
 * @param html - HTML content
 * @param text - Text content
 */
export const testCustomEmail = (html: string, text: string) => {
  console.log('🧪 Testing Custom Email');
  console.log('======================');
  console.log(`HTML: ${html}`);
  console.log(`Text: ${text}`);
  
  const result = extractVerificationCodeFromEmail(html, text);
  console.log(`Result: ${result ? `✅ "${result}"` : '❌ No code found'}`);
  
  return result;
};

// Make functions available globally for browser console testing
// This ensures they're available immediately when the script loads
declare global {
  interface Window {
    testVerificationCodeExtraction: typeof testVerificationCodeExtraction;
    testCustomEmail: typeof testCustomEmail;
    extractVerificationCodeFromEmail: typeof extractVerificationCodeFromEmail;
  }
}

// Attach to window object
if (typeof window !== 'undefined') {
  window.testVerificationCodeExtraction = testVerificationCodeExtraction;
  window.testCustomEmail = testCustomEmail;
  window.extractVerificationCodeFromEmail = extractVerificationCodeFromEmail;
  
  // Also log to confirm they're available
  console.log('🔧 Verification code test functions loaded!');
  console.log('Available functions:');
  console.log('- testVerificationCodeExtraction()');
  console.log('- testCustomEmail(html, text)');
  console.log('- extractVerificationCodeFromEmail(html, text)');
} 