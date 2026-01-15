/**
 * Age Calculation and Cohort Assignment Utilities
 */

/**
 * Calculates age from a date string (YYYY-MM-DD)
 */
export function calculateAge(dob: string | null | undefined): number {
    if (!dob) return 0;

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

/**
 * Assigns an age cohort based on the calculated age
 */
export function getAgeCohort(age: number): string {
    if (age < 5) return "Underage";
    if (age < 12) return "Child";
    if (age < 25) return "Youth";
    if (age < 65) return "Adult";
    return "Senior";
}
