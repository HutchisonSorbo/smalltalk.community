/**
 * Privacy and Consent Utilities
 */

export interface Privacy {
    dataSharingConsent?: boolean;
}

export interface Engagement {
    lastContactDate?: string | null;
}

export interface Member {
    privacy?: Privacy;
    engagement?: Engagement;
}

/**
 * Checks if the user requires enhanced moderation (ages 13-17).
 * Replaces the previous 'parental consent' check to align with platform policy.
 * 
 * @param {number} age - The user's age.
 * @returns {boolean} True if the user is a teen (13-17).
 */
export function requiresEnhancedModeration(age: number): boolean {
    return age >= 13 && age < 18;
}

/**
 * Validates that the consent value is a recognized option.
 * 
 * @param {string} consent - The consent string ("Yes" or "No").
 * @returns {boolean} True if the value is valid.
 */
export function isConsentValueValid(consent: string): boolean {
    return consent === "Yes" || consent === "No";
}

/**
 * Checks if a member has consented to data sharing.
 * 
 * @param {Member | null | undefined} member - The member object.
 * @returns {boolean} True if explicit consent exists.
 */
export function canShareData(member: Member | null | undefined): boolean {
    return member?.privacy?.dataSharingConsent === true;
}
