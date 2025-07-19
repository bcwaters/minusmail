// Background script for MinusMail Firefox extension
// Handles API communication and extension state management

class MinusMailBackground {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3005';
    this.username = null;
    this.usernameLoaded = false;
    this.init();
  }

  init() {
    // Set up message listeners
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
    
    // Get username on initialization
    this.getUsername();
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
        
      case 'GET_USERNAME':
        try {
          const username = await this.getUsername();
          sendResponse({ username });
        } catch (error) {
          console.error('Error getting username:', error);
          sendResponse({ error: error.message });
        }
        break;
        
      case 'GET_CURRENT_USERNAME':
        // Return the currently loaded username without making API calls
        sendResponse({ username: this.username, loaded: this.usernameLoaded });
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

  async getUsername() {
    // If we already have the username cached, return it
    if (this.username && this.usernameLoaded) {
      return this.username;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/email/username`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If the endpoint doesn't exist yet, use a fallback username
        // This can be updated when the API endpoint is implemented
        this.username = 'user';
        this.usernameLoaded = true;
        this.notifyUsernameLoaded();
        return this.username;
      }

      const data = await response.json();
      
      if (data.username) {
        this.username = data.username;
        this.usernameLoaded = true;
        this.notifyUsernameLoaded();
        return this.username;
      } else {
        // Fallback username if API doesn't return one
        this.username = 'user';
        this.usernameLoaded = true;
        this.notifyUsernameLoaded();
        return this.username;
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      // Fallback username on error
      this.username = 'user';
      this.usernameLoaded = true;
      this.notifyUsernameLoaded();
      return this.username;
    }
  }

  notifyUsernameLoaded() {
    // Send notification to all content scripts and popup
    browser.runtime.sendMessage({
      type: 'USERNAME_LOADED',
      username: this.username
    }).catch(error => {
      // Ignore errors if no listeners are available
      console.log('No listeners for username notification');
    });
    
    // Also notify via browser notifications
    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('icons/icon-48.png'),
      title: 'MinusMail Username Loaded',
      message: `Username "${this.username}" is now available for autocomplete`
    });
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