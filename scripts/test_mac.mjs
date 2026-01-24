
const URL = 'https://raw.githubusercontent.com/matthewproctor/australianpostcodes/master/australian_postcodes.json';

function toTitleCase(str) {
    return str.toLowerCase().replace(/(?:^|[\s\-\(\)])\w/g, function (match) {
        return match.toUpperCase();
    });
}

function fixMc(str) {
    return str
        .replace(/\bMc([a-z])/g, (_, char) => 'Mc' + char.toUpperCase())
        // .replace(/\bMac([a-z])/g, (_, char) => 'Mac' + char.toUpperCase()) // Removed Mac handling
        .replace(/\bMc\b/g, 'MC'); // Handle "Mc" whole word as "MC" (e.g. Mail Centre)
}

async function main() {
    console.log('Fetching locations from', URL);
    const response = await fetch(URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const data = await response.json();

    const vicLocations = data.filter(item => item.state === 'VIC');

    const relevantNames = new Set();

    vicLocations.forEach(item => {
        const locality = item.locality;
        if (/\bMc/i.test(locality) || /\bMac/i.test(locality)) {
            relevantNames.add(locality);
        }
    });

    console.log('--- Relevant Names (Raw) -> TitleCase -> New Fix ---');
    Array.from(relevantNames).sort().forEach(name => {
        const title = toTitleCase(name);
        const fixed = fixMc(title);
        console.log(`${name} -> ${title} -> ${fixed}`);
    });
}

main().catch(console.error);
