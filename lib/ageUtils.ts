import { differenceInYears } from "date-fns";

export function isOver18(dateOfBirth: Date | string | undefined | null): boolean {
    if (!dateOfBirth) return false;

    const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();

    return differenceInYears(today, dob) >= 18;
}
