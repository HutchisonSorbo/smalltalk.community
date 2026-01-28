import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, validateOutput, buildPrompt, loadTasks } from '../../scripts/gemini-fixer';

vi.mock('fs', async () => {
    const actual = await vi.importActual<typeof import('fs')>('fs');
    return {
        ...actual,
        readFileSync: vi.fn(),
        existsSync: vi.fn(),
        statSync: vi.fn(),
    };
});

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

        it('should load config from GEMINI_API_KEY when GOOGLE_API_KEY is missing', () => {
            delete process.env.GOOGLE_API_KEY;
            process.env.GEMINI_API_KEY = 'fallback-key';
            process.env.GEMINI_MODEL = 'test-model';

            const config = loadConfig();
            expect(config.apiKey).toBe('fallback-key');
        });

        it('should exit if API key is missing', () => {
            const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
            delete process.env.GOOGLE_API_KEY;
            delete process.env.GEMINI_API_KEY;

            expect(() => loadConfig()).toThrow('exit');
            expect(exitSpy).toHaveBeenCalledWith(1);
        });
    });

    describe('loadTasks', () => {
        beforeEach(() => {
            process.env.COMMENTS_FILE = 'comments.json';
        });

        it('should exit if COMMENTS_FILE is missing', () => {
            const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
            delete process.env.COMMENTS_FILE;
            expect(() => loadTasks({ apiKey: 'key', modelName: 'model', repoRoot: 'root' })).toThrow('exit');
            expect(exitSpy).toHaveBeenCalledWith(1);
        });

        it('should filter out non-coderabbit comments and path traversal', () => {
            const comments = [
                { path: 'safe.ts', user: { login: 'coderabbitai[bot]' }, body: 'fix', diff_hunk: '@@' },
                { path: 'other.ts', user: { login: 'human' }, body: 'fix', diff_hunk: '@@' },
                { path: '../secret.ts', user: { login: 'coderabbitai[bot]' }, body: 'fix', diff_hunk: '@@' }
            ];

            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(comments));
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
            // Mock readFileSync for the actual files too
            vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
                if (p === 'comments.json') return JSON.stringify(comments);
                return 'file content';
            });

            const tasks = loadTasks({ apiKey: 'key', modelName: 'model', repoRoot: 'root' });
            expect(tasks).toHaveLength(1);
            expect(tasks[0].filePath).toBe('safe.ts');
        });

        it('should exit if COMMENTS_FILE is invalid JSON', () => {
            const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
            vi.mocked(fs.readFileSync).mockReturnValue('invalid json');
            vi.mocked(fs.existsSync).mockReturnValue(true);

            expect(() => loadTasks({ apiKey: 'key', modelName: 'model', repoRoot: 'root' })).toThrow('exit');
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

        it('should throw for suspiciously short code (threshold > 500 chars)', () => {
            const original = 'a'.repeat(600);
            const fixed = 'a'.repeat(200); // 33% < 50%
            expect(() => validateOutput(fixed, original)).toThrow(/suspiciously short/);
        });

        it('should throw if critical export keywords are removed', () => {
            const original = 'export class DatabaseStorage { }';
            const fixed = 'class DatabaseStorage { }';
            expect(() => validateOutput(fixed, original)).toThrow(/missing critical keyword/);
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