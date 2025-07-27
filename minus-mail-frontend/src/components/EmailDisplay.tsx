import DOMPurify from 'dompurify';
import { useState, useEffect } from 'react';
import styles from './EmailDisplay.module.css';
import type { EmailData } from '../services/ApiService';
import { extractVerificationCodeFromEmail } from '../utils/verificationCodeExtractor';
import VerificationCodeDisplay from './VerificationCodeDisplay';

interface EmailDisplayProps {
  email: EmailData | null;
  username?: string;
}

function EmailDisplay({ email, username }: EmailDisplayProps) {
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [showTextCopyFeedback, setShowTextCopyFeedback] = useState(false);

  // console.log('EmailDisplay', email);
  
  // Extract verification code when email changes
  useEffect(() => {
    if (email) {
      const code = extractVerificationCodeFromEmail(email.htmlBody || '', email.textBody || '');
      setVerificationCode(code);
    } else {
      setVerificationCode(null);
    }
  }, [email]);

  const handleCopySuccess = () => {
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  const handleCopyTextToClipboard = async () => {
    const textContent = email?.textBody || 'No text content';
    try {
      await navigator.clipboard.writeText(textContent);
      setShowTextCopyFeedback(true);
      setTimeout(() => setShowTextCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  if (!email) {
    if (window.innerWidth <= 700) {
      return (
      
          <div className={styles['no-email-content']}>
            <p>This is your temporary email inbox for <strong>{username || 'your username'}@minusmail.com</strong></p>
            <p>Check your inbox in the top left to view emails</p>
            <p>You can always update your email address to any other username</p>
          </div>
   
      );
    }
    return (
   
        <div className={styles['no-email-content']}>
          <p>This is your temporary email inbox for <strong>{username || 'your username'}@minusmail.com</strong></p>
          <p>Select an email from the sidebar to view its content</p>
          <p>You can always update your email address to any other username</p>
        </div>

    );
  }

  const htmlContent = email?.htmlBody || email?.textBody || '<p>No content</p>';

  // Sanitize HTML
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);

  return (
    <div className={styles['email-container']}>
            {/* Display verification code if found */}
            {verificationCode && (
        <VerificationCodeDisplay 
          code={verificationCode} 
          onCopy={handleCopySuccess}
        />
      )}
      
      {/* Show copy feedback */}
      {showCopyFeedback && (
        <div className={styles['copy-feedback']}>
          Code copied!
        </div>
      )}

      {/* Show text copy feedback */}
      {showTextCopyFeedback && (
        <div className={styles['copy-feedback']}>
          Email copied!
        </div>
      )}

      <div className={styles['email-header']}>
        <div className={styles['header-top-row']}>
          <div className={styles['email-subject']}>
            {email.subject || 'No Subject'}
            
          </div>
          <div className={styles['copy-button-container']}>
            <button 
              className={styles['copy-text-button']}
              onClick={handleCopyTextToClipboard}
              title="Copy plain text to clipboard"
            >
              <svg className={styles['copy-icon']} viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>

            </button>
            <div className={styles['copy-button-label']}>Copy email</div>
          </div>

        </div>
        <div className={styles['email-field']}>
          <div className={styles['email-field-label']}>From:</div>
          <div className={styles['email-field-value']}>{email.from || 'Unknown'}</div>
        </div>
        <div className={styles['email-field']}>
          <div className={styles['email-field-label']}>Date:</div>
          <div className={styles['email-field-value']}>
            {email.received ? new Date(email.received).toLocaleString() : 'Unknown'}
          </div>
        </div>
      </div>
      
      <div
        className={styles['email-content']}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
 
    </div>
  );
}

export default EmailDisplay;