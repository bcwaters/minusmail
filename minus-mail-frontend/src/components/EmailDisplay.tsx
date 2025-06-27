import DOMPurify from 'dompurify';
import root from 'react-shadow';
import type { EmailData } from '../services/ApiService'

interface EmailDisplayProps {
  email: EmailData | null;
}

function EmailDisplay({ email }: EmailDisplayProps) {
  console.log('EmailDisplay', email);
  const htmlContent = email?.htmlBody || '<p>No HTML content</p>';
  const textContent = email?.textBody || 'No text content';

  // Sanitize HTML
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);
  //append text content to the html content
  const htmlWithText = sanitizedHtml + '<p> text content: <br/>' + textContent + '</p>';

  return (
    <root.div>
      <style>{`
        .email-content {
          border: 1px solid #ddd;
          padding: 16px;
          max-width: 600px;
          margin: 0 auto;
          overflow-x: auto;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
      <div
        className="email-content"
        dangerouslySetInnerHTML={{ __html: htmlWithText }}
      />
    </root.div>
  );
}

export default EmailDisplay;