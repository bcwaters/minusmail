// Background script for MinusMail Firefox extension
// Handles API communication and extension state management

class MinusMailBackground {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3005';
    this.init();
  }

  init() {
    // Set up message listeners
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'REQUEST_CODE':
        try {
          const code = await this.fetchVerificationCode();
          sendResponse({ code });
        } catch (error) {
          console.error('Error fetching verification code:', error);
          sendResponse({ error: error.message });
        }
        break;
        
      case 'GET_STATUS':
        try {
          const status = await this.getStatus();
          sendResponse({ status });
        } catch (error) {
          console.error('Error getting status:', error);
          sendResponse({ error: error.message });
        }
        break;
        
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }

  async fetchVerificationCode() {
    try {
      // For now, return a placeholder since verification codes endpoint doesn't exist yet
      throw new Error('Verification codes endpoint not implemented yet');
      
      // When the endpoint is implemented, use this:
      // const response = await fetch(`${this.apiBaseUrl}/email/verification-codes/latest`, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
      // 
      // if (!response.ok) {
      //   throw new Error(`API request failed: ${response.status}`);
      // }
      // 
      // const data = await response.json();
      // 
      // if (!data.code) {
      //   throw new Error('No verification code available');
      // }
      // 
      // return data.code;
    } catch (error) {
      console.error('Error fetching verification code:', error);
      throw error;
    }
  }

  async getStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/email/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { 
          connected: false, 
          message: `API connection failed: ${response.status}` 
        };
      }

      const data = await response.json();
      return { 
        connected: true, 
        message: 'Connected to MinusMail API',
        data 
      };
    } catch (error) {
      return { 
        connected: false, 
        message: `Connection error: ${error.message}` 
      };
    }
  }
}

// Initialize the background script
new MinusMailBackground(); 