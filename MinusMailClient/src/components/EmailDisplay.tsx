import React from 'react';
import DOMPurify from 'dompurify';
import root from 'react-shadow';

function EmailDisplay({ email }) {
  const htmlContent = email.htmlBody || '<p>No HTML content</p>';

  // Sanitize HTML
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);

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
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </root.div>
  );
}

export default EmailDisplay;