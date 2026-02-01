import { build } from 'esbuild';
import path from 'path';

async function buildServiceWorker() {
    try {
        await build({
            entryPoints: [path.join(process.cwd(), 'src/service-worker/sw.ts')],
            bundle: true,
            minify: true,
            outfile: path.join(process.cwd(), 'public/sw.js'),
            format: 'iife',
            target: 'es2020',
            sourcemap: process.env.NODE_ENV === 'development',
            define: {
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
            },
        });
        console.log('Service Worker built successfully.');
    } catch (error) {
        console.error('Service Worker build failed:', error);
        process.exit(1);
    }
}

buildServiceWorker();
