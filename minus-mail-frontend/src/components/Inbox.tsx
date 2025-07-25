import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { EmailData } from '../services/ApiService';
import styles from './Inbox.module.css';

interface InboxProps {
  emailList: EmailData[];
  userEmail: string;
  isLoading: boolean;
  emailData: EmailData | null;
  handleEmailSelect: (email: EmailData) => void;
}

const Inbox: React.FC<InboxProps> = ({ emailList, isLoading, emailData, handleEmailSelect, userEmail }) => {
  const [now, setNow] = useState(Date.now());
  const [searchParams, setSearchParams] = useSearchParams();
  const [hostnameFilter, setHostnameFilter] = useState('');

  // Initialize filter from URL query parameter
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setHostnameFilter(filterParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Update URL when filter changes
  const updateFilter = (newFilter: string) => {
    setHostnameFilter(newFilter);
    
    if (newFilter.trim()) {
      setSearchParams({ filter: newFilter });
    } else {
      setSearchParams({});
    }
  };

  // Filter emails by hostname
  const filteredEmails = emailList.filter(email => {
    if (!hostnameFilter.trim()) return true;
    
    const fromEmail = email.from || '';
    const hostname = fromEmail.split('@')[1]?.toLowerCase() || '';
    return hostname.includes(hostnameFilter.toLowerCase());
  });

  const handleDownload = (email: EmailData) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${email.subject || 'No Subject'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2em; }
    .header { margin-bottom: 2em; }
    .label { font-weight: bold; }
    .content { border-top: 1px solid #ccc; margin-top: 2em; padding-top: 1em; }
  </style>
</head>
<body>
  <div class="header">
    <div><span class="label">Subject:</span> ${email.subject || 'No Subject'}</div>
    <div><span class="label">From:</span> ${email.from || 'Unknown'}</div>
    <div><span class="label">Received:</span> ${new Date(email.received).toLocaleString()}</div>
  </div>
  <div class="content">
    ${email.htmlBody || '<p>No HTML content</p>'}
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${email.subject ? email.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'email'}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div className={styles.inboxContainer}>
       <h4 className={styles.inboxTitleLabel}>{userEmail}@minusmail.com</h4>
      <h3 className={styles.inboxTitle}>Inbox ({filteredEmails.length}/{emailList.length})</h3>
      
      {/* Filter Section 
            <div className={styles.filterSection}>
        <div className={styles.filterInputContainer}>
          <input
            type="text"
            placeholder="Filter (e.g. gmail for admin@gmail.com)"
            value={hostnameFilter}
            onChange={(e) => updateFilter(e.target.value)}
            className={styles.filterInput}
          />
          {hostnameFilter && (
            <button
              onClick={() => updateFilter('')}
              className={styles.clearFilterButton}
              title="Clear filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>
*/}

      {isLoading ? (
        <div>Loading emails...</div>
      ) : filteredEmails.length === 0 ? (
        <div>
          {emailList.length === 0 ? 'No emails yet' : `No emails match "${hostnameFilter}"`}
        </div>
      ) : (
        <div className={styles.emailList}>
          {filteredEmails.map((email, index) => (
            <div
              key={index}
              onClick={() => handleEmailSelect(email)}
              className={
                emailData === email
                  ? `${styles.emailItem} ${styles.emailItemSelected}`
                  : styles.emailItem
              }
            >
              <div className={styles.emailSubject}>
                {email.subject || 'No Subject'}
              </div>
              <div className={styles.emailFrom}>
                From: {email.from}
              </div>
              <div className={styles.emailDate}>
                {new Date(email.received).toLocaleString()}
                {(() => {
                  const received = new Date(email.received);
                  const expires = new Date(received.getTime() + 15 * 60 * 1000);
                  const msLeft = expires.getTime() - now;
                  if (msLeft <= 0) return ' (expired)';
                  const min = Math.floor(msLeft / 60000);
                  const sec = Math.floor((msLeft % 60000) / 1000);
                  return ` (expires in ${min}:${sec.toString().padStart(2, '0')})`;
                })()}
              </div>
              <button
                type="button"
                className={styles.downloadButton}
                onClick={e => { e.stopPropagation(); handleDownload(email); }}
                title="Download as HTML"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox; 