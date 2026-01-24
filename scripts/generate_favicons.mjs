
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [
    16, 24, 32, 57, 60, 70, 72, 76, 96, 114, 120, 144, 150, 152, 180, 192, 310, 512
];

const inputImage = 'public/icon.png';
const outputDir = 'public';

async function generateFavicons() {
    if (!fs.existsSync(inputImage)) {
        console.error(`Input file not found: ${inputImage}`);
        return;
    }

    // 1. Generate PNGs
    for (const size of sizes) {
        const outputFilename = `icons8-musical note-forma-light-${size}.png`;
        const outputPath = path.join(outputDir, outputFilename);

        try {
            await sharp(inputImage)
                .resize(size, size)
                .toFile(outputPath);
            console.log(`Generated: ${outputFilename}`);
        } catch (error) {
            console.error(`Error generating ${outputFilename}:`, error);
        }
    }

    // 2. Handle SVG mask icon (Copy existing svg or creating dummy)
    // User requested "icons8-musical note-forma-light-24.svg"
    // We'll copy public/icon.svg to this path if it exists
    const inputSvg = 'public/icon.svg';
    const outputSvg = path.join(outputDir, 'icons8-musical note-forma-light-24.svg');
    if (fs.existsSync(inputSvg)) {
        fs.copyFileSync(inputSvg, outputSvg);
        console.log(`Generated: icons8-musical note-forma-light-24.svg`);
    } else {
        console.warn("Input SVG not found, skipping SVG generation.");
    }
}

generateFavicons();
