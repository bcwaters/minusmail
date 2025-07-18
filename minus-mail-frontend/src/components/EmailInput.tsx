import React, { useState } from 'react';
import styles from './EmailSidebar.module.css';

interface EmailInputProps {
  currentEmail: string;
  onEmailUpdate: (email: string) => void;
}

function EmailInput({ currentEmail, onEmailUpdate }: EmailInputProps) {
  const [inputValue, setInputValue] = useState(currentEmail);
  const [isValid, setIsValid] = useState(true);

  // Email username validation rules
  const validateUsername = (username: string): boolean => {
    if (!username) return false;
    
    // Must be 3-64 characters long
    if (username.length < 3 || username.length > 64) return false;
    
    // Must start with a letter or number
    if (!/^[a-zA-Z0-9]/.test(username)) return false;
    
    // Must end with a letter or number
    if (!/[a-zA-Z0-9]$/.test(username)) return false;
    
    // Can only contain letters, numbers, dots, hyphens, and underscores
    // Dots cannot be consecutive or at the beginning/end
    const validPattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
    if (!validPattern.test(username)) return false;
    
    // No consecutive dots
    if (username.includes('..')) return false;
    
    return true;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    
    // Validate the cleaned input
    let cleanInput = value.trim();
    if (cleanInput.endsWith('@minusmail.com')) {
      cleanInput = cleanInput.slice(0, -13);
    }
    if (cleanInput.startsWith('@')) {
      cleanInput = cleanInput.slice(1);
    }
    
    setIsValid(validateUsername(cleanInput));
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
    
    // Only submit if valid
    if (validateUsername(cleanInput)) {
      onEmailUpdate(cleanInput);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className={styles['update-section']}>
      <div className={styles['domain-suffix']}>{inputValue || 'username'}@minusmail.com</div>
      <div className={styles['input-group']}>
        <div className={styles['input-wrapper']}>
          <input
            id="email-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter username"
            className={!isValid ? styles['invalid-input'] : ''}
          />
        </div>
        <button onClick={handleSubmit} disabled={!isValid}>
          Update
        </button>
      </div>
      {!isValid && (
        <div className={styles['validation-error']}>
          Invalid format
        </div>
      )}
    </div>
  );
}

export default EmailInput; 