import React, { useState } from 'react';
import root from 'react-shadow';

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
    setCurrentAddress(inputValue);
    setEmail(inputValue);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
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
      `}</style>
      <div>
        <h1>Email Sidebar</h1>
        <p>Current Address: <br/>{`${currentAddress}@minusmail.com`}</p>

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
      </div>
    </root.div>
  );
}

export default EmailSidebar;