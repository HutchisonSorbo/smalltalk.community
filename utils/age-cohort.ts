/**
 * Calculates a person's age based on their birth date.
 * 
 * @param {Date} birthDate - The person's birth date.
 * @returns {number} The age in years (integer) as of today.
 */
export function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

/**
 * Determines the age cohort based on age.
 * Enforces a strict 13+ minimum age policy.
 * 
 * @param {number} age - The user's age.
 * @returns {"Teen" | "Adult" | "Senior" | "Invalid"} The cohort group or "Invalid" if under 13.
 */
export function getAgeCohort(age: number): "Teen" | "Adult" | "Senior" | "Invalid" {
    if (age < 0 || isNaN(age)) return "Invalid";

    if (age < 13) {
        return "Invalid";
    }

    if (age <= 17) return "Teen";
    if (age <= 64) return "Adult";
    return "Senior";
}
