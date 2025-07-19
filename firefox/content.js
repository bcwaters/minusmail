// Content script for MinusMail Firefox extension
// This script runs on web pages and handles verification code autocomplete

class MinusMailAutocomplete {
  constructor() {
    this.apiBaseUrl = 'https://api.minusmail.com';
    this.init();
  }

  init() {
    // Listen for messages from background script
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'AUTOCOMPLETE_CODE') {
        this.autocompleteCode(message.code);
        sendResponse({ success: true });
      }
    });

    // Set up mutation observer to watch for new input fields
    this.setupMutationObserver();
    
    // Initial scan for verification code fields
    this.scanForVerificationFields();
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.scanForVerificationFields(node);
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
        this.setupInputListener(input);
      });
    });
  }

  setupInputListener(input) {
    // Add click listener to trigger code fetch
    input.addEventListener('click', () => {
      this.requestCode();
    });

    // Add focus listener
    input.addEventListener('focus', () => {
      this.requestCode();
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
}

// Initialize the autocomplete functionality
new MinusMailAutocomplete(); 