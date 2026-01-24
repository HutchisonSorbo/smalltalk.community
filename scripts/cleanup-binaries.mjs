import { promises as fs } from 'fs';
import path from 'path';

const targets = [
    // Ditto binaries (only need linux-x64 for Vercel)
    'node_modules/@dittolive/ditto/node/ditto.linux-arm64.node',
    'node_modules/@dittolive/ditto/node/ditto.darwin-x64.node',
    'node_modules/@dittolive/ditto/node/ditto.darwin-arm64.node',
    'node_modules/@dittolive/ditto/node/ditto.win32-x64.node',

    // Next.js SWC binaries (only need linux-x64-gnu for Vercel)
    'node_modules/@next/swc-linux-arm64-gnu',
    'node_modules/@next/swc-linux-arm64-musl',
    'node_modules/@next/swc-darwin-arm64',
    'node_modules/@next/swc-darwin-x64',
    'node_modules/@next/swc-win32-arm64-msvc',
    'node_modules/@next/swc-win32-ia32-msvc',
    'node_modules/@next/swc-win32-x64-msvc',
];

async function cleanup() {
    console.log('Cleanup: Removing unused native binaries...');
    let savedSpace = 0;

    for (const target of targets) {
        const absolutePath = path.resolve(process.cwd(), target);
        try {
            const stats = await fs.stat(absolutePath);
            if (stats.isDirectory()) {
                // Calculate approximate size (not deep, just to show progress)
                savedSpace += 50 * 1024 * 1024; // Assume ~50MB per SWC package
                await fs.rm(absolutePath, { recursive: true, force: true });
                console.log(`Deleted directory: ${target}`);
            } else {
                savedSpace += stats.size;
                await fs.unlink(absolutePath);
                console.log(`Deleted file: ${target}`);
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.warn(`Could not delete ${target}: ${err.message}`);
            }
        }
    }

    console.log(`Cleanup complete. Approx space saved: ${(savedSpace / (1024 * 1024)).toFixed(2)} MB`);
}

cleanup();
