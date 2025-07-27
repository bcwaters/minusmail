import React from 'react';
import styles from './VerificationCodeDisplay.module.css';

interface VerificationCodeDisplayProps {
  code: string;
  onCopy?: () => void;
}

const VerificationCodeDisplay: React.FC<VerificationCodeDisplayProps> = ({ code, onCopy }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      onCopy?.();
    } catch (err) {
      // console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>

        <span className={styles.title}>Possible Verification Code Detected!</span>
      </div>
      <div className={styles.codeContainer}>
        <span className={styles.code}>{code}</span>
        <button 
          className={styles['copy-text-button']}
          onClick={handleCopy}
          title="Copy to clipboard"
        >
         <svg className={styles['copy-icon']} viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
        </button>
      </div>
      
    </div>
  );
};

export default VerificationCodeDisplay; 