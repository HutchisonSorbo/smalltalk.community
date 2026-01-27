import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

/**
 * @fileoverview Gemini Fixer Script
 * 
 * Uses Google's Gemini 2.0 Flash model (via @google/genai) to automatically
 * fix code based on code review comments (e.g. from CodeRabbit).
 * 
 * It reads the file content, applies the fix requested in the comment,
 * and writes the corrected code back to the file.
 * 
 * Requires:
 * - GOOGLE_API_KEY (or GEMINI_API_KEY)
 * - FILE_PATH
 * - COMMENT_BODY
 * 
 * Optional:
 * - GEMINI_MODEL (defaults to 'gemini-2.0-flash')
 * - DIFF_HUNK (for context)
 * 
 * Side Effects:
 * - Reads/Writes files system.
 * - Exits process on error.
 */

const MODEL_NAME = 'gemini-2.0-flash';

// Biome-ignore lint/suspicious/noControlCharactersInRegex: Needed for sanitizing LLM input
const CONTROL_CHARS_REGEX = /[\x00-\x1F\x7F]/g;

interface FixerInput {
    apiKey: string;
    filePath: string;
    commentBody: string;
    diffHunk: string;
    modelName: string;
    absolutePath: string;
    fileContent: string;
}

interface GenAiResponse {
    candidates?: {
        content?: {
            parts?: {
                text: string;
            }[]
        }[]
    }[];
}

interface TimeoutResult {
    error: Error;
}

/**
 * Validates and loads all necessary inputs.
 */
function loadInput(): FixerInput {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const filePath = process.env.FILE_PATH;
    const commentBody = process.env.COMMENT_BODY;
    const diffHunk = process.env.DIFF_HUNK || '';
    const modelName = process.env.GEMINI_MODEL || MODEL_NAME;

    if (!apiKey || !filePath || !commentBody) {
        console.error('Missing required environment variables: GOOGLE_API_KEY, FILE_PATH, COMMENT_BODY');
        process.exit(1);
    }

    const repoRoot = process.cwd();
    const absolutePath = path.resolve(repoRoot, filePath);

    // Path Traversal Check
    const relativePath = path.relative(repoRoot, absolutePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        console.error(`Security Error: Path traversal attempt detected. ${absolutePath} is outside repo root.`);
        process.exit(1);
    }

    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);
        process.exit(1);
    }

    // Verify it's a file
    if (!fs.statSync(absolutePath).isFile()) {
        console.error(`Error: ${absolutePath} is not a regular file.`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(absolutePath, 'utf-8');

    return { apiKey, filePath, commentBody, diffHunk, modelName, absolutePath, fileContent };
}

/**
 * Sanitizes input strings to prevent prompt injection.
 */
function sanitizeInput(str: string): string {
    if (!str) return '';
    return str.replace(CONTROL_CHARS_REGEX, '')
        .replace(/```/g, "'''") // neutralize block escapes
        .slice(0, 10000); // Limit length
}

/**
 * Constructs the prompts for Gemini.
 */
function buildPrompt(input: FixerInput): { systemInstruction: string; userPrompt: string } {
    const { filePath, commentBody, diffHunk, fileContent } = input;
    const safeComment = sanitizeInput(commentBody);
    const safeDiff = sanitizeInput(diffHunk);

    const systemInstruction = `You are an expert software engineer adhering to Australian English standards.
Your task is to fix the code in the provided file based on the code review comment.
STRICT RULES:
1. Return ONLY the corrected code for the entire file.
2. Do not add markdown backticks or explanations.
3. Maintain WCAG 2.2 AA accessibility standards.
4. Ensure data isolation (RLS) is preserved.
5. If the comment is not actionable or unsafe, return the original file content.`;

    const userPrompt = `
CONTEXT:
File Path: ${filePath}
Review Comment: ${safeComment}
Diff Context:
${safeDiff}

FILE CONTENT:
${fileContent}
`;
    return { systemInstruction, userPrompt };
}

/**
 * Generates content using Gemini with retry logic.
 */
async function generateWithRetry(genAI: GoogleGenAI, modelName: string, systemInstruction: string, userPrompt: string, input: FixerInput): Promise<string> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const timeoutMs = 60000;
            const generatePromise = genAI.models.generateContent({
                model: modelName,
                config: {
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    }
                },
                contents: [{
                    role: 'user',
                    parts: [{ text: userPrompt }]
                }]
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
            );

            // Race the generate promise against the timeout
            const result = await Promise.race([generatePromise, timeoutPromise]) as GenerateContentResponse;

            // Result handling based on @google/genai structure
            const candidate = result.candidates?.[0];
            let fixedCode = candidate?.content?.parts?.[0]?.text?.trim() || '';

            // Clean up potential markdown formatting if Gemini ignored the instruction
            if (fixedCode.startsWith('```')) {
                const lines = fixedCode.split('\n');
                fixedCode = lines.slice(1, -1).join('\n');
            }

            return fixedCode;
        } catch (err: any) {
            attempt++;
            console.warn(`Attempt ${attempt} failed for ${input.filePath} with model ${modelName}: ${err.message}`);
            if (attempt >= maxRetries) {
                throw new Error(`Failed to generate content after ${maxRetries} attempts.`);
            }
            // Linear backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    return '';
}

/**
 * Validates the generated code.
 */
function validateOutput(fixedCode: string, input: FixerInput): void {
    if (!fixedCode) {
        console.error('Gemini returned empty response.');
        process.exit(1);
    }

    // 1. Sanity check: Size comparison
    if (fixedCode.length < input.fileContent.length * 0.1 && input.fileContent.length > 50) {
        console.error('Validation failed: Fixed code is suspiciously short.');
        console.log(`Metadata: Fixed Length=${fixedCode.length}, Original Length=${input.fileContent.length}`);
        process.exit(1);
    }
}

/**
 * Writes the fixed code to the file with backup mechanism.
 */
function writeWithBackup(fixedCode: string, input: FixerInput): void {
    const { absolutePath, filePath, fileContent } = input;
    const backupPath = `${absolutePath}.bak`;

    try {
        fs.writeFileSync(backupPath, fileContent);
        console.log(`Backup created at ${backupPath}`);

        fs.writeFileSync(absolutePath, fixedCode);
        console.log(`Successfully applied fix to ${filePath}`);
    } catch (writeErr) {
        console.error('Failed to write fixed code:', writeErr);
        // Try to restore backup if it exists
        if (fs.existsSync(backupPath)) {
            try {
                fs.copyFileSync(backupPath, absolutePath);
                console.log('Restored original file from backup.');
            } catch (restoreErr) {
                console.error('CRITICAL: Failed to restore backup!', restoreErr);
            }
        }
        process.exit(1);
    }
}

/**
 * Main execution function.
 * @async
 * @returns {Promise<void>}
 */
async function run(): Promise<void> {
    try {
        const input = loadInput();
        const genAI = new GoogleGenAI({ apiKey: input.apiKey });
        const { systemInstruction, userPrompt } = buildPrompt(input);

        console.log(`Requesting fix for ${input.filePath} using ${input.modelName}...`);

        const fixedCode = await generateWithRetry(genAI, input.modelName, systemInstruction, userPrompt, input);

        validateOutput(fixedCode, input);
        writeWithBackup(fixedCode, input);

    } catch (error) {
        console.error('Error during Gemini generation:', error);
        process.exit(1);
    }
}

run();