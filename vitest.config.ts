import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [],
        exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*', 'tests/e2e/**'],
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: [
                'app/**/*.{ts,tsx}',
                'components/**/*.{ts,tsx}',
                'lib/**/*.{ts,tsx}',
                'server/**/*.{ts,tsx}',
                'shared/**/*.{ts,tsx}',
                'hooks/**/*.{ts,tsx}',
                'collections/**/*.{ts,tsx}',
                'scripts/**/*.{ts,tsx}',
                'middleware.ts',
                'payload.config.ts',
                'instrumentation.ts',
                'instrumentation-client.ts'
            ],
            exclude: ['**/*.d.ts', '**/*.test.{ts,tsx}', '**/node_modules/**'],
        },
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
