import DOMPurify from 'dompurify';
import styles from './EmailDisplay.module.css';
import type { EmailData } from '../services/ApiService'

interface EmailDisplayProps {
  email: EmailData | null;
}

function EmailDisplay({ email }: EmailDisplayProps) {
  console.log('EmailDisplay', email);
  
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