import React, { useState } from 'react';
import styles from './EmailSidebar.module.css';
import Modal from './Modal';

interface EmailInputProps {
  currentEmail: string;
  onEmailUpdate: (email: string) => void;
  isMobile?: boolean;
}

function EmailInput({ currentEmail, onEmailUpdate, isMobile = false }: EmailInputProps) {
  const [inputValue, setInputValue] = useState(currentEmail);
  const [isValid, setIsValid] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [keystrokeCount, setKeystrokeCount] = useState(0);

  // Email username validation rules
  const validateUsername = (username: string): boolean => {
    if (!username) return false;
    
    // Must be 3-64 characters long
    if (username.length < 0 || username.length > 64) return false;
    
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
    setKeystrokeCount(prev => prev + 1);
    
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
    setHasAttemptedSubmit(true);
    
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
      setIsModalOpen(false);
      setHasAttemptedSubmit(false);
      setKeystrokeCount(0);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleUpdateClick = () => {
    setInputValue('');
    setIsValid(false);
    setHasAttemptedSubmit(false);
    setKeystrokeCount(0);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setInputValue(currentEmail);
    setIsValid(true);
    setHasAttemptedSubmit(false);
    setKeystrokeCount(0);
  };

  // Mobile version - just show current email and update button
  if (isMobile) {
    return (
      <>
        <div className={styles['mobile-email-section']}>
          <div 
            className={styles['mobile-email-display']}
            style={{
              fontSize: (currentEmail || 'username').length > 15 ? '10px' : '12px'
            }}
          >
            {currentEmail || 'username'}@minusmail.com
          </div>
          <button 
            onClick={handleUpdateClick}
            className={styles['mobile-update-button']}
          >
            Update
          </button>
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={handleModalClose}
          title="Update Email Address"
        >
          <div className={styles['modal-content']}>
            <div className={styles['modal-input-group']}>
              <div className={styles['email-preview']}>
                <span 
                  className={styles['preview-email']}
                  style={{
                    fontSize: (inputValue.trim() || 'username').length > 12 ? '12px' : '14px'
                  }}
                >
                  {inputValue.trim() || 'username'}@minusmail.com
                </span>
              </div>
              <input
                id="modal-email-input"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter username"
                className={!isValid && inputValue.trim() !== '' ? styles['invalid-input'] : ''}
                autoFocus
              />
            </div>

            {!isValid && hasAttemptedSubmit && keystrokeCount > 3 && (
              <div className={styles['validation-error']}>
                Invalid format
              </div>
            )}
            <div className={styles['modal-actions']}>
              <button 
                onClick={handleModalClose}
                className={styles['modal-cancel-button']}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={!isValid}
                className={styles['modal-submit-button']}
              >
                Update
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Desktop version - original implementation
  return (
    <div className={styles['update-section']}>
      <div className={styles['domain-suffix']}>Current Address: {currentEmail || 'username'}@minusmail.com</div>
      <div className={styles['input-group']}>
        <div className={styles['input-wrapper']}>
          <input
            id="email-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter username"
            className={!isValid && inputValue.trim() !== '' ? styles['invalid-input'] : ''}
          />
        </div>
        <button onClick={handleSubmit} disabled={!isValid}>
          Update
        </button>
      </div>
      {!isValid && hasAttemptedSubmit && keystrokeCount > 3 && (
        <div className={styles['validation-error']}>
          Invalid format
        </div>
      )}
    </div>
  );
}

export default EmailInput; 