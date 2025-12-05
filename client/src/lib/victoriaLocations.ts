export interface VictoriaLocation {
  suburb: string;
  region: string;
  postcode: string;
}

export const victoriaLocations: VictoriaLocation[] = [
  { suburb: "Melbourne CBD", region: "Melbourne CBD", postcode: "3000" },
  { suburb: "Docklands", region: "Melbourne CBD", postcode: "3008" },
  { suburb: "Southbank", region: "Melbourne CBD", postcode: "3006" },
  { suburb: "Carlton", region: "Inner Melbourne", postcode: "3053" },
  { suburb: "Fitzroy", region: "Inner Melbourne", postcode: "3065" },
  { suburb: "Collingwood", region: "Inner Melbourne", postcode: "3066" },
  { suburb: "Richmond", region: "Inner Melbourne", postcode: "3121" },
  { suburb: "South Yarra", region: "Inner Melbourne", postcode: "3141" },
  { suburb: "Prahran", region: "Inner Melbourne", postcode: "3181" },
  { suburb: "St Kilda", region: "Inner Melbourne", postcode: "3182" },
  { suburb: "Brunswick", region: "Northern Melbourne", postcode: "3056" },
  { suburb: "Coburg", region: "Northern Melbourne", postcode: "3058" },
  { suburb: "Preston", region: "Northern Melbourne", postcode: "3072" },
  { suburb: "Northcote", region: "Northern Melbourne", postcode: "3070" },
  { suburb: "Thornbury", region: "Northern Melbourne", postcode: "3071" },
  { suburb: "Reservoir", region: "Northern Melbourne", postcode: "3073" },
  { suburb: "Bundoora", region: "Northern Melbourne", postcode: "3083" },
  { suburb: "Mill Park", region: "Northern Melbourne", postcode: "3082" },
  { suburb: "Whittlesea", region: "Northern Melbourne", postcode: "3757" },
  { suburb: "Epping", region: "Northern Melbourne", postcode: "3076" },
  { suburb: "Footscray", region: "Western Melbourne", postcode: "3011" },
  { suburb: "Yarraville", region: "Western Melbourne", postcode: "3013" },
  { suburb: "Williamstown", region: "Western Melbourne", postcode: "3016" },
  { suburb: "Altona", region: "Western Melbourne", postcode: "3018" },
  { suburb: "Werribee", region: "Western Melbourne", postcode: "3030" },
  { suburb: "Melton", region: "Western Melbourne", postcode: "3337" },
  { suburb: "Sunshine", region: "Western Melbourne", postcode: "3020" },
  { suburb: "St Albans", region: "Western Melbourne", postcode: "3021" },
  { suburb: "Caroline Springs", region: "Western Melbourne", postcode: "3023" },
  { suburb: "Tarneit", region: "Western Melbourne", postcode: "3029" },
  { suburb: "Point Cook", region: "Western Melbourne", postcode: "3030" },
  { suburb: "Box Hill", region: "Eastern Melbourne", postcode: "3128" },
  { suburb: "Doncaster", region: "Eastern Melbourne", postcode: "3108" },
  { suburb: "Camberwell", region: "Eastern Melbourne", postcode: "3124" },
  { suburb: "Hawthorn", region: "Eastern Melbourne", postcode: "3122" },
  { suburb: "Kew", region: "Eastern Melbourne", postcode: "3101" },
  { suburb: "Ringwood", region: "Eastern Melbourne", postcode: "3134" },
  { suburb: "Croydon", region: "Eastern Melbourne", postcode: "3136" },
  { suburb: "Lilydale", region: "Eastern Melbourne", postcode: "3140" },
  { suburb: "Mitcham", region: "Eastern Melbourne", postcode: "3132" },
  { suburb: "Glen Waverley", region: "South Eastern Melbourne", postcode: "3150" },
  { suburb: "Clayton", region: "South Eastern Melbourne", postcode: "3168" },
  { suburb: "Dandenong", region: "South Eastern Melbourne", postcode: "3175" },
  { suburb: "Springvale", region: "South Eastern Melbourne", postcode: "3171" },
  { suburb: "Oakleigh", region: "South Eastern Melbourne", postcode: "3166" },
  { suburb: "Chadstone", region: "South Eastern Melbourne", postcode: "3148" },
  { suburb: "Cranbourne", region: "South Eastern Melbourne", postcode: "3977" },
  { suburb: "Pakenham", region: "South Eastern Melbourne", postcode: "3810" },
  { suburb: "Berwick", region: "South Eastern Melbourne", postcode: "3806" },
  { suburb: "Narre Warren", region: "South Eastern Melbourne", postcode: "3805" },
  { suburb: "Frankston", region: "Mornington Peninsula", postcode: "3199" },
  { suburb: "Mornington", region: "Mornington Peninsula", postcode: "3931" },
  { suburb: "Rosebud", region: "Mornington Peninsula", postcode: "3939" },
  { suburb: "Sorrento", region: "Mornington Peninsula", postcode: "3943" },
  { suburb: "Portsea", region: "Mornington Peninsula", postcode: "3944" },
  { suburb: "Hastings", region: "Mornington Peninsula", postcode: "3915" },
  { suburb: "Somerville", region: "Mornington Peninsula", postcode: "3912" },
  { suburb: "Geelong", region: "Geelong", postcode: "3220" },
  { suburb: "Geelong West", region: "Geelong", postcode: "3218" },
  { suburb: "Newtown", region: "Geelong", postcode: "3220" },
  { suburb: "Belmont", region: "Geelong", postcode: "3216" },
  { suburb: "Ocean Grove", region: "Geelong", postcode: "3226" },
  { suburb: "Torquay", region: "Geelong", postcode: "3228" },
  { suburb: "Lara", region: "Geelong", postcode: "3212" },
  { suburb: "Corio", region: "Geelong", postcode: "3214" },
  { suburb: "Ballarat", region: "Ballarat", postcode: "3350" },
  { suburb: "Ballarat East", region: "Ballarat", postcode: "3350" },
  { suburb: "Ballarat North", region: "Ballarat", postcode: "3350" },
  { suburb: "Wendouree", region: "Ballarat", postcode: "3355" },
  { suburb: "Buninyong", region: "Ballarat", postcode: "3357" },
  { suburb: "Bendigo", region: "Bendigo", postcode: "3550" },
  { suburb: "Kangaroo Flat", region: "Bendigo", postcode: "3555" },
  { suburb: "Eaglehawk", region: "Bendigo", postcode: "3556" },
  { suburb: "Strathdale", region: "Bendigo", postcode: "3550" },
  { suburb: "Epsom", region: "Bendigo", postcode: "3551" },
  { suburb: "Shepparton", region: "Shepparton", postcode: "3630" },
  { suburb: "Mooroopna", region: "Shepparton", postcode: "3629" },
  { suburb: "Kialla", region: "Shepparton", postcode: "3631" },
  { suburb: "Wodonga", region: "Wodonga", postcode: "3690" },
  { suburb: "Albury", region: "Wodonga", postcode: "2640" },
  { suburb: "Warrnambool", region: "Warrnambool", postcode: "3280" },
  { suburb: "Koroit", region: "Warrnambool", postcode: "3282" },
  { suburb: "Port Fairy", region: "Warrnambool", postcode: "3284" },
  { suburb: "Sale", region: "Gippsland", postcode: "3850" },
  { suburb: "Traralgon", region: "Gippsland", postcode: "3844" },
  { suburb: "Morwell", region: "Gippsland", postcode: "3840" },
  { suburb: "Moe", region: "Gippsland", postcode: "3825" },
  { suburb: "Warragul", region: "Gippsland", postcode: "3820" },
  { suburb: "Bairnsdale", region: "Gippsland", postcode: "3875" },
  { suburb: "Lakes Entrance", region: "Gippsland", postcode: "3909" },
];

export const victoriaRegions = [
  "Melbourne CBD",
  "Inner Melbourne",
  "Northern Melbourne",
  "Western Melbourne",
  "Eastern Melbourne",
  "South Eastern Melbourne",
  "Mornington Peninsula",
  "Geelong",
  "Ballarat",
  "Bendigo",
  "Shepparton",
  "Wodonga",
  "Warrnambool",
  "Gippsland",
  "Other Victoria",
] as const;

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
  return `${location.suburb}, ${location.region} ${location.postcode}`;
}

export function getSuburbsForRegion(region: string): VictoriaLocation[] {
  return victoriaLocations.filter((loc) => loc.region === region);
}

export function getUniqueRegions(): string[] {
  return Array.from(new Set(victoriaLocations.map((loc) => loc.region)));
}

export function extractRegionFromLocation(locationString: string): string | null {
  if (!locationString) return null;
  const match = locationString.match(/,\s*([^,]+?)\s+\d+$/);
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
