/**
 * OpenStreetMap Overpass API Client
 * Fetches local amenities data for community insights
 * 
 * Data is cached for 24 hours as amenity data changes more frequently than demographics
 */

export interface OSMAmenity {
    id: number;
    type: string;
    name: string;
    category: string;
    lat: number;
    lon: number;
    address?: string;
    phone?: string;
    website?: string;
    openingHours?: string;
}

export interface OSMAmenities {
    locality: string;
    radius: number;
    amenities: OSMAmenity[];
    summary: {
        schools: number;
        healthcare: number;
        recreation: number;
        communitySpaces: number;
        transport: number;
        shops: number;
        restaurants: number;
        parks: number;
    };
    cachedAt: string;
}

// Cache for OSM data
const osmCache = new Map<string, { data: OSMAmenities; expiry: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Overpass API endpoint
const OVERPASS_API = "https://overpass-api.de/api/interpreter";

/**
 * Fetch amenities within a radius of a location from OpenStreetMap
 * Uses cached data if available and not expired
 */
export async function getOSMAmenities(
    lat: number,
    lon: number,
    radiusMeters: number = 2000
): Promise<OSMAmenities | null> {
    const cacheKey = `osm:${lat.toFixed(4)}:${lon.toFixed(4)}:${radiusMeters}`;

    // Check cache first
    const cached = osmCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }

    try {
        // Build Overpass query for various amenity types
        const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"school|kindergarten|university|college"](around:${radiusMeters},${lat},${lon});
        node["amenity"~"hospital|clinic|doctors|pharmacy"](around:${radiusMeters},${lat},${lon});
        node["amenity"~"community_centre|library|place_of_worship"](around:${radiusMeters},${lat},${lon});
        node["leisure"~"park|playground|sports_centre|swimming_pool"](around:${radiusMeters},${lat},${lon});
        node["public_transport"="station"](around:${radiusMeters},${lat},${lon});
        node["shop"~"supermarket|convenience"](around:${radiusMeters},${lat},${lon});
        node["amenity"~"restaurant|cafe"](around:${radiusMeters},${lat},${lon});
      );
      out body;
    `;

        const response = await fetch(OVERPASS_API, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) {
            console.error("OSM API error:", response.statusText);
            return getFallbackAmenities(lat, lon, radiusMeters);
        }

        const data = await response.json();
        const amenities = parseOSMResponse(data);

        const result: OSMAmenities = {
            locality: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            radius: radiusMeters,
            amenities: amenities.slice(0, 100), // Limit to 100 amenities
            summary: calculateSummary(amenities),
            cachedAt: new Date().toISOString(),
        };

        // Cache the result
        osmCache.set(cacheKey, {
            data: result,
            expiry: Date.now() + CACHE_TTL_MS,
        });

        return result;
    } catch (error) {
        console.error("OSM API error:", error);
        return getFallbackAmenities(lat, lon, radiusMeters);
    }
}

/**
 * Parse OSM Overpass API response into our amenity format
 */
function parseOSMResponse(data: { elements?: Array<Record<string, unknown>> }): OSMAmenity[] {
    if (!data.elements) return [];

    return data.elements.map((element: Record<string, unknown>) => {
        const tags = element.tags as Record<string, string> | undefined;
        return {
            id: element.id as number,
            type: (tags?.amenity || tags?.leisure || tags?.shop || tags?.public_transport) as string || "unknown",
            name: tags?.name || "Unnamed",
            category: categorizeAmenity(tags || {}),
            lat: element.lat as number,
            lon: element.lon as number,
            address: formatAddress(tags || {}),
            phone: tags?.phone,
            website: tags?.website,
            openingHours: tags?.opening_hours,
        };
    });
}

/**
 * Categorize amenity based on OSM tags
 */
function categorizeAmenity(tags: Record<string, string>): string {
    if (tags.amenity?.match(/school|kindergarten|university|college/)) return "education";
    if (tags.amenity?.match(/hospital|clinic|doctors|pharmacy/)) return "healthcare";
    if (tags.amenity?.match(/community_centre|library/)) return "community";
    if (tags.amenity?.match(/place_of_worship/)) return "worship";
    if (tags.leisure?.match(/park|playground|sports_centre|swimming_pool/)) return "recreation";
    if (tags.public_transport) return "transport";
    if (tags.shop) return "shopping";
    if (tags.amenity?.match(/restaurant|cafe/)) return "dining";
    return "other";
}

/**
 * Format address from OSM tags
 */
function formatAddress(tags: Record<string, string>): string | undefined {
    const parts = [
        tags["addr:housenumber"],
        tags["addr:street"],
        tags["addr:suburb"],
        tags["addr:postcode"],
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : undefined;
}

/**
 * Calculate summary counts by category
 */
function calculateSummary(amenities: OSMAmenity[]): OSMAmenities["summary"] {
    const counts = {
        schools: 0,
        healthcare: 0,
        recreation: 0,
        communitySpaces: 0,
        transport: 0,
        shops: 0,
        restaurants: 0,
        parks: 0,
    };

    for (const a of amenities) {
        switch (a.category) {
            case "education": counts.schools++; break;
            case "healthcare": counts.healthcare++; break;
            case "recreation":
                if (a.type === "park" || a.type === "playground") counts.parks++;
                else counts.recreation++;
                break;
            case "community":
            case "worship":
                counts.communitySpaces++; break;
            case "transport": counts.transport++; break;
            case "shopping": counts.shops++; break;
            case "dining": counts.restaurants++; break;
        }
    }

    return counts;
}

/**
 * Fallback data for when OSM API is unavailable
 */
function getFallbackAmenities(lat: number, lon: number, radius: number): OSMAmenities {
    return {
        locality: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        radius,
        amenities: [],
        summary: {
            schools: 0,
            healthcare: 0,
            recreation: 0,
            communitySpaces: 0,
            transport: 0,
            shops: 0,
            restaurants: 0,
            parks: 0,
        },
        cachedAt: new Date().toISOString(),
    };
}

/**
 * Clear expired cache entries
 */
export function clearExpiredOSMCache(): void {
    const now = Date.now();
    Array.from(osmCache.entries()).forEach(([key, value]) => {
        if (value.expiry < now) {
            osmCache.delete(key);
        }
    });
}
