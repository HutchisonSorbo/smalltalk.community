import { GoogleGenAI } from "@google/genai";
import { moderateContent } from "@/lib/utils/moderation";
import { ImpactKPI } from "./types";

// Helper to generate a prompt from KPIs
function createPrompt(kpis: ImpactKPI[], contextName: string): string {
    const kpiSummary = kpis.map(k => {
        const trend = k.trend === 'up' ? 'improving' : k.trend === 'down' ? 'declining' : 'stable';
        return `- ${k.name}: ${k.value} ${k.unit} (${trend}, Category: ${k.category})`;
    }).join('\n');

    return `
    You are an expert impact analyst for a community organisation named "${contextName}".
    
    Here is the current performance data:
    ${kpiSummary}

    Please provide a concise, executive summary of the organisation's impact. 
    Highlight 2-3 key achievements and 1 area for improvement.
    Keep the tone professional, encouraging, and focused on community outcomes.
    Limit the response to 3 paragraphs.
    `;
}

export async function generateImpactInsights(
    kpis: ImpactKPI[],
    organisationName: string,
    apiKey?: string
): Promise<string> {
    const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!key) {
        throw new Error("Missing API Key for AI Insights");
    }

    try {
        // Initialize the client with the new SDK
        const genAI = new GoogleGenAI({ apiKey: key });

        const prompt = createPrompt(kpis, organisationName);

        // Use the models.generateContent method from the new SDK
        // Using casting to any to avoid potential type mismatches if d.ts is missing or complex
        // but trying to follow the likely API structure: client.models.generateContent
        const response: any = await (genAI as any).models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ parts: [{ text: prompt }] }]
        });

        // Parse response - checking new SDK structure, often it is response.text() or similar
        // but if response is the object, it might have candidates
        // If the SDK returns a simple response object with text() method:
        if (typeof response.text === 'function') {
            return moderateContent(response.text());
        }

        // Fallback for object structure
        const text = response.response?.candidates?.[0]?.content?.parts?.[0]?.text
            || response.candidates?.[0]?.content?.parts?.[0]?.text
            || "";

        return moderateContent(text);
    } catch (error) {
        console.error("AI Insight Generation Failed:", error);
        throw new Error("Failed to generate insights. Please try again later.");
    }
}
