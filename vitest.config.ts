import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*', 'tests/e2e/**'],
        coverage: {
            provider: 'istanbul',
            reportsDirectory: './coverage',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: [
                'app/**/*.{ts,tsx}',
                'components/**/*.{ts,tsx}',
                'lib/**/*.{ts,tsx}',
                'server/**/*.{ts,tsx}',
                'shared/**/*.{ts,tsx}',
                'hooks/**/*.{ts,tsx}',
                'scripts/**/*.{ts,tsx}',
                'proxy.ts',
                'instrumentation.ts',
                'instrumentation-client.ts'
            ],
            exclude: ['**/*.d.ts', '**/*.test.{ts,tsx}', '**/node_modules/**'],
        },
        alias: {
            '@': path.resolve(__dirname, './'),
            '@shared': path.resolve(__dirname, './shared'),
        },
    },
});
