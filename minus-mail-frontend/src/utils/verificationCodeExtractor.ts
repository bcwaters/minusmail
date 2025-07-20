/**
 * Configuration constants for verification code extraction
 */
const CODE_PATTERNS = [
    // Pattern 1: Code near specific verification keywords
    /(?:verification\s+code|your\s+(?:verification\s+)?code|OTP|PIN|enter\s+the\s+following\s+code|is|access\s+code)[:\s]*([A-Z0-9]{4,8})\b(?!\s*(?:originated|from|address|minutes|seconds|hours|days|years|expire|expires))/i,
    // Pattern 2: Standalone numeric code (4-8 digits)
    /\b(\d{4,8})\b(?!\s*(?:minutes|seconds|hours|days|years|originated|from|address|\.\d))/,
    // Pattern 3: Standalone alphanumeric code (4-8 characters)
    /\b([A-Z0-9]{4,8})\b(?!\s*(?:minutes|seconds|hours|days|years|expire|expires|originated|from|address|\.\d))/
];

const SPECIFIC_SELECTORS = [
    '[id*="verification"]', '[id*="code"]', '[id*="otp"]', '[id*="pin"]',
    '[class*="verification"]', '[class*="code"]', '[class*="otp"]', '[class*="pin"]',
    '#verification-code', '#code', '#otp', '#pin'
];

const NON_CONTENT_TAGS = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'TITLE'];

const COMMON_WORDS = [
    'code', 'will', 'this', 'that', 'here', 'your', 'have', 'been', 'with', 'from',
    'they', 'them', 'their', 'when', 'where', 'what', 'why', 'how', 'access', 'request',
    'originated', 'address', 'please', 'enter', 'use', 'complete', 'registration',
    'verification', 'account', 'continue', 'started', 'expire', 'expires', 'minutes',
    'hours', 'days', 'years'
];

/**
 * Preprocesses HTML to extract meaningful text content, filtering out non-content elements
 * @param htmlEmail - The HTML email content as a string
 * @returns Clean text content with normalized whitespace
 */
function preprocessHtmlContent(htmlEmail: string): string {
    try {
        // Parse HTML using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlEmail, 'text/html');

        // Remove non-content elements
        const nonContent = doc.querySelectorAll(NON_CONTENT_TAGS.join(','));
        nonContent.forEach(element => element.remove());

        // Extract text content
        const walker = document.createTreeWalker(
            doc.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const text = node.textContent?.trim() || '';
                    if (text.length === 0) return NodeFilter.FILTER_REJECT;

                    // Reject CSS-like content
                    if (
                        /^[0-9a-f]{3,6}$/i.test(text) || // Hex colors
                        /^[0-9]+(?:px|%|em|rem)$/.test(text) || // CSS units
                        /^rgb\(/.test(text) || // RGB colors
                        /^rgba\(/.test(text) || // RGBA colors
                        /^[a-z-]+:\s*[^;]+;?$/i.test(text) // CSS properties
                    ) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let text = '';
        while (walker.nextNode()) {
            text += walker.currentNode.textContent + ' ';
        }

        // Normalize whitespace and decode HTML entities
        return decodeHTMLEntities(text)
            .trim()
            .replace(/[\n\t]+/g, ' ')
            .replace(/\s+/g, ' ');
    } catch (error) {
        console.warn('Error preprocessing HTML:', error);
        return '';
    }
}

/**
 * Decodes HTML entities in text (e.g., &nbsp; to space)
 * @param text - Input text with potential HTML entities
 * @returns Decoded text
 */
function decodeHTMLEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

/**
 * Applies regex patterns to extract a verification code from text
 * @param text - The text to search for a verification code
 * @returns The extracted code or null if not found
 */
function applyCodePatterns(text: string): string | null {
    for (const pattern of CODE_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            const code = match[1] || match[0];
            const afterCode = text
                .substring(text.indexOf(code) + code.length, text.indexOf(code) + code.length + 100)
                .toLowerCase();
            
            // Validate context to avoid false positives
            const hasIPContext = /\b(?:originated\s+from|ip\s+address|request\s+for\s+this\s+access)\b/.test(afterCode);
            const isColorCode = /^[0-9a-f]{6}$/i.test(code) && (
                afterCode.includes('color:') ||
                afterCode.includes('background-color:') ||
                afterCode.includes('border-color:') ||
                afterCode.includes('#') ||
                afterCode.includes('rgb') ||
                afterCode.includes('rgba')
            );

            if (
                !COMMON_WORDS.includes(code.toLowerCase()) &&
                !hasIPContext &&
                !isColorCode &&
                !/\b\d+\.\d+\.\d+\b/.test(code) // Exclude version numbers
            ) {
                return code.toUpperCase();
            }
        }
    }
    return null;
}

/**
 * Extracts a verification code from an HTML email string in the browser
 * @param htmlEmail - The HTML email content as a string
 * @returns The extracted verification code or null if not found
 */
export function extractVerificationCode(htmlEmail: string): string | null {
    try {
        // Parse HTML using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlEmail, 'text/html');

        // Check specific elements with IDs or classes
        for (const selector of SPECIFIC_SELECTORS) {
            const element = doc.querySelector(selector);
            if (element && element.textContent) {
                const text = element.textContent.trim();
                if (/^[A-Z0-9]{4,8}$/i.test(text)) {
                    return text.toUpperCase();
                }
            }
        }

        // Preprocess HTML and apply patterns
        const text = preprocessHtmlContent(htmlEmail);
        return applyCodePatterns(text);
    } catch (error) {
        console.warn('Error extracting verification code from HTML:', error);
        return null;
    }
}

/**
 * Extracts verification codes from both HTML and text content of an email
 * @param htmlContent - The HTML email content
 * @param textContent - The plain text email content
 * @returns The extracted verification code or null if not found
 */
export function extractVerificationCodeFromEmail(htmlContent: string, textContent: string): string | null {
    // Try HTML content first
    if (htmlContent) {
        const codeFromHtml = extractVerificationCode(htmlContent);
        if (codeFromHtml) {
            return codeFromHtml;
        }
    }

    // Try plain text content
    if (textContent) {
        // Normalize whitespace in plain text
        const normalizedText = textContent
            .trim()
            .replace(/[\n\t]+/g, ' ')
            .replace(/\s+/g, ' ');
        return applyCodePatterns(normalizedText);
    }

    return null;
}

