"use server";

import { GoogleGenAI } from "@google/genai";
import { moderateContent } from "@/lib/utils/moderation";
import { ImpactKPI } from "./types";

/**
 * Creates a focused prompt for the AI based on current KPI metrics.
 */
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

/**
 * Generates impact insights using the Gemini AI 1.5 Flash model.
 * 
 * @param kpis - Array of KPI objects containing performance data.
 * @param organisationName - The name of the target organisation.
 * @param apiKey - Optional API key override (primarily for testing).
 * @returns A Promise that resolves to a moderated AI-generated insights string.
 * @throws {Error} If the API key is missing or the generation process fails.
 */
export async function generateImpactInsights(
    kpis: ImpactKPI[],
    organisationName: string,
    apiKey?: string
): Promise<string> {
    // Only use server-side environment variables for security
    const key = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!key) {
        throw new Error("Missing AI API Key (GOOGLE_API_KEY). Ensure it is set in the server environment.");
    }

    try {
        const genAI = new GoogleGenAI({ apiKey: key });
        const prompt = createPrompt(kpis, organisationName);

        // Typed invocation using the 1.5-flash model for cost/speed efficiency
        const response = await genAI.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        // The SDK returns text directly or via a specific structure
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!text) {
            throw new Error("AI returned an empty response.");
        }

        // Moderate the output before returning to ensure safety
        return moderateContent(text);
    } catch (error) {
        console.error("AI Impact Analysis Failed:", error);
        throw new Error("The AI failed to generate insights. Please check credentials or try again later.");
    }
}
