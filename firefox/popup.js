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
    
    // Get username from background script
    this.getUsername();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Listen for username loaded notifications
    this.setupMessageListener();
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
        // Fallback if username not loaded yet
        this.username = 'user';
        this.updateUsernameDisplay();
        this.getUserInfo();
      }
    } catch (error) {
      console.error('Error getting username:', error);
      this.username = 'user';
      this.updateUsernameDisplay();
      this.getUserInfo();
    }
  }

  updateUsernameDisplay() {
    const usernameField = document.getElementById('username');
    if (usernameField) {
      usernameField.value = this.username || 'Not available';
    }
  }

  async getUserInfo() {
    if (!this.username) {
      this.setDefaultValues();
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
    const usernameField = document.getElementById('username');
    if (usernameField) {
      usernameField.value = this.username || 'Not available';
    }
    
    const inboxField = document.getElementById('inbox');
    if (inboxField) {
      inboxField.value = '0 emails';
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
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MinusMailPopup();
}); 