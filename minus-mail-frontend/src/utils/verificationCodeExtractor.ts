/**
 * Extracts a verification code from an HTML email string in the browser.
 * @param {string} htmlEmail - The HTML email content as a string.
 * @returns {string|null} - The extracted verification code or null if not found.
 */
export function extractVerificationCode(htmlEmail: string): string | null {
    // Parse HTML using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlEmail, 'text/html');
    
    // First, try to find verification codes in specific elements with IDs or classes
    const specificSelectors = [
        '[id*="verification"]',
        '[id*="code"]',
        '[class*="verification"]',
        '[class*="code"]',
        '[id="verification-code"]',
        '[id="code"]',
        '[id="otp"]',
        '[id="pin"]'
    ];
    
    for (const selector of specificSelectors) {
        const element = doc.querySelector(selector);
        if (element && element.textContent) {
            const text = element.textContent.trim();
            // Check if the text looks like a verification code (4-8 alphanumeric characters)
            if (/^[A-Z0-9]{4,8}$/i.test(text)) {
                return text.toUpperCase();
            }
        }
    }
    
    // Extract text content, excluding script and style elements
    const walker = document.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement;
                return (parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE')
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_REJECT;
            }
        }
    );

    let text = '';
    while (walker.nextNode()) {
        text += walker.currentNode.textContent + ' ';
    }
    
    // Normalize whitespace
    text = text.trim().replace(/\s+/g, ' ');

    // Define regex patterns for verification codes with better context
    const patterns = [
        // Pattern 1: Code near specific verification keywords with better context
        /(?:verification\s+code|your\s+(?:verification\s+)?code|OTP|PIN|enter\s+the\s+following\s+code)[:\s]*([A-Z0-9]{4,8})\b/i,
        // Pattern 2: Codes in specific contexts (after "is:", ":", etc.) with better filtering
        /(?:is|code|access\s+code)[:\s]*([A-Z0-9]{4,8})\b(?!\s*(?:originated|from|address|minutes|seconds|hours|days|years))/i,
        // Pattern 3: Standalone numeric code (4-8 digits) - more restrictive context
        /\b(\d{4,8})\b(?!\s*(?:minutes|seconds|hours|days|years|originated|from|address))/,
        // Pattern 4: Standalone alphanumeric code (4-8 characters) - more restrictive context
        /\b([A-Z0-9]{4,8})\b(?!\s*(?:minutes|seconds|hours|days|years|expire|expires|originated|from|address))/
    ];

    // Try each pattern in order of priority
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const code = match[1] || match[0];
            // Additional validation: ensure it's not a common word or contextually inappropriate
            const commonWords = ['code', 'will', 'this', 'that', 'here', 'your', 'have', 'been', 'with', 'from', 'they', 'them', 'their', 'when', 'where', 'what', 'why', 'how', 'access', 'request', 'originated', 'address'];
            
            // More precise contextual validation - only reject if the code is directly followed by IP address context
            const afterCode = text.substring(text.indexOf(code) + code.length, text.indexOf(code) + code.length + 100).toLowerCase();
            const hasIPContext = /\b(?:originated\s+from|ip\s+address|request\s+for\s+this\s+access)\b/.test(afterCode);
            
            if (!commonWords.includes(code.toLowerCase()) && !hasIPContext) {
                return code.toUpperCase();
            }
        }
    }

    // Return null if no code is found
    return null;
}

/**
 * Extracts verification codes from both HTML and text content of an email
 * @param {string} htmlContent - The HTML email content
 * @param {string} textContent - The plain text email content
 * @returns {string|null} - The extracted verification code or null if not found
 */
export function extractVerificationCodeFromEmail(htmlContent: string, textContent: string): string | null {
    // First try to extract from HTML content
    if (htmlContent) {
        const codeFromHtml = extractVerificationCode(htmlContent);
        if (codeFromHtml) {
            return codeFromHtml;
        }
    }
    
    // If no code found in HTML, try the text content
    if (textContent) {
        // For text content, we can use a simpler approach since it's already plain text
        const patterns = [
            // Pattern 1: Code near specific verification keywords with better context
            /(?:verification\s+code|your\s+(?:verification\s+)?code|OTP|PIN|enter\s+the\s+following\s+code)[:\s]*([A-Z0-9]{4,8})\b/i,
            // Pattern 2: Codes in specific contexts (after "is:", ":", etc.) with better filtering
            /(?:is|code|access\s+code)[:\s]*([A-Z0-9]{4,8})\b(?!\s*(?:originated|from|address|minutes|seconds|hours|days|years))/i,
            // Pattern 3: Standalone numeric code (4-8 digits) - more restrictive context
            /\b(\d{4,8})\b(?!\s*(?:minutes|seconds|hours|days|years|originated|from|address))/,
            // Pattern 4: Standalone alphanumeric code (4-8 characters) - more restrictive context
            /\b([A-Z0-9]{4,8})\b(?!\s*(?:minutes|seconds|hours|days|years|expire|expires|originated|from|address))/
        ];

        for (const pattern of patterns) {
            const match = textContent.match(pattern);
            if (match) {
                const code = match[1] || match[0];
                // Additional validation: ensure it's not a common word or contextually inappropriate
                const commonWords = ['code', 'will', 'this', 'that', 'here', 'your', 'have', 'been', 'with', 'from', 'they', 'them', 'their', 'when', 'where', 'what', 'why', 'how', 'access', 'request', 'originated', 'address'];
                
                // More precise contextual validation - only reject if the code is directly followed by IP address context
                const afterCode = textContent.substring(textContent.indexOf(code) + code.length, textContent.indexOf(code) + code.length + 100).toLowerCase();
                const hasIPContext = /\b(?:originated\s+from|ip\s+address|request\s+for\s+this\s+access)\b/.test(afterCode);
                
                if (!commonWords.includes(code.toLowerCase()) && !hasIPContext) {
                    return code.toUpperCase();
                }
            }
        }
    }
    
    return null;
} 