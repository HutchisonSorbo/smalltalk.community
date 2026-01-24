/**
 * ABS (Australian Bureau of Statistics) API Client
 * Fetches demographic data for community insights
 * 
 * Data is cached for 7 days as ABS data changes infrequently
 */

export interface ABSDemographics {
    locality: string;
    postcode: string;
    population: number;
    medianAge: number;
    medianIncome: number;
    familyHouseholds: number;
    singleHouseholds: number;
    ageBreakdown: {
        under18: number;
        age18to34: number;
        age35to54: number;
        age55to74: number;
        over75: number;
    };
    languagesAtHome: {
        englishOnly: number;
        otherLanguages: number;
        topNonEnglish: string[];
    };
    birthplace: {
        australia: number;
        overseas: number;
        topCountries: string[];
    };
    cachedAt: string;
    dataSource: string;
}

// Cache for ABS data (in-memory, consider Redis for production)
const absCache = new Map<string, { data: ABSDemographics; expiry: number }>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Fetch demographics data for a postcode from ABS
 * Uses cached data if available and not expired
 */
export async function getABSDemographics(postcode: string): Promise<ABSDemographics | null> {
    const cacheKey = `abs:${postcode}`;

    // Check cache first
    const cached = absCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }

    try {
        // Note: ABS API requires registration for production use
        // For now, we return sample data structure
        // In production, this would call: https://api.data.abs.gov.au/data/...

        // Sample data for demonstration (Victoria postcodes)
        const sampleData = getSampleDemographics(postcode);

        if (sampleData) {
            // Cache the result
            absCache.set(cacheKey, {
                data: sampleData,
                expiry: Date.now() + CACHE_TTL_MS,
            });
            return sampleData;
        }

        return null;
    } catch (error) {
        console.error("ABS API error:", error);
        return null;
    }
}

/**
 * Sample demographics data for Victoria postcodes
 * In production, this would be replaced with actual ABS API calls
 */
function getSampleDemographics(postcode: string): ABSDemographics | null {
    // Sample data for common Victoria postcodes
    const samples: Record<string, Partial<ABSDemographics>> = {
        "3000": { // Melbourne CBD
            locality: "Melbourne",
            population: 47643,
            medianAge: 29,
            medianIncome: 52000,
            familyHouseholds: 25,
            singleHouseholds: 55,
            ageBreakdown: { under18: 5, age18to34: 55, age35to54: 25, age55to74: 12, over75: 3 },
            languagesAtHome: { englishOnly: 45, otherLanguages: 55, topNonEnglish: ["Mandarin", "Vietnamese", "Hindi"] },
            birthplace: { australia: 35, overseas: 65, topCountries: ["China", "India", "Malaysia"] },
        },
        "3121": { // Richmond
            locality: "Richmond",
            population: 28847,
            medianAge: 34,
            medianIncome: 58000,
            familyHouseholds: 35,
            singleHouseholds: 40,
            ageBreakdown: { under18: 12, age18to34: 40, age35to54: 30, age55to74: 13, over75: 5 },
            languagesAtHome: { englishOnly: 60, otherLanguages: 40, topNonEnglish: ["Vietnamese", "Greek", "Italian"] },
            birthplace: { australia: 55, overseas: 45, topCountries: ["Vietnam", "China", "UK"] },
        },
        "3350": { // Ballarat
            locality: "Ballarat",
            population: 25245,
            medianAge: 38,
            medianIncome: 48000,
            familyHouseholds: 50,
            singleHouseholds: 30,
            ageBreakdown: { under18: 22, age18to34: 25, age35to54: 28, age55to74: 18, over75: 7 },
            languagesAtHome: { englishOnly: 88, otherLanguages: 12, topNonEnglish: ["Mandarin", "Italian", "Greek"] },
            birthplace: { australia: 80, overseas: 20, topCountries: ["UK", "India", "Philippines"] },
        },
    };

    const baseData = samples[postcode];
    if (!baseData) {
        // Return generic Victorian data as fallback
        return {
            locality: `Postcode ${postcode}`,
            postcode,
            population: 15000,
            medianAge: 37,
            medianIncome: 52000,
            familyHouseholds: 45,
            singleHouseholds: 30,
            ageBreakdown: { under18: 20, age18to34: 25, age35to54: 28, age55to74: 18, over75: 9 },
            languagesAtHome: { englishOnly: 75, otherLanguages: 25, topNonEnglish: ["Italian", "Greek", "Vietnamese"] },
            birthplace: { australia: 70, overseas: 30, topCountries: ["UK", "India", "China"] },
            cachedAt: new Date().toISOString(),
            dataSource: "ABS Census 2021 (Sample)",
        };
    }

    return {
        ...baseData,
        postcode,
        locality: baseData.locality ?? `Postcode ${postcode}`,
        population: baseData.population ?? 15000,
        medianAge: baseData.medianAge ?? 37,
        medianIncome: baseData.medianIncome ?? 52000,
        familyHouseholds: baseData.familyHouseholds ?? 45,
        singleHouseholds: baseData.singleHouseholds ?? 30,
        ageBreakdown: baseData.ageBreakdown ?? { under18: 20, age18to34: 25, age35to54: 28, age55to74: 18, over75: 9 },
        languagesAtHome: baseData.languagesAtHome ?? { englishOnly: 75, otherLanguages: 25, topNonEnglish: [] },
        birthplace: baseData.birthplace ?? { australia: 70, overseas: 30, topCountries: [] },
        cachedAt: new Date().toISOString(),
        dataSource: "ABS Census 2021 (Sample)",
    } as ABSDemographics;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredABSCache(): void {
    const now = Date.now();
    Array.from(absCache.entries()).forEach(([key, value]) => {
        if (value.expiry < now) {
            absCache.delete(key);
        }
    });
}
