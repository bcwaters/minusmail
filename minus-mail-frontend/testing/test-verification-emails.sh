#!/bin/bash

# Test script to send 9 emails with verification codes in HTML body
# Usage: ./test-verification-emails.sh [email_address]

EMAIL_ADDRESS=${1:-"test@minusmail.com"}

echo "Sending test emails to: $EMAIL_ADDRESS"
echo "======================================"

# Email 1: Simple numeric verification code
echo "Sending Email 1: Simple numeric code..."
echo -e "From: noreply@example.com\nTo: $EMAIL_ADDRESS\nSubject: Your verification code\nContent-Type: text/html\n\n<html><body><p>Your verification code is: <strong>123456</strong></p><p>Please enter this code to complete your registration.</p></body></html>" | sendmail $EMAIL_ADDRESS

sleep 0.5

# Email 2: Alphanumeric OTP code
echo "Sending Email 2: Alphanumeric OTP..."
echo -e "From: security@service.com\nTo: $EMAIL_ADDRESS\nSubject: Security OTP\nContent-Type: text/html\n\n<html><body><h2>Security Alert</h2><p>Your OTP is: <span style='font-size: 24px; font-weight: bold; color: #007bff;'>ABC123</span></p><p>This code will expire in 10 minutes.</p></body></html>" | sendmail $EMAIL_ADDRESS

sleep 0.5

# Email 3: PIN code with different formatting
echo "Sending Email 3: PIN code..."
echo -e "From: support@company.com\nTo: $EMAIL_ADDRESS\nSubject: Your PIN Code\nContent-Type: text/html\n\n<html><body><div style='background: #f8f9fa; padding: 20px; border-radius: 8px;'><h3>Account Verification</h3><p>Please use this PIN to verify your account:</p><div style='background: #e9ecef; padding: 15px; text-align: center; font-family: monospace; font-size: 20px; font-weight: bold;'>789012</div></div></body></html>" | sendmail $EMAIL_ADDRESS

sleep 0.5

# Email 4: Standalone code without keywords
echo "Sending Email 4: Standalone code..."
echo -e "From: system@platform.com\nTo: $EMAIL_ADDRESS\nSubject: Access Code\nContent-Type: text/html\n\n<html><body><p>Welcome to our platform!</p><p>Here is your access code:</p><h1 style='text-align: center; color: #28a745; font-family: monospace; letter-spacing: 4px;'>456789</h1><p>Use this code to access your account.</p></body></html>" | sendmail $EMAIL_ADDRESS

sleep 0.5

# Email 5: Twilio verification email sample
echo "Sending Email 5: Twilio verification email..."
echo -e "From: no-reply@twilio.com\nTo: $EMAIL_ADDRESS\nSubject: Verify your Email\nContent-Type: text/html\n\n<html><body><p>You need to verify your email address to continue using your Twilio account. Enter the following code to verify your email address:</p><p><span id='verification-code'>NQWGBH</span></p><p>The request for this access originated from IP address 66.169.247.61</p></body></html>" | sendmail $EMAIL_ADDRESS

    sleep 0.5

# Email 6: Canvas verification email sample
echo "Sending Email 6: Canvas verification email..."
echo -e "From: no-reply@canva.com\nTo: $EMAIL_ADDRESS\nSubject: Your Canva code is 819746\nContent-Type: text/html\n\n<html><body><p>Enter 819746 in the next 10 mins to continue with Canva</p><p style='margin-top:0;margin-bottom:0'>819746</p></body></html>" | sendmail $EMAIL_ADDRESS

sleep 0.5

# Email 7: X (Twitter) verification email sample
echo "Sending Email 7: X verification email..."
echo -e "From: info@x.com\nTo: $EMAIL_ADDRESS\nSubject: 217438 is your X verification code\nContent-Type: text/html\n\n<html><body><p>Please enter this verification code to get started on X:</p><h1 style='font-size: 32px; font-weight: bold; line-height: 36px;'>217438</h1><p>Verification codes expire after two hours.</p></body></html>" | sendmail $EMAIL_ADDRESS

sleep 0.5

# Email 8: No subject line test case
echo "Sending Email 8: No subject line..."
echo -e "From: noreply@testservice.com\nTo: $EMAIL_ADDRESS\nContent-Type: text/html\n\n<html><body><p>Your verification code: <strong>987654</strong></p><p>Please use this code to complete your verification.</p></body></html>" | sendmail $EMAIL_ADDRESS

sleep 0.5

# Email 9: WhisperAI false positive test case (should return null)
echo "Sending Email 9: WhisperAI false positive test..."
echo -e "From: whisperai@mail.beehiiv.com\nTo: $EMAIL_ADDRESS\nSubject: Welcome to WhisperAI\nContent-Type: text/html\n\n<html><body><p>Welcome to WhisperAI!</p><p>This email contains CSS color codes like #121216, #595959, #697882 that should NOT be extracted as verification codes.</p><p>There is no actual verification code in this email.</p></body></html>" | sendmail $EMAIL_ADDRESS

sleep 0.5

# Email 10: No verification code
echo "Sending Email 10: No verification code..."
echo -e "From: noreply@testservice.com\nTo: $EMAIL_ADDRESS\nSubject: un related email\nContent-Type: text/html\n\n<html><body><p>This email does not contain a random string.</p></body></html>" | sendmail $EMAIL_ADDRESS

echo ""
echo "✅ All 9 test emails sent successfully!"
echo ""
echo "Expected verification codes:"
echo "1. 123456 (simple numeric)"
echo "2. ABC123 (alphanumeric OTP)"
echo "3. 789012 (PIN code)"
echo "4. 456789 (standalone code)"
echo "5. NQWGBH (Twilio verification code)"
echo "6. 819746 (Canvas verification code)"
echo "7. 217438 (X verification code)"
echo "8. 987654 (no subject line)"
echo "9. null (WhisperAI false positive - should NOT extract CSS color codes)"
echo "10. null (No verification code)"
echo ""
echo "Check your MinusMail inbox to see the verification code extraction in action!" 