// Popup script for MinusMail Firefox extension
// Handles user interface interactions and communication with background script

class MinusMailPopup {
  constructor() {
    this.username = null;
    this.init();
  }

  init() {
    // Load initial state
    this.checkStatus();
    
    // Get username from background script (with small delay to allow installation to complete)
    setTimeout(() => {
      this.getUsername();
    }, 100);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Listen for username loaded notifications
    this.setupMessageListener();
    
    // Check if this is a new installation
    this.checkForNewInstallation();
  }

  setupMessageListener() {
    // Listen for messages from background script
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'USERNAME_LOADED') {
        this.username = message.username;
        this.updateUsernameDisplay();
        this.getUserInfo(); // Refresh user info with new username
      }
    });
  }

  async getUsername() {
    try {
      const response = await browser.runtime.sendMessage({
        type: 'GET_CURRENT_USERNAME'
      });
      
      if (response.username) {
        this.username = response.username;
        this.updateUsernameDisplay();
        this.getUserInfo(); // Get user info with the username
      } else {
        // No username available yet (fresh installation)
        this.username = null;
        this.updateUsernameDisplay();
        // Don't call getUserInfo() until we have a username
      }
    } catch (error) {
      console.error('Error getting username:', error);
      this.username = null;
      this.updateUsernameDisplay();
    }
  }

  updateUsernameDisplay() {
    const usernameLabel = document.getElementById('current-username');
    const usernameField = document.getElementById('username');
    
    if (usernameLabel) {
      if (this.username) {
        usernameLabel.textContent = this.username;
      } else {
        usernameLabel.textContent = 'Generating unique username...';
      }
    }
    
    if (usernameField) {
      usernameField.value = this.username || '';
    }
  }

  async getUserInfo() {
    if (!this.username) {
      // No username available yet, don't make API calls
      const inboxField = document.getElementById('inbox');
      if (inboxField) {
        inboxField.value = 'Waiting for username...';
      }
      return;
    }
    
    try {
      console.log(`Fetching emails for user: ${this.username}`);
      const response = await fetch(`http://localhost:3005/email/username/${this.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data);
        
        // Set the email count
        const inboxField = document.getElementById('inbox');
        if (inboxField && data.emailCount !== undefined) {
          inboxField.value = `${data.emailCount} emails`;
        } else if (inboxField) {
          // If emailCount is not in response, try to count emails array
          if (data.emails && Array.isArray(data.emails)) {
            inboxField.value = `${data.emails.length} emails`;
          } else {
            inboxField.value = '0 emails';
          }
        }
      } else {
        console.error('Failed to fetch emails:', response.status);
        this.setDefaultValues();
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      this.setDefaultValues();
    }
  }

  setDefaultValues() {
    // Set default values if API call fails
    const usernameLabel = document.getElementById('current-username');
    const usernameField = document.getElementById('username');
    
    if (usernameLabel) {
      if (this.username) {
        usernameLabel.textContent = this.username;
      } else {
        usernameLabel.textContent = 'Generating unique username...';
      }
    }
    
    if (usernameField) {
      usernameField.value = this.username || '';
    }
    
    const inboxField = document.getElementById('inbox');
    if (inboxField) {
      if (this.username) {
        inboxField.value = '0 emails';
      } else {
        inboxField.value = 'Waiting for username...';
      }
    }
  }

  setupEventListeners() {
    // Get latest code button
    document.getElementById('get-code').addEventListener('click', () => {
      this.getLatestCode();
    });

    // Test connection button
    document.getElementById('test-connection').addEventListener('click', () => {
      this.testConnection();
    });

    // Save username button
    document.getElementById('save-username').addEventListener('click', () => {
      this.saveUsername();
    });

    // Generate new username button
    document.getElementById('generate-username').addEventListener('click', () => {
      this.generateNewUsername();
    });

    // Allow Enter key to save username
    document.getElementById('username').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveUsername();
      }
    });
  }

  async saveUsername() {
    const usernameField = document.getElementById('username');
    const newUsername = usernameField.value.trim();
    
    if (!newUsername) {
      this.showMessage('Please enter a username', 'error');
      return;
    }
    
    try {
      // Save username to storage via background script
      const response = await browser.runtime.sendMessage({
        type: 'SAVE_USERNAME',
        username: newUsername
      });
      
      if (response.success) {
        this.username = newUsername;
        this.updateUsernameDisplay();
        this.showMessage(`Username saved successfully: ${newUsername}`, 'success');
        this.getUserInfo(); // Refresh user info with new username
      } else {
        this.showMessage(`Error saving username: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Error saving username:', error);
      this.showMessage('Error saving username', 'error');
    }
  }

  async generateNewUsername() {
    try {
      // Generate new username via background script
      const response = await browser.runtime.sendMessage({
        type: 'GENERATE_USERNAME'
      });
      
      if (response.success) {
        this.username = response.username;
        this.updateUsernameDisplay();
        this.showMessage(`New username generated: ${response.username}`, 'success');
        this.getUserInfo(); // Refresh user info with new username
      } else {
        this.showMessage(`Error generating username: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Error generating username:', error);
      this.showMessage('Error generating username', 'error');
    }
  }

  async getLatestCode() {
    try {
      const response = await browser.runtime.sendMessage({
        type: 'REQUEST_CODE'
      });
      
      if (response.error) {
        this.showMessage(`Error: ${response.error}`, 'error');
      } else if (response.code) {
        this.showMessage(`Latest code: ${response.code}`, 'success');
        
        // Copy to clipboard if possible
        try {
          await navigator.clipboard.writeText(response.code);
          this.showMessage(`Code copied to clipboard: ${response.code}`, 'success');
        } catch (clipboardError) {
          console.log('Clipboard not available');
        }
      }
    } catch (error) {
      console.error('Error getting latest code:', error);
      this.showMessage('Error getting latest code', 'error');
    }
  }

  async testConnection() {
    try {
      const response = await browser.runtime.sendMessage({
        type: 'GET_STATUS'
      });
      
      if (response.error) {
        this.showMessage(`Error: ${response.error}`, 'error');
      } else if (response.status) {
        this.updateStatus(response.status);
        this.showMessage(response.status.message, response.status.connected ? 'success' : 'error');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      this.showMessage('Error testing connection', 'error');
    }
  }

  async checkStatus() {
    try {
      const response = await browser.runtime.sendMessage({
        type: 'GET_STATUS'
      });
      
      if (response.error) {
        this.updateStatus({ connected: false, message: 'Error checking status' });
      } else if (response.status) {
        this.updateStatus(response.status);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      this.updateStatus({ connected: false, message: 'Error checking status' });
    }
  }

  updateStatus(status) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('status-text');
    
    // Remove existing classes
    statusDot.classList.remove('connected', 'error', 'warning');
    
    if (status.connected) {
      statusDot.classList.add('connected');
      statusText.textContent = 'Connected to MinusMail';
    } else {
      statusDot.classList.add('error');
      statusText.textContent = 'Connection failed';
    }
  }

  showMessage(text, type = 'info') {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 3000);
    }
  }

  hideMessage() {
    const messageElement = document.getElementById('message');
    messageElement.style.display = 'none';
  }

  async checkForNewInstallation() {
    try {
      // Check if we have a username stored
      const stored = await browser.storage.local.get('username');
      if (stored.username) {
        // Check if this is a newly generated username (not manually set)
        const isNewInstall = await browser.storage.local.get('isNewInstallation');
        if (isNewInstall.isNewInstallation) {
          this.showWelcomeMessage(stored.username);
          // Remove the flag after showing the message
          await browser.storage.local.remove('isNewInstallation');
        }
      }
    } catch (error) {
      console.error('Error checking for new installation:', error);
    }
  }

  showWelcomeMessage(username) {
    const messageElement = document.getElementById('message');
    messageElement.innerHTML = `
      <div style="text-align: center; padding: 10px;">
        <h3 style="margin: 0 0 10px 0; color: #28a745;">Welcome to MinusMail!</h3>
        <p style="margin: 0 0 8px 0; font-size: 13px;">
          Your unique username is: <strong>${username}</strong>
        </p>
        <p style="margin: 0; font-size: 12px; color: #6c757d;">
          You can change it anytime using the field above.
        </p>
      </div>
    `;
    messageElement.className = 'message success';
    messageElement.style.display = 'block';
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MinusMailPopup();
}); 