// Popup script for MinusMail Firefox extension
// Handles user interface interactions and communication with background script

class MinusMailPopup {
  constructor() {
    this.init();
  }

  init() {
    // Load initial state
    this.checkStatus();
    
    // Set up event listeners
    this.setupEventListeners();
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