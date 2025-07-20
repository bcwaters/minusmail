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
    // Set up installation event listener
    browser.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });
    
    // Set up message listeners
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
    
    // Check for existing username (for updates or existing installations)
    this.checkExistingUsername();
  }

  async checkExistingUsername() {
    try {
      const stored = await browser.storage.local.get('username');
      if (stored.username) {
        // We have an existing username, load it
        this.username = stored.username;
        this.usernameLoaded = true;
        this.notifyUsernameLoaded();
      } else {
        // No username found - this might be a fresh installation
        // Don't set a default username, wait for installation event
        console.log('MinusMail: No existing username found, waiting for installation event');
      }
    } catch (error) {
      console.error('MinusMail: Error checking existing username:', error);
    }
  }

  async handleInstallation(details) {
    console.log('MinusMail: Installation event:', details.reason);
    
    if (details.reason === 'install') {
      // This is a fresh installation
      console.log('MinusMail: Fresh installation detected, generating unique username');
      await this.generateAndSetUniqueUsername();
    } else if (details.reason === 'update') {
      // This is an update - check if we need to migrate existing data
      console.log('MinusMail: Extension updated');
      await this.handleUpdate();
    } else if (details.reason === 'browser_update') {
      // Browser was updated
      console.log('MinusMail: Browser updated');
    }
  }

  async handleUpdate() {
    // Check if we need to migrate from old storage format or handle updates
    try {
      const stored = await browser.storage.local.get('username');
      if (!stored.username) {
        // No username found, generate one
        console.log('MinusMail: No username found after update, generating unique username');
        await this.generateAndSetUniqueUsername();
      }
    } catch (error) {
      console.error('MinusMail: Error handling update:', error);
    }
  }

  async generateAndSetUniqueUsername() {
    try {
      const uniqueUsername = this.generateUniqueUsername();
      console.log('MinusMail: Generated unique username:', uniqueUsername);
      
      // Save the unique username
      await this.saveUsername(uniqueUsername);
      console.log('MinusMail: Username saved to storage:', uniqueUsername);
      
      // Set flag to indicate this is a new installation
      await browser.storage.local.set({ isNewInstallation: true });
      console.log('MinusMail: isNewInstallation flag set');
      
    } catch (error) {
      console.error('MinusMail: Error generating unique username:', error);
      // Fallback to a simple username
      await this.saveUsername('user');
    }
  }

  generateUniqueUsername() {
    // Generate a unique username with multiple strategies
    const strategies = [
      this.generateRandomUsername,
      this.generateAdjectiveNounUsername,
      this.generateColorAnimalUsername
    ];
    
    // Pick a random strategy
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    return strategy.call(this);
  }

  generateRandomUsername() {
    // Generate a random username with format: user_XXXXXX
    // Where XXXXXX is a random 6-character alphanumeric string
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'user_';
    
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  generateAdjectiveNounUsername() {
    // Generate username using adjective + noun format
    const adjectives = [
      'swift', 'bright', 'clever', 'brave', 'calm', 'eager', 'gentle', 'happy',
      'kind', 'lively', 'mighty', 'noble', 'quick', 'smart', 'wise', 'young',
      'active', 'bold', 'cool', 'daring', 'eager', 'fresh', 'great', 'heroic'
    ];
    
    const nouns = [
      'fox', 'bear', 'wolf', 'eagle', 'lion', 'tiger', 'dragon', 'phoenix',
      'hawk', 'owl', 'deer', 'panther', 'jaguar', 'falcon', 'raven', 'swan',
      'dove', 'sparrow', 'robin', 'cardinal', 'bluejay', 'finch', 'wren'
    ];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${adjective}_${noun}${number}`;
  }

  generateColorAnimalUsername() {
    // Generate username using color + animal format
    const colors = [
      'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown',
      'black', 'white', 'gray', 'silver', 'gold', 'navy', 'teal', 'coral',
      'lime', 'indigo', 'violet', 'maroon', 'olive', 'cyan', 'magenta'
    ];
    
    const animals = [
      'cat', 'dog', 'bird', 'fish', 'rabbit', 'hamster', 'mouse', 'rat',
      'guinea', 'ferret', 'chinchilla', 'hedgehog', 'turtle', 'lizard',
      'snake', 'frog', 'toad', 'salamander', 'newt', 'axolotl'
    ];
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${color}_${animal}${number}`;
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
        
      case 'SAVE_USERNAME':
        try {
          await this.saveUsername(message.username);
          sendResponse({ success: true });
        } catch (error) {
          console.error('Error saving username:', error);
          sendResponse({ success: false, error: error.message });
        }
        break;
        
      case 'GENERATE_USERNAME':
        try {
          const newUsername = this.generateUniqueUsername();
          await this.saveUsername(newUsername);
          sendResponse({ success: true, username: newUsername });
        } catch (error) {
          console.error('Error generating username:', error);
          sendResponse({ success: false, error: error.message });
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

  async getUsername() {
    // If we already have the username cached, return it
    if (this.username && this.usernameLoaded) {
      return this.username;
    }

    try {
      // First try to get username from storage
      const stored = await browser.storage.local.get('username');
      if (stored.username) {
        this.username = stored.username;
        this.usernameLoaded = true;
        this.notifyUsernameLoaded();
        return this.username;
      }

      // Check if this is a fresh installation by looking for the installation flag
      const installInfo = await browser.storage.local.get('isNewInstallation');
      if (installInfo.isNewInstallation) {
        // This is a fresh installation, don't set a fallback username
        // The installation event handler will generate a unique username
        console.log('MinusMail: Fresh installation detected, waiting for unique username generation');
        return null;
      }

      // For existing installations without a username, try API
      const response = await fetch(`${this.apiBaseUrl}/email/username`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If the endpoint doesn't exist yet and this isn't a fresh installation,
        // we can set a fallback username
        console.log('MinusMail: API endpoint not available, setting fallback username');
        this.username = 'user';
        this.usernameLoaded = true;
        await this.saveUsernameToStorage(this.username);
        this.notifyUsernameLoaded();
        return this.username;
      }

      const data = await response.json();
      
      if (data.username) {
        this.username = data.username;
        this.usernameLoaded = true;
        await this.saveUsernameToStorage(this.username);
        this.notifyUsernameLoaded();
        return this.username;
      } else {
        // Fallback username if API doesn't return one (for existing installations)
        console.log('MinusMail: API returned no username, setting fallback');
        this.username = 'user';
        this.usernameLoaded = true;
        await this.saveUsernameToStorage(this.username);
        this.notifyUsernameLoaded();
        return this.username;
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      
      // Only set fallback username for existing installations, not fresh ones
      const installInfo = await browser.storage.local.get('isNewInstallation');
      if (!installInfo.isNewInstallation) {
        console.log('MinusMail: Error occurred, setting fallback username for existing installation');
        this.username = 'user';
        this.usernameLoaded = true;
        await this.saveUsernameToStorage(this.username);
        this.notifyUsernameLoaded();
        return this.username;
      } else {
        console.log('MinusMail: Error occurred during fresh installation, waiting for unique username generation');
        return null;
      }
    }
  }

  async saveUsername(username) {
    if (!username || typeof username !== 'string') {
      throw new Error('Invalid username provided');
    }
    
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      throw new Error('Username cannot be empty');
    }
    
    // Update internal state
    this.username = trimmedUsername;
    this.usernameLoaded = true;
    
    // Save to storage
    await this.saveUsernameToStorage(trimmedUsername);
    
    // Notify other parts of the extension
    this.notifyUsernameLoaded();
    
    return trimmedUsername;
  }

  async saveUsernameToStorage(username) {
    try {
      await browser.storage.local.set({ username });
    } catch (error) {
      console.error('Error saving username to storage:', error);
      throw new Error('Failed to save username to storage');
    }
  }

  notifyUsernameLoaded() {
    console.log('MinusMail: Notifying username loaded:', this.username);
    
    // Send notification to all content scripts and popup
    browser.runtime.sendMessage({
      type: 'USERNAME_LOADED',
      username: this.username
    }).catch(error => {
      // Ignore errors if no listeners are available
      console.log('MinusMail: No listeners for username notification');
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