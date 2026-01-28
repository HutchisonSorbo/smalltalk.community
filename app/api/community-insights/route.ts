/**
 * Community Insights AI API Route
 * Provides AI-powered insights about community demographics and local amenities
 * 
 * Uses Google Gemini for natural language processing
 * Caches external API data (ABS: 7 days, OSM: 24 hours)
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { getABSDemographics, type ABSDemographics } from "@/lib/abs-api";
import { getOSMAmenities, type OSMAmenities } from "@/lib/osm-api";
import { createClient } from "@/lib/supabase-server";
import { verifyTenantAccess } from "@/lib/communityos/tenant-context";

// Request validation schema
const requestSchema = z.object({
    query: z.string().min(1).max(500),
    tenantId: z.string().uuid(),
    postcode: z.string().regex(/^\d{4}$/).optional(),
    location: z.object({
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
    }).optional(),
});

// Rate limit: 15 requests per minute for free tier
const RATE_LIMIT_REQUESTS = 15;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// In-memory rate limiting (consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.issues },
                { status: 400 }
            );
        }

        const { query, tenantId, postcode, location } = parsed.data;

        // Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify tenant access
        const { hasAccess } = await verifyTenantAccess(user.id, tenantId);
        if (!hasAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Rate limiting
        const rateLimitKey = `insights:${user.id}`;
        const rateLimit = rateLimitMap.get(rateLimitKey);
        const now = Date.now();

        if (rateLimit && rateLimit.resetAt > now) {
            if (rateLimit.count >= RATE_LIMIT_REQUESTS) {
                return NextResponse.json(
                    { error: "Rate limit exceeded. Please try again later." },
                    {
                        status: 429,
                        headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - now) / 1000)) }
                    }
                );
            }
            rateLimit.count++;
        } else {
            rateLimitMap.set(rateLimitKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        }

        // Fetch context data
        let demographics: ABSDemographics | null = null;
        let amenities: OSMAmenities | null = null;

        if (postcode) {
            demographics = await getABSDemographics(postcode);
        }

        if (location) {
            amenities = await getOSMAmenities(location.lat, location.lon, 2000);
        }

        // Build context for AI
        const context = buildAIContext(demographics, amenities);

        // Check for Gemini API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("[Community Insights] GEMINI_API_KEY environment variable is not set");
            // Return helpful message with context data if available
            const contextSummary = demographics
                ? `Based on available data for ${demographics.locality} (${demographics.postcode}): Population: ${demographics.population.toLocaleString()}, Median Age: ${demographics.medianAge}`
                : "No location data available.";

            return NextResponse.json({
                query,
                insights: `🔧 AI-powered analysis is currently being configured. ${contextSummary}\n\nPlease try again later for comprehensive AI insights, or check with your administrator about API configuration.`,
                demographics: demographics ? formatDemographicsForResponse(demographics) : null,
                amenities: amenities ? formatAmenitiesForResponse(amenities) : null,
                sources: {
                    demographics: demographics ? "ABS Census 2021" : null,
                    amenities: amenities ? "OpenStreetMap" : null,
                },
                isAIUnavailable: true,
            });
        }

        // Generate AI insights
        const genAI = new GoogleGenAI({ apiKey });
        const model = "gemini-1.5-flash";

        const prompt = `You are a helpful community insights assistant for a non-profit organization. 
Answer the following question about the community, using the provided context data.
Be concise, helpful, and focused on actionable insights for community organizations.
If you don't have enough data to answer accurately, say so.

USER QUESTION: ${query}

CONTEXT DATA:
${context}

Provide a helpful, informative response focused on community development and planning.`;

        // Use explicit content structure for better compatibility and error handling
        const response = await genAI.models.generateContent({
            model,
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
        });

        const insights = response.text ?? "Unable to generate insights.";

        return NextResponse.json({
            query,
            insights,
            demographics: demographics ? formatDemographicsForResponse(demographics) : null,
            amenities: amenities ? formatAmenitiesForResponse(amenities) : null,
            sources: {
                demographics: demographics ? "ABS Census 2021" : null,
                amenities: amenities ? "OpenStreetMap" : null,
            },
        });
    } catch (error: unknown) {
        console.error("[Community Insights] API error:", error);

        // Log detailed error information for debugging
        if (error instanceof Error) {
            console.error(`[Community Insights] Error name: ${error.name}`);
            console.error(`[Community Insights] Error message: ${error.message}`);
            if ("status" in error && typeof error.status === "number") {
                console.error(`[Community Insights] HTTP status: ${error.status}`);
            }
            if ("code" in error && typeof error.code === "string") {
                console.error(`[Community Insights] Error code: ${error.code}`);
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Build context string for AI from external data
 */
function buildAIContext(
    demographics: ABSDemographics | null,
    amenities: OSMAmenities | null
): string {
    const parts: string[] = [];

    if (demographics) {
        parts.push(`DEMOGRAPHICS (${demographics.locality}, ${demographics.postcode}):
- Population: ${demographics.population.toLocaleString()}
- Median Age: ${demographics.medianAge}
- Median Income: $${demographics.medianIncome.toLocaleString()}/year
- Family Households: ${demographics.familyHouseholds}%
- Single Households: ${demographics.singleHouseholds}%
- Age Breakdown: Under 18 (${demographics.ageBreakdown.under18}%), 18-34 (${demographics.ageBreakdown.age18to34}%), 35-54 (${demographics.ageBreakdown.age35to54}%), 55-74 (${demographics.ageBreakdown.age55to74}%), 75+ (${demographics.ageBreakdown.over75}%)
- Languages: English only (${demographics.languagesAtHome.englishOnly}%), Other languages (${demographics.languagesAtHome.otherLanguages}%)
- Top non-English languages: ${demographics.languagesAtHome.topNonEnglish.join(", ")}
- Born in Australia: ${demographics.birthplace.australia}%
- Top overseas birthplaces: ${demographics.birthplace.topCountries.join(", ")}`);
    }

    if (amenities) {
        parts.push(`LOCAL AMENITIES (within ${amenities.radius}m):
- Schools/Education: ${amenities.summary.schools}
- Healthcare facilities: ${amenities.summary.healthcare}
- Recreation/Sport: ${amenities.summary.recreation}
- Parks/Playgrounds: ${amenities.summary.parks}
- Community spaces: ${amenities.summary.communitySpaces}
- Public transport: ${amenities.summary.transport}
- Shops: ${amenities.summary.shops}
- Restaurants/Cafes: ${amenities.summary.restaurants}`);
    }

    if (parts.length === 0) {
        return "No specific location data available. Providing general community development guidance.";
    }

    return parts.join("\n\n");
}

/**
 * Format demographics for API response (remove internal fields)
 */
function formatDemographicsForResponse(d: ABSDemographics) {
    return {
        locality: d.locality,
        postcode: d.postcode,
        population: d.population,
        medianAge: d.medianAge,
        medianIncome: d.medianIncome,
        ageBreakdown: d.ageBreakdown,
        dataSource: d.dataSource,
    };
}

/**
 * Format amenities for API response
 */
function formatAmenitiesForResponse(a: OSMAmenities) {
    return {
        radius: a.radius,
        summary: a.summary,
        totalAmenities: a.amenities.length,
    };
}
