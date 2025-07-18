import React, { useEffect, useState } from 'react';
import type { EmailData } from '../services/ApiService';
import styles from './Inbox.module.css';

interface InboxProps {
  emailList: EmailData[];
  isLoading: boolean;
  emailData: EmailData | null;
  handleEmailSelect: (email: EmailData) => void;
}

const Inbox: React.FC<InboxProps> = ({ emailList, isLoading, emailData, handleEmailSelect }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.inboxContainer}>
      <h3 className={styles.inboxTitle}>📬 Inbox ({emailList.length})</h3>
      {isLoading ? (
        <div>Loading emails...</div>
      ) : emailList.length === 0 ? (
        <div>No emails yet</div>
      ) : (
        <div className={styles.emailList}>
          {emailList.map((email, index) => (
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
                  const expires = new Date(received.getTime() + 10 * 60 * 1000);
                  const msLeft = expires.getTime() - now;
                  if (msLeft <= 0) return ' (expired)';
                  const min = Math.floor(msLeft / 60000);
                  const sec = Math.floor((msLeft % 60000) / 1000);
                  return ` (expires in ${min}:${sec.toString().padStart(2, '0')})`;
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox; 