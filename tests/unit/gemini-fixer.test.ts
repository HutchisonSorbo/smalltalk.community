import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import { loadConfig, validateOutput, buildPrompt } from '../../scripts/gemini-fixer';

vi.mock('fs');

describe('gemini-fixer', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.clearAllMocks();
    });

    describe('loadConfig', () => {
        it('should load config from environment variables', () => {
            process.env.GOOGLE_API_KEY = 'test-key';
            process.env.GEMINI_MODEL = 'test-model';

            const config = loadConfig();
            expect(config.apiKey).toBe('test-key');
            expect(config.modelName).toBe('test-model');
        });

        it('should exit if API key is missing', () => {
            const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
            delete process.env.GOOGLE_API_KEY;
            delete process.env.GEMINI_API_KEY;

            expect(() => loadConfig()).toThrow('exit');
            expect(exitSpy).toHaveBeenCalledWith(1);
        });
    });

    describe('validateOutput', () => {
        it('should pass for valid code', () => {
            const original = 'const x = 1;';
            const fixed = 'const x = 2;';
            expect(() => validateOutput(fixed, original)).not.toThrow();
        });

        it('should throw for empty response', () => {
            expect(() => validateOutput('', 'code')).toThrow('Gemini returned empty response.');
        });

        it('should throw for suspiciously short code', () => {
            const original = 'a'.repeat(100);
            const fixed = 'a';
            expect(() => validateOutput(fixed, original)).toThrow('Validation failed: Fixed code is suspiciously short.');
        });
    });

    describe('buildPrompt', () => {
        it('should include Australian English requirements', () => {
            const task = {
                filePath: 'test.ts',
                absolutePath: '/abs/test.ts',
                fileContent: 'const x = 1;',
                comments: [{
                    path: 'test.ts',
                    body: 'Fix it',
                    diff_hunk: '@@ -1 +1 @@',
                    user: { login: 'coderabbitai[bot]' }
                }]
            };

            const { systemInstruction } = buildPrompt(task);
            expect(systemInstruction).toContain('Australian English standards');
            expect(systemInstruction).toContain('organisation');
            expect(systemInstruction).toContain('utilise');
        });
    });
});
