import React, { useState, useEffect } from 'react';
import root from 'react-shadow';
import { apiService } from '../services/ApiService';

interface EmailSidebarProps {
  email: string;
  setEmail: (email: string) => void;
}

function EmailSidebar({ email, setEmail }: EmailSidebarProps) {
  const [currentAddress, setCurrentAddress] = useState(email || 'DEFAULTADDRESS');
  const [inputValue, setInputValue] = useState(currentAddress);
  const [emailCount, setEmailCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Fetch email count when email address changes
  useEffect(() => {
    const fetchEmailCount = async () => {
      setIsLoading(true);
      try {
        const count = await apiService.getEmailCount(currentAddress);
        setEmailCount(count);
      } catch (error) {
        console.error('Error fetching email count:', error);
        setEmailCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentAddress) {
      fetchEmailCount();
    }
  }, [currentAddress]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    setCurrentAddress(inputValue);
    setEmail(inputValue);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleTriggerTestEmail = async () => {
    setIsTriggering(true);
    try {
      const success = await apiService.triggerTestEmail(currentAddress);
      if (success) {
        // Refresh email count after triggering
        const newCount = await apiService.getEmailCount(currentAddress);
        setEmailCount(newCount);
      }
    } catch (error) {
      console.error('Error triggering test email:', error);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <root.div>
      <style>{`
        input {
          margin-right: 8px;
          border: 2px solid blue;
          padding: 4px;
        }
        button {
          border: 2px solid green;
          padding: 4px 8px;
          margin: 2px;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        h1 {
          border: 2px solid red;
          margin: 0;
          padding: 8px;
        }
        p {
          border: 2px solid orange;
          margin: 4px 0;
          padding: 4px;
        }
        label {
          border: 2px solid purple;
          display: block;
          margin: 4px 0;
        }
        div {
          border: 2px solid brown;
          margin: 2px;
          padding: 2px;
        }
        .email-count {
          background-color: #e3f2fd;
          padding: 8px;
          margin: 8px 0;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
        }
        .loading {
          color: #666;
          font-style: italic;
        }
        .test-email-section {
          margin-top: 16px;
          padding: 8px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
      `}</style>
      <div>
        <h1>Email Sidebar</h1>
        <p>Current Address: <br/>{`${currentAddress}@minusmail.com`}</p>
        
        <div className="email-count">
          {isLoading ? (
            <span className="loading">Loading...</span>
          ) : (
            <>
              <div>📧 Email Count</div>
              <div>{emailCount} emails</div>
            </>
          )}
        </div>

        <div>
          <label htmlFor="email-input">Update Email Address:</label>
          <input
            id="email-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter username"
          />
          <button onClick={handleSubmit}>
            Update
          </button>
        </div>

        <div className="test-email-section">
          <label>Test Email:</label>
          <button 
            onClick={handleTriggerTestEmail}
            disabled={isTriggering}
          >
            {isTriggering ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </div>
    </root.div>
  );
}

export default EmailSidebar;