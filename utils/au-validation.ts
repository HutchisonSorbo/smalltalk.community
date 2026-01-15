/**
 * Australian Data Validation Utilities
 */

/**
 * Validates an Australian mobile phone number.
 * Accepts local (04XXXXXXXX), national (614XXXXXXXX), and international (+614XXXXXXXX) formats.
 * 
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} True if the phone number is a valid Australian mobile.
 */
export function validatePhone(phone: string): boolean {
    if (typeof phone !== 'string') return false;

    // Remove whitespace and normalize
    let cleaned = phone.replace(/\s+/g, "");

    // Handle international formats: +614... or 614...
    if (cleaned.startsWith('+61')) {
        cleaned = '0' + cleaned.slice(3);
    } else if (cleaned.startsWith('61') && cleaned.length === 11) {
        cleaned = '0' + cleaned.slice(2);
    }

    return /^04\d{8}$/.test(cleaned);
}

/**
 * Validates a Victorian postcode.
 * Checks if the postcode falls within the standard VIC ranges (3000-3999, 8000-8999).
 * 
 * @param {string} postcode - The postcode to validate.
 * @returns {boolean} True if the postcode is valid for Victoria.
 */
export function validatePostcode(postcode: string): boolean {
    // Basic validation for VIC postcodes (3000-3999 range as primary example)
    // Could be expanded for national coverage
    return /^(3\d{3}|8\d{3})$/.test(postcode);
}

/**
 * Formats a number as Australian Currency (AUD).
 * 
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted currency string (e.g., "$1,234.50").
 */
export function formatAUD(amount: number): string {
    if (!Number.isFinite(amount)) return "";
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD'
    }).format(amount);
}
