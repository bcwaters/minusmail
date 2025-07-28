import React from 'react';
import styles from '../styles/InboxIcon.module.css';

interface InboxIconProps {
  emailCount: number;
  onClick: () => void;
  isMobile?: boolean;
}

const InboxIcon: React.FC<InboxIconProps> = ({ emailCount, onClick, isMobile = false }) => {
  return (
    <button 
      className={styles.inboxIcon}
      onClick={onClick}
      title="Open Inbox"
    >
      <svg 
        width={isMobile ? "40" : "32"} 
        height={isMobile ? "40" : "32"} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      {emailCount > 0 && (
        <span className={styles.badge}>
          {emailCount > 99 ? '99+' : emailCount}
        </span>
      )}
    </button>
  );
};

export default InboxIcon; 