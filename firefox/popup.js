// Popup script for MinusMail Firefox extension
// Handles user interface interactions and communication with background script

class MinusMailPopup {
  constructor() {
    this.username = null;
    this.init();
  }

  init() {
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
        console.log('MinusMail Popup: Received USERNAME_LOADED message:', message.username);
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
        
        // Check if this is a fresh installation and wait for username generation
        const isNewInstall = await browser.storage.local.get('isNewInstallation');
        if (isNewInstall.isNewInstallation) {
          console.log('MinusMail Popup: Fresh installation detected, waiting for username generation...');
          this.waitForUsernameGeneration();
        }
      }
    } catch (error) {
      console.error('Error getting username:', error);
      this.username = null;
      this.updateUsernameDisplay();
    }
  }

  async waitForUsernameGeneration() {
    let attempts = 0;
    const maxAttempts = 10; // Wait up to 5 seconds (10 * 500ms)
    
    const checkUsername = async () => {
      attempts++;
      console.log(`MinusMail Popup: Checking for username generation (attempt ${attempts})`);
      
      try {
        const response = await browser.runtime.sendMessage({
          type: 'GET_CURRENT_USERNAME'
        });
        
        if (response.username) {
          console.log('MinusMail Popup: Username generated successfully:', response.username);
          this.username = response.username;
          this.updateUsernameDisplay();
          this.getUserInfo();
          return; // Success, stop retrying
        }
        
        if (attempts >= maxAttempts) {
          console.log('MinusMail Popup: Max attempts reached, stopping username generation wait');
          return;
        }
        
        // Wait 500ms before next attempt
        setTimeout(checkUsername, 500);
      } catch (error) {
        console.error('MinusMail Popup: Error checking username generation:', error);
        if (attempts >= maxAttempts) {
          return;
        }
        setTimeout(checkUsername, 500);
      }
    };
    
    // Start checking
    setTimeout(checkUsername, 500);
  }

  updateUsernameDisplay() {
    const usernameLabel = document.getElementById('current-username');
    const emailLabel = document.getElementById('current-email');
    const usernameField = document.getElementById('username');
    
    if (usernameLabel) {
      if (this.username) {
        usernameLabel.textContent = this.username;
      } else {
        usernameLabel.textContent = 'Generating unique username...';
      }
    }
    
    if (emailLabel) {
      if (this.username) {
        emailLabel.textContent = `${this.username}@minusmail.com`;
      } else {
        emailLabel.textContent = 'Generating unique username...';
      }
    }
    
    if (usernameField) {
      usernameField.value = this.username || '';
    }
  }

  async getUserInfo() {
    console.log('MinusMail Popup: getUserInfo method called');
    console.log('MinusMail Popup: Current username:', this.username);
    
    if (!this.username) {
      // No username available yet, don't make API calls
      const emailBodyDisplay = document.getElementById('email-body-display');
      console.log('MinusMail Popup: No username, email body display element:', emailBodyDisplay);
      if (emailBodyDisplay) {
        emailBodyDisplay.textContent = 'Waiting for username...';
      }
      return;
    }
    
    try {
      console.log(`MinusMail Popup: Fetching emails for user: ${this.username}`);
      const response = await fetch(`http://minusmail.com/email/username/${this.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('MinusMail Popup: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('MinusMail Popup: API response:', data);
        console.log('MinusMail Popup: API response keys:', Object.keys(data));
        
        // Display the first available email body
        this.updateEmailBodyDisplay(data);
      } else {
        console.error('MinusMail Popup: Failed to fetch emails:', response.status);
        this.setDefaultValues();
      }
    } catch (error) {
      console.error('MinusMail Popup: Error fetching emails:', error);
      this.setDefaultValues();
    }
  }

  setDefaultValues() {
    // Set default values if API call fails
    const usernameLabel = document.getElementById('current-username');
    const emailLabel = document.getElementById('current-email');
    const usernameField = document.getElementById('username');
    
    if (usernameLabel) {
      if (this.username) {
        usernameLabel.textContent = this.username;
      } else {
        usernameLabel.textContent = 'Generating unique username...';
      }
    }
    
    if (emailLabel) {
      if (this.username) {
        emailLabel.textContent = `${this.username}@minusmail.com`;
      } else {
        emailLabel.textContent = 'Generating unique username...';
      }
    }
    
    if (usernameField) {
      usernameField.value = this.username || '';
    }
    
    // Reset email body display
    const emailBodyDisplay = document.getElementById('email-body-display');
    if (emailBodyDisplay) {
      if (this.username) {
        emailBodyDisplay.textContent = 'No emails available';
      } else {
        emailBodyDisplay.textContent = 'Waiting for username...';
      }
    }
  }

  setupEventListeners() {
    // Save username button
    document.getElementById('save-username').addEventListener('click', () => {
      this.saveUsername();
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
        // Update the username first
        this.username = newUsername;
        this.updateUsernameDisplay();
        this.showWelcomeMessage(newUsername);
        
        // Then refresh user info with the new username
        await this.getUserInfo();
      } else {
        this.showMessage(`Error saving username: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Error saving username:', error);
      this.showMessage('Error saving username', 'error');
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
 
          // Remove the flag after showing the message
          await browser.storage.local.remove('isNewInstallation');
        }
        this.showWelcomeMessage(stored.username);
      }
    } catch (error) {
      console.error('Error checking for new installation:', error);
    }
  }

  showWelcomeMessage(username) {
    const messageElement = document.getElementById('message');
    messageElement.innerHTML = `
      <div style="text-align: center; padding: 10px;">
        <h3 style="margin: 0 0 10px 0; color: #28a745;">MinusMail</h3>
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

  updateEmailBodyDisplay(data) {
    console.log('MinusMail Popup: updateEmailBodyDisplay method called');
    
    // Try multiple ways to find the element
    let emailBodyDisplay = document.getElementById('email-body-display');
    console.log('MinusMail Popup: email-body-display element (getElementById):', emailBodyDisplay);
    
    if (!emailBodyDisplay) {
      // Try querySelector
      emailBodyDisplay = document.querySelector('#email-body-display');
      console.log('MinusMail Popup: email-body-display element (querySelector):', emailBodyDisplay);
    }
    
    if (!emailBodyDisplay) {
      // Try finding by class
      emailBodyDisplay = document.querySelector('.email-body-content');
      console.log('MinusMail Popup: email-body-display element (by class):', emailBodyDisplay);
    }
    
    if (!emailBodyDisplay) {
      // List all elements to see what's available
      console.log('MinusMail Popup: All elements in document:');
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.id && el.id.includes('email')) {
          console.log('MinusMail Popup: Found element with email in ID:', el.id, el);
        }
        if (el.className && el.className.includes('email')) {
          console.log('MinusMail Popup: Found element with email in class:', el.className, el);
        }
      });
      
      console.log('MinusMail Popup: email-body-display element not found by any method');
      return;
    }
    
    console.log('MinusMail Popup: updateEmailBodyDisplay called with data:', data);
    
    // Try to get email content from htmlBody and textBody fields
    let emailContent = '';
    
    if (data.htmlBody || data.textBody) {
      if (data.htmlBody && data.textBody) {
        emailContent = `${data.textBody}\n\n${data.htmlBody}`;
        console.log('MinusMail Popup: Using both htmlBody and textBody from root');
      } else if (data.htmlBody) {
        emailContent = data.htmlBody;
        console.log('MinusMail Popup: Using htmlBody only from root');
      } else if (data.textBody) {
        emailContent = data.textBody;
        console.log('MinusMail Popup: Using textBody only from root');
      }
    } else if (data.emails && Array.isArray(data.emails) && data.emails.length > 0) {
      // Check for htmlBody/textBody in the first email object
      const firstEmail = data.emails[0];
      console.log('MinusMail Popup: First email data:', firstEmail);
      
      if (firstEmail.htmlBody || firstEmail.textBody) {
        if (firstEmail.htmlBody && firstEmail.textBody) {
          emailContent = `${firstEmail.textBody}\n\n${firstEmail.htmlBody}`;
          console.log('MinusMail Popup: Using both htmlBody and textBody from email object');
        } else if (firstEmail.htmlBody) {
          emailContent = firstEmail.htmlBody;
          console.log('MinusMail Popup: Using htmlBody only from email object');
        } else if (firstEmail.textBody) {
          emailContent = firstEmail.textBody;
          console.log('MinusMail Popup: Using textBody only from email object');
        }
      } else if (firstEmail.body) {
        emailContent = firstEmail.body;
        console.log('MinusMail Popup: Using email body from array');
      } else if (firstEmail.content) {
        emailContent = firstEmail.content;
        console.log('MinusMail Popup: Using email content from array');
      } else if (firstEmail.text) {
        emailContent = firstEmail.text;
        console.log('MinusMail Popup: Using email text from array');
      } else if (firstEmail.subject) {
        emailContent = `Subject: ${firstEmail.subject}`;
        if (firstEmail.from) {
          emailContent += `\nFrom: ${firstEmail.from}`;
        }
        console.log('MinusMail Popup: Using email subject and from from array');
      } else if (firstEmail.from) {
        emailContent = `From: ${firstEmail.from}`;
        console.log('MinusMail Popup: Using email from only from array');
      } else {
        emailContent = 'Email content not available';
        console.log('MinusMail Popup: No email content fields found in array');
      }
    } else {
      console.log('MinusMail Popup: No htmlBody/textBody or emails array found in data');
      emailContent = 'No emails available';
    }
    
    // Truncate if too long
    if (emailContent.length > 300) {
      emailContent = emailContent.substring(0, 300) + '...';
    }
    
    console.log('MinusMail Popup: Final email content:', emailContent);
    emailBodyDisplay.textContent = emailContent;
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MinusMailPopup();
});