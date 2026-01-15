/**
 * Engagement Risk Calculation Utilities
 */

export function calculateRiskLevel(member: any): "Green" | "Amber" | "Red" {
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

export function getRiskRecommendations(level: "Green" | "Amber" | "Red"): string[] {
    switch (level) {
        case "Green": return ["Maintain current engagement", "Monitor for changes"];
        case "Amber": return ["Schedule follow-up contact", "Check interest in upcoming programs"];
        case "Red": return ["Immediate outreach required", "Conduct safety/wellness check", "Review case management plan"];
        default: return [];
    }
}
