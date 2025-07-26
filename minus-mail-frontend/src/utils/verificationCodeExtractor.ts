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
 * Comprehensive list of verification-related keywords that indicate an email is about verification
 */
const VERIFICATION_KEYWORDS = [
    // Core verification terms
    'verify', 'verification', 'verified', 'verifying', 'verifies',
    'authenticate', 'authentication', 'authenticated', 'authenticating',
    'confirm', 'confirmation', 'confirmed', 'confirming',
    'validate', 'validation', 'validated', 'validating',
    
    // Code-related terms
    'code', 'codes', 'verification code', 'verification codes',
    'otp', 'one-time password', 'one time password', 'one-time code', 'one time code',
    'pin', 'personal identification number', 'access code', 'access codes',
    'security code', 'security codes', 'authentication code', 'authentication codes',
    'confirmation code', 'confirmation codes', 'activation code', 'activation codes',
    'login code', 'login codes', 'signin code', 'signin codes', 'sign-in code', 'sign-in codes',
    'two-factor', 'two factor', '2fa', '2-factor', '2 factor',
    'multi-factor', 'multi factor', 'mfa', 'multi-factor authentication',
    
    // Account security terms
    'account security', 'secure your account', 'protect your account',
    'account verification', 'account validation', 'account confirmation',
    'login verification', 'login validation', 'signin verification', 'signin validation',
    'sign-in verification', 'sign-in validation', 'signup verification', 'signup validation',
    'sign-up verification', 'sign-up validation', 'registration verification',
    'registration validation', 'email verification', 'email validation',
    'phone verification', 'phone validation', 'mobile verification', 'mobile validation',
    'sms verification', 'sms validation', 'text verification', 'text validation',
    
    // Action-oriented terms
    'enter code', 'enter the code', 'enter your code', 'enter verification code',
    'input code', 'input the code', 'input your code', 'input verification code',
    'type code', 'type the code', 'type your code', 'type verification code',
    'use code', 'use the code', 'use your code', 'use verification code',
    'submit code', 'submit the code', 'submit your code', 'submit verification code',
    'complete verification', 'complete validation', 'complete confirmation',
    'finish verification', 'finish validation', 'finish confirmation',
    
    // Time-sensitive terms
    'expires', 'expire', 'expiration', 'expiring', 'time limit', 'time-limited',
    'valid for', 'valid until', 'expires in', 'expires at', 'expires on',
    'minutes', 'seconds', 'hours', 'time-sensitive', 'time sensitive',
    
    // Security and trust terms
    'secure', 'security', 'protected', 'protection', 'safe', 'safety',
    'trust', 'trusted', 'trustworthy', 'reliable', 'reliability',
    'authorized', 'authorization', 'authorize', 'authorizing',
    'approved', 'approval', 'approve', 'approving',
    
    // Identity and access terms
    'identity', 'identification', 'identify', 'identifying',
    'access', 'accessible', 'accessing', 'access granted', 'access denied',
    'login', 'log in', 'logging in', 'logged in', 'signin', 'sign in', 'signing in',
    'signup', 'sign up', 'signing up', 'signed up', 'register', 'registration',
    'account', 'accounts', 'profile', 'profiles', 'user', 'users',
    
    // Notification and alert terms
    'alert', 'alerts', 'notification', 'notifications', 'notify', 'notified',
    'warning', 'warnings', 'important', 'urgent', 'critical', 'security alert',
    'suspicious activity', 'unusual activity', 'new login', 'new signin',
    'new device', 'new location', 'new ip', 'new ip address',
    
    // Request and response terms
    'request', 'requested', 'requesting', 'request for', 'requested by',
    'response', 'respond', 'responding', 'reply', 'replied', 'replying',
    'sent', 'sending', 'send', 'delivered', 'delivery', 'deliver',
    
    // Setup and configuration terms
    'setup', 'set up', 'setting up', 'configure', 'configuration', 'configuring',
    'enable', 'enabled', 'enabling', 'activate', 'activated', 'activating',
    'install', 'installed', 'installing', 'setup verification', 'setup validation',
    
    // Recovery and reset terms
    'recover', 'recovery', 'recovering', 'reset', 'resetting', 'reset password',
    'forgot password', 'forgotten password', 'lost password', 'change password',
    'update password', 'new password', 'password reset', 'password recovery',
    
    // Device and location terms
    'device', 'devices', 'computer', 'computers', 'mobile', 'phone', 'smartphone',
    'tablet', 'laptop', 'desktop', 'browser', 'browsers', 'app', 'application',
    'location', 'locations', 'ip address', 'ip addresses', 'geographic',
    'country', 'countries', 'city', 'cities', 'region', 'regions',
    
    // Service-specific terms
    'google', 'gmail', 'microsoft', 'outlook', 'hotmail', 'yahoo', 'apple', 'icloud',
    'facebook', 'twitter', 'instagram', 'linkedin', 'amazon', 'netflix', 'spotify',
    'paypal', 'stripe', 'square', 'venmo', 'zelle', 'bank', 'banking', 'financial',
    'credit card', 'debit card', 'payment', 'payments', 'billing', 'invoice',
    
    // Technical terms
    'api', 'application programming interface', 'webhook', 'webhooks',
    'endpoint', 'endpoints', 'token', 'tokens', 'session', 'sessions',
    'cookie', 'cookies', 'cache', 'caching', 'database', 'databases',
    'server', 'servers', 'client', 'clients', 'protocol', 'protocols'
];

/**
 * Checks if the email content contains verification-related keywords
 * @param text - The text content to check
 * @returns True if verification keywords are found, false otherwise
 */
function hasVerificationContext(text: string): boolean {
    const normalizedText = text.toLowerCase();
    
    // Check for verification keywords
    for (const keyword of VERIFICATION_KEYWORDS) {
        if (normalizedText.includes(keyword.toLowerCase())) {
            return true;
        }
    }
    
    // Additional pattern-based checks for common verification phrases
    const verificationPatterns = [
        /\b(?:enter|input|type|use|submit)\s+(?:the\s+)?(?:verification\s+)?(?:code|otp|pin)\b/i,
        /\b(?:verification|authentication|confirmation)\s+(?:code|otp|pin)\b/i,
        /\b(?:two|2)\s*[-]?\s*factor\s+(?:authentication|verification|code)\b/i,
        /\b(?:multi|multiple)\s*[-]?\s*factor\s+(?:authentication|verification|code)\b/i,
        /\b(?:security|access)\s+(?:code|otp|pin)\b/i,
        /\b(?:login|signin|sign-in)\s+(?:verification|authentication|code)\b/i,
        /\b(?:account|email|phone|mobile|sms)\s+(?:verification|authentication|confirmation)\b/i,
        /\b(?:verify|authenticate|confirm|validate)\s+(?:your|the)\s+(?:account|email|phone|identity)\b/i,
        /\b(?:code|otp|pin)\s+(?:is|will be|has been)\s+(?:sent|delivered|provided)\b/i,
        /\b(?:expires|expire|expiration)\s+(?:in|at|on|within)\b/i
    ];
    
    for (const pattern of verificationPatterns) {
        if (pattern.test(normalizedText)) {
            return true;
        }
    }
    
    return false;
}

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

        // Preprocess HTML to get text content for verification context check
        const text = preprocessHtmlContent(htmlEmail);
        
        // Check if the email has verification context - if not, return null immediately
        if (!hasVerificationContext(text)) {
            return null;
        }

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

        // Apply patterns to the preprocessed text
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
        
        // Check if the email has verification context - if not, return null immediately
        if (!hasVerificationContext(normalizedText)) {
            return null;
        }
        
        return applyCodePatterns(normalizedText);
    }

    return null;
}

