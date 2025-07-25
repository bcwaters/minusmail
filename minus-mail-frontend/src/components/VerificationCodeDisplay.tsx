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
          className={styles.copyButton}
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          📋
        </button>
      </div>
      <div className={styles.footer}>
        Click the clipboard icon to copy the code
      </div>
    </div>
  );
};

export default VerificationCodeDisplay; 