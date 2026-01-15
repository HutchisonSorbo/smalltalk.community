/**
 * Australian Data Validation Utilities
 */

export function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\s/g, "");
    const mobileRegex = /^(?:\+61|0)4\d{8}$/;
    return mobileRegex.test(cleaned);
}

export function validatePostcode(postcode: string, state: string): boolean {
    if (state !== "VIC") return true;
    const pc = parseInt(postcode, 10);
    return (pc >= 3000 && pc <= 3999) || (pc >= 8000 && pc <= 8999);
}

export function formatAUD(amount: number): string {
    return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
    }).format(amount);
}
