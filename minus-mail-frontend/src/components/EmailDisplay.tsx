import DOMPurify from 'dompurify';
import { useState, useEffect } from 'react';
import styles from './EmailDisplay.module.css';
import type { EmailData } from '../services/ApiService';
import { extractVerificationCodeFromEmail } from '../utils/verificationCodeExtractor';
import VerificationCodeDisplay from './VerificationCodeDisplay';

interface EmailDisplayProps {
  email: EmailData | null;
}

function EmailDisplay({ email }: EmailDisplayProps) {
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

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
  
  if (!email) {
    return (
      <div className={styles['no-email']}>
        Select an email to view its content
      </div>
    );
  }

  const htmlContent = email?.htmlBody || '<p>No HTML content</p>';
  const textContent = email?.textBody || 'No text content';

  // Sanitize HTML
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);
  //append text content to the html content
  const htmlWithText = sanitizedHtml + '<p> text content: <br/>' + textContent + '</p>';

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
          Code copied to clipboard!
        </div>
      )}
      <div className={styles['email-header']}>
        <div className={styles['email-subject']}>
          {email.subject || 'No Subject'}
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
        dangerouslySetInnerHTML={{ __html: htmlWithText }}
      />
    </div>
  );
}

export default EmailDisplay;