/**
 * Privacy and Consent Validation Utilities
 */

export function requiresParentalConsent(age: number): boolean {
    return age < 18;
}

export function canShareData(member: any): boolean {
    return member?.privacy?.dataSharingConsent === true;
}

export function validateConsent(consent: string): boolean {
    return consent === "Yes" || consent === "No";
}
