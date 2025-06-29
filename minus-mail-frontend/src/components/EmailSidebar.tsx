import React, { useState } from 'react';
import styles from './EmailSidebar.module.css';

interface EmailSidebarProps {
  email: string;
  setEmail: (email: string) => void;
}

function EmailSidebar({ email, setEmail }: EmailSidebarProps) {
  const [currentAddress, setCurrentAddress] = useState(email || 'DEFAULTADDRESS');
  const [inputValue, setInputValue] = useState(currentAddress);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    // Strip @minusmail.com if present and clean the input
    let cleanInput = inputValue.trim();
    if (cleanInput.endsWith('@minusmail.com')) {
      cleanInput = cleanInput.slice(0, -13); // Remove '@minusmail.com'
    }
    // Remove any @ symbol if user typed it
    if (cleanInput.startsWith('@')) {
      cleanInput = cleanInput.slice(1);
    }
    
    setCurrentAddress(cleanInput);
    setEmail(cleanInput);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className={styles['email-sidebar']}>
      <div className={styles['current-address']}>
        <div className={styles['current-address-label']}>Current Address</div>
        <div className={styles['current-address-value']}>{`${currentAddress}@minusmail.com`}</div>
      </div>

      <div className={styles['update-section']}>
        <label htmlFor="email-input">Update Email Address</label>
        <div className={styles['input-group']}>
          <div className={styles['input-wrapper']}>
            <input
              id="email-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter username"
            />
          </div>
          <button onClick={handleSubmit}>
            Update
          </button>
        </div>
        <div className={styles['domain-suffix']}>@{inputValue || 'username'}.minusmail.com</div>
      </div>
    </div>
  );
}

export default EmailSidebar;