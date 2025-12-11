
const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('australian_postcodes.csv');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // Map: "suburb|postcode" -> {lat, long}
  const coordsMap = new Map();

  console.log("Reading CSV...");
  for await (const line of rl) {
    // Simple CSV parse handling quotes?
    // The data seems to quote strings: "21820","0200","Australian National University","ACT",...
    // I can just split by `","` (ignoring edge cases for now as this dataset looks regular).
    // Trimming first and last quote.
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    // Remove surrounding quotes if present on the whole line logic, or just split.
    // Regex to split by `","` is safer.
    // Split by `","`.
    const parts = cleanLine.substring(1, cleanLine.length - 1).split('","');

    if (parts.length < 6) continue;

    // 1: Postcode, 2: Suburb, 3: State, 4: Long, 5: Lat
    const postcode = parts[1];
    const suburb = parts[2];
    const state = parts[3];
    const longitude = parts[4];
    const latitude = parts[5];

    if (state === 'VIC') {
      const key = `${suburb.toLowerCase()}|${postcode}`;
      coordsMap.set(key, { latitude, longitude });
    }
  }
  console.log(`Loaded ${coordsMap.size} VIC locations.`);

  console.log(`Loaded ${coordsMap.size} VIC locations.`);

  // Read TS file content
  const tsPath = 'lib/victoriaLocations.ts';
  const content = fs.readFileSync(tsPath, 'utf8');

  // 1. Update Interface
  let updatedContent = content.replace(
    /export interface VictoriaLocation \{[\s\S]*?\}/,
    `export interface VictoriaLocation {
  suburb: string;
  region: string;
  postcode: string;
  latitude?: string;
  longitude?: string;
}`
  );

  // 2. Inject Coordinates
  // We will iterate line by line to modify the array logic safely

  const lines = updatedContent.split('\n');
  const newLines = [];

  let currentSuburb = null;
  let currentPostcode = null;
  let insideObject = false;
  let bufferLines = []; // lines for the current object

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect object start
    if (line.trim() === '{') {
      insideObject = true;
      bufferLines = [line];
      currentSuburb = null;
      currentPostcode = null;
      continue;
    }

    if (insideObject) {
      bufferLines.push(line);

      // Extract suburb
      const subMatch = line.match(/"suburb":\s*"([^"]+)"/);
      if (subMatch) currentSuburb = subMatch[1];

      // Extract postcode
      const postMatch = line.match(/"postcode":\s*"([^"]+)"/);
      if (postMatch) currentPostcode = postMatch[1];

      // Detect object end
      if (line.trim().startsWith('}') || line.trim().startsWith('},')) {
        // If we have data, inject coords before the last line (which is `}` or `},`)
        if (currentSuburb && currentPostcode) {
          const key = `${currentSuburb.toLowerCase()}|${currentPostcode}`;
          const coords = coordsMap.get(key);

          if (coords) {
            // Inject before the closing brace (last element of bufferLines)
            const closingLine = bufferLines.pop();
            // Add comma to previous line if needed? 
            // The existing file structure has comma after postcode usually?
            // "postcode": "3737" without comma? or with?
            // Let's check previous line.
            const lastDataLine = bufferLines[bufferLines.length - 1];
            if (lastDataLine && !lastDataLine.trim().endsWith(',')) {
              bufferLines[bufferLines.length - 1] += ',';
            }

            bufferLines.push(`    "latitude": "${coords.latitude}",`);
            bufferLines.push(`    "longitude": "${coords.longitude}"`);
            bufferLines.push(closingLine);
          }
        }

        // Push buffer to newLines
        newLines.push(...bufferLines);
        insideObject = false;
        bufferLines = [];
      }
    } else {
      newLines.push(line);
    }
  }

  fs.writeFileSync(tsPath, newLines.join('\n'));
  console.log("File updated with coordinates.");
}

processLineByLine();
