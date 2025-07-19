// Content script for MinusMail Firefox extension
// This script runs on web pages and handles verification code and email autocomplete

class MinusMailAutocomplete {
  constructor() {
    this.apiBaseUrl = 'https://api.minusmail.com';
    this.username = null;
    this.init();
  }

  init() {
    // Listen for messages from background script
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'AUTOCOMPLETE_CODE') {
        this.autocompleteCode(message.code);
        sendResponse({ success: true });
      } else if (message.type === 'AUTOCOMPLETE_EMAIL') {
        this.autocompleteEmail();
        sendResponse({ success: true });
      } else if (message.type === 'USERNAME_LOADED') {
        this.username = message.username;
        console.log('MinusMail: Username loaded:', this.username);
        sendResponse({ success: true });
      }
    });

    // Set up mutation observer to watch for new input fields
    this.setupMutationObserver();
    
    // Initial scan for verification code and email fields
    this.scanForVerificationFields();
    this.scanForEmailFields();
    
    // Get username for email autocomplete
    this.getUsername();
    
    // Add keyboard shortcut for manual email autocomplete (Ctrl+Shift+E)
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        console.log('MinusMail: Manual email autocomplete triggered');
        this.autocompleteEmail();
      }
    });
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.scanForVerificationFields(node);
              this.scanForEmailFields(node);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanForVerificationFields(root = document) {
    // Look for common verification code input patterns
    const selectors = [
      'input[type="text"][maxlength="6"]',
      'input[type="text"][maxlength="8"]',
      'input[name*="code"]',
      'input[name*="verification"]',
      'input[name*="otp"]',
      'input[placeholder*="code"]',
      'input[placeholder*="verification"]',
      'input[placeholder*="OTP"]'
    ];

    selectors.forEach(selector => {
      const inputs = root.querySelectorAll(selector);
      inputs.forEach(input => {
        this.setupVerificationInputListener(input);
      });
    });
  }

  scanForEmailFields(root = document) {
    // Look for common email input patterns
    const selectors = [
      'input[type="email"]',
      'input[name*="email"]',
      'input[name*="mail"]',
      'input[placeholder*="email"]',
      'input[placeholder*="mail"]',
      'input[placeholder*="Email"]',
      'input[placeholder*="Mail"]'
    ];

    console.log('MinusMail: Scanning for email fields in:', root);
    
    selectors.forEach(selector => {
      const inputs = root.querySelectorAll(selector);
      console.log(`MinusMail: Found ${inputs.length} inputs with selector: ${selector}`);
      inputs.forEach(input => {
        console.log('MinusMail: Setting up email listener for:', input);
        this.setupEmailInputListener(input);
      });
    });
  }

  setupVerificationInputListener(input) {
    // Add click listener to trigger code fetch
    input.addEventListener('click', () => {
      this.requestCode();
    });

    // Add focus listener
    input.addEventListener('focus', () => {
      this.requestCode();
    });
  }

  setupEmailInputListener(input) {
    console.log('MinusMail: Setting up email input listener for:', input);
    
    // Add click listener to trigger email autocomplete
    input.addEventListener('click', () => {
      console.log('MinusMail: Email input clicked');
      this.autocompleteEmail();
    });

    // Add focus listener
    input.addEventListener('focus', () => {
      console.log('MinusMail: Email input focused');
      this.autocompleteEmail();
    });
  }

  getUsername() {
    // Request username from background script
    browser.runtime.sendMessage({
      type: 'GET_CURRENT_USERNAME'
    }).then(response => {
      if (response && response.username) {
        this.username = response.username;
        console.log('MinusMail: Username loaded from background:', this.username);
      } else {
        console.log('MinusMail: No username available from background');
      }
    }).catch(error => {
      console.error('Error getting username:', error);
    });
  }

  requestCode() {
    // Request verification code from background script
    browser.runtime.sendMessage({
      type: 'REQUEST_CODE'
    }).then(response => {
      if (response && response.code) {
        this.autocompleteCode(response.code);
      }
    }).catch(error => {
      console.error('Error requesting code:', error);
    });
  }

  autocompleteCode(code) {
    // Find the focused input or the most likely verification code input
    let targetInput = document.activeElement;
    
    if (!targetInput || !this.isVerificationInput(targetInput)) {
      // Find the most likely verification code input
      const inputs = document.querySelectorAll('input[type="text"]');
      for (let input of inputs) {
        if (this.isVerificationInput(input)) {
          targetInput = input;
          break;
        }
      }
    }

    if (targetInput && this.isVerificationInput(targetInput)) {
      // Set the value and trigger input events
      targetInput.value = code;
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Focus the input
      targetInput.focus();
      
      console.log('MinusMail: Autocompleted verification code');
    }
  }

  autocompleteEmail() {
    console.log('MinusMail: autocompleteEmail called, username:', this.username);
    
    if (!this.username) {
      console.log('MinusMail: Username not available for email autocomplete');
      this.showToast('Username not available for autocomplete', 'error');
      return;
    }

    const emailAddress = `${this.username}@minusmail.com`;
    console.log('MinusMail: Attempting to autocomplete with:', emailAddress);
    
    // Find the focused input or the most likely email input
    let targetInput = document.activeElement;
    console.log('MinusMail: Active element:', targetInput);
    
    if (!targetInput || !this.isEmailInput(targetInput)) {
      console.log('MinusMail: Active element is not an email input, searching for email inputs...');
      // Find the most likely email input
      const inputs = document.querySelectorAll('input[type="email"], input[name*="email"], input[name*="mail"]');
      console.log('MinusMail: Found email inputs:', inputs.length);
      for (let input of inputs) {
        if (this.isEmailInput(input)) {
          targetInput = input;
          console.log('MinusMail: Selected email input:', input);
          break;
        }
      }
    }

    if (targetInput && this.isEmailInput(targetInput)) {
      // Set the value and trigger input events
      targetInput.value = emailAddress;
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Focus the input
      targetInput.focus();
      
      console.log('MinusMail: Autocompleted email address:', emailAddress);
      this.showToast(`Autocompleted: ${emailAddress}`, 'success');
    } else {
      console.log('MinusMail: No suitable email input found for autocomplete');
      this.showToast('No email input found for autocomplete', 'error');
    }
  }

  showToast(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      max-width: 300px;
      word-wrap: break-word;
    `;
    toast.textContent = `MinusMail: ${message}`;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  isVerificationInput(input) {
    const name = input.name?.toLowerCase() || '';
    const placeholder = input.placeholder?.toLowerCase() || '';
    const maxLength = input.maxLength;
    
    return (
      name.includes('code') ||
      name.includes('verification') ||
      name.includes('otp') ||
      placeholder.includes('code') ||
      placeholder.includes('verification') ||
      placeholder.includes('otp') ||
      (maxLength >= 4 && maxLength <= 8)
    );
  }

  isEmailInput(input) {
    const type = input.type?.toLowerCase() || '';
    const name = input.name?.toLowerCase() || '';
    const placeholder = input.placeholder?.toLowerCase() || '';
    
    return (
      type === 'email' ||
      name.includes('email') ||
      name.includes('mail') ||
      placeholder.includes('email') ||
      placeholder.includes('mail')
    );
  }
}

// Initialize the autocomplete functionality
new MinusMailAutocomplete(); 