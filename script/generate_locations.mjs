
import fs from 'fs';
import path from 'path';

const URL = 'https://raw.githubusercontent.com/matthewproctor/australianpostcodes/master/australian_postcodes.json';
const OUTPUT_FILE = path.resolve(process.cwd(), 'lib/victoriaLocations.ts');

function toTitleCase(str) {
    return str.toLowerCase().replace(/(?:^|[\s\-\(\)])\w/g, function (match) {
        return match.toUpperCase();
    });
}

// Helper to fix Mc/Mac (simple heuristic, can be improved)
function fixMc(str) {
    return str.replace(/\bMc([a-z])/g, (_, char) => 'Mc' + char.toUpperCase())
        .replace(/\bMac([a-z])/g, (_, char) => 'Mac' + char.toUpperCase());
}

async function main() {
    console.log('Fetching locations from', URL);
    const response = await fetch(URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();

    // Filter for Victoria
    const vicLocationsRaw = data.filter(item => item.state === 'VIC');

    // Process and Map
    const processed = vicLocationsRaw.map(item => {
        let region = item.sa4name || 'Other Victoria';
        // Clean up region names if needed
        // e.g. "Melbourne - Inner" -> "Inner Melbourne"? 
        // Let's keep SA4 names for consistency, they are standard.

        const suburb = fixMc(toTitleCase(item.locality));

        return {
            suburb,
            region,
            postcode: item.postcode
        };
    });

    // Deduplicate
    const uniqueMap = new Map();
    processed.forEach(loc => {
        const key = `${loc.suburb}-${loc.postcode}`;
        // If duplicate suburb+postcode, prefer the one with a "better" region (not Other)?
        // Actually SA4 should be consistent.
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, loc);
        }
    });

    const finalLocations = Array.from(uniqueMap.values());

    // Sort
    finalLocations.sort((a, b) => a.suburb.localeCompare(b.suburb));

    // Get unique regions
    const uniqueRegions = Array.from(new Set(finalLocations.map(l => l.region))).sort();

    console.log(`Generated ${finalLocations.length} unique locations.`);
    console.log(`Found ${uniqueRegions.length} unique regions.`);

    // Construct the file content
    const fileContent = `export interface VictoriaLocation {
  suburb: string;
  region: string;
  postcode: string;
}

export const victoriaLocations: VictoriaLocation[] = ${JSON.stringify(finalLocations, null, 2)};

export const victoriaRegions = ${JSON.stringify(uniqueRegions, null, 2)} as const;

export function searchLocations(query: string, limit: number = 10): VictoriaLocation[] {
  if (!query.trim()) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  const results = victoriaLocations.filter((location) => {
    const suburbMatch = location.suburb.toLowerCase().includes(normalizedQuery);
    const regionMatch = location.region.toLowerCase().includes(normalizedQuery);
    const postcodeMatch = location.postcode.includes(normalizedQuery);
    return suburbMatch || regionMatch || postcodeMatch;
  });
  
  results.sort((a, b) => {
    const aStartsWithQuery = a.suburb.toLowerCase().startsWith(normalizedQuery);
    const bStartsWithQuery = b.suburb.toLowerCase().startsWith(normalizedQuery);
    if (aStartsWithQuery && !bStartsWithQuery) return -1;
    if (!aStartsWithQuery && bStartsWithQuery) return 1;
    return a.suburb.localeCompare(b.suburb);
  });
  
  return results.slice(0, limit);
}

export function formatLocation(location: VictoriaLocation): string {
  return \`\${location.suburb}, \${location.region} \${location.postcode}\`;
}

export function getSuburbsForRegion(region: string): VictoriaLocation[] {
  return victoriaLocations.filter((loc) => loc.region === region);
}

export function getUniqueRegions(): string[] {
  return Array.from(new Set(victoriaLocations.map((loc) => loc.region)));
}

export function extractRegionFromLocation(locationString: string): string | null {
  if (!locationString) return null;
  const match = locationString.match(/,\\s*([^,]+?)\\s+\\d+$/);
  if (match) {
    return match[1].trim();
  }
  const inRegions = victoriaRegions.find(
    (r) => r.toLowerCase() === locationString.toLowerCase().trim()
  );
  if (inRegions) return inRegions;
  const locationLower = locationString.toLowerCase().trim();
  const foundLocation = victoriaLocations.find(
    (loc) => loc.suburb.toLowerCase() === locationLower
  );
  if (foundLocation) return foundLocation.region;
  return locationString.trim() || null;
}

export function parseLocationForStorage(locationString: string): string {
  if (!locationString) return '';
  const parts = locationString.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return parts[0];
  }
  return locationString.trim();
}
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log('Successfully wrote to', OUTPUT_FILE);
}

main().catch(console.error);
