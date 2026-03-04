/**
 * Security utilities for input sanitization and validation
 */

/** Sanitize text input - remove HTML tags and trim */
export const sanitizeText = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[char] || char;
    })
    .trim();
};

/** Validate WO number - only digits, max 20 chars */
export const isValidWONumber = (value: string): boolean => {
  return /^\d{1,20}$/.test(value);
};

/** Rate limiter for preventing abuse */
export class RateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }
    this.timestamps.push(now);
    return true;
  }
}

/** Prevent common XSS patterns in user input */
export const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];
  return xssPatterns.some(pattern => pattern.test(input));
};
