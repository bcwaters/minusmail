import React from 'react';
import type { EmailData } from '../services/ApiService';
import styles from './Inbox.module.css';

interface InboxProps {
  emailList: EmailData[];
  isLoading: boolean;
  emailData: EmailData | null;
  handleEmailSelect: (email: EmailData) => void;
}

const Inbox: React.FC<InboxProps> = ({ emailList, isLoading, emailData, handleEmailSelect }) => {
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox; 