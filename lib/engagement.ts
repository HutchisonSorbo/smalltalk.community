/**
 * Engagement Risk Calculation Utilities
 */

interface Member {
    engagement?: {
        lastContactDate?: string | null;
    };
}

/**
 * Calculates the engagement risk level based on the last contact date.
 * 
 * @param {Member} member - The member object containing engagement details.
 * @returns {"Green" | "Amber" | "Red"} The calculated risk level.
 */
export function calculateRiskLevel(member: Member): "Green" | "Amber" | "Red" {
    const lastContact = member?.engagement?.lastContactDate;
    if (!lastContact) return "Red";

    const lastContactDate = new Date(lastContact);
    if (isNaN(lastContactDate.getTime())) return "Red";

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastContactDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return "Green";
    if (diffDays < 60) return "Amber";
    return "Red";
}

/**
 * Returns recommended actions based on the engagement risk level.
 * 
 * @param {"Green" | "Amber" | "Red"} level - The risk level.
 * @returns {string[]} A list of recommended actions.
 * @example
 * getRiskRecommendations("Green") // ["Maintain current engagement", ...]
 */
export function getRiskRecommendations(level: "Green" | "Amber" | "Red"): string[] {
    switch (level) {
        case "Green": return ["Maintain current engagement", "Monitor for changes"];
        case "Amber": return ["Schedule follow-up contact", "Check interest in upcoming programs"];
        case "Red": return ["Immediate outreach required", "Conduct safety/wellness check", "Review case management plan"];
        default: return [];
    }
}
