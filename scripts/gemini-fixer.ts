import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

/**
 * @fileoverview Gemini Fixer Script (Batch Mode)
 * 
 * Uses Google's Gemini 2.0 Flash model to automatically fix code based on 
 * code review comments (e.g. from CodeRabbit).
 * 
 * Features:
 * - Reads `comments.json` (GitHub API format)
 * - Groups comments by file
 * - Batches fixes: 1 API call per file
 * - Linear processing to respect rate limits (implicit via awaiting)
 */

const MODEL_NAME = 'gemini-2.0-flash';

// Biome-ignore lint/suspicious/noControlCharactersInRegex: Needed for sanitizing LLM input
const CONTROL_CHARS_REGEX = /[\x00-\x1F\x7F]/g;

interface Comment {
    path: string;
    body: string;
    diff_hunk: string;
    user: {
        login: string;
    };
    line?: number;
}

interface FileTask {
    filePath: string;
    absolutePath: string;
    fileContent: string;
    comments: Comment[];
}

interface Config {
    apiKey: string;
    modelName: string;
    repoRoot: string;
}

/**
 * Validates and loads configuration.
 * @returns {Config} The configuration object.
 */
function loadConfig(): Config {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Missing required environment variable: GOOGLE_API_KEY or GEMINI_API_KEY');
        process.exit(1);
    }
    const modelName = process.env.GEMINI_MODEL || MODEL_NAME;
    const repoRoot = process.cwd();
    return { apiKey, modelName, repoRoot };
}

/**
 * Loads comments and prepares tasks grouped by file.
 * @param {Config} config - The configuration object.
 * @returns {FileTask[]} An array of tasks, where each task corresponds to a file and its comments.
 */
function loadTasks(config: Config): FileTask[] {
    const commentsFile = process.env.COMMENTS_FILE;
    if (!commentsFile) {
        console.error('Missing required environment variable: COMMENTS_FILE');
        // If not running in batch mode, we might fallback to single-file mode? 
        // For now, let's enforce batch mode as per plan.
        process.exit(1);
    }

    if (!fs.existsSync(commentsFile)) {
        console.error(`Comments file not found: ${commentsFile}`);
        process.exit(1);
    }

    const rawComments = fs.readFileSync(commentsFile, 'utf-8');
    let comments: Comment[];
    try {
        comments = JSON.parse(rawComments);
    } catch (e) {
        console.error('Failed to parse comments.json', e);
        process.exit(1);
    }

    if (!Array.isArray(comments)) {
        console.error(`Invalid comments format in ${commentsFile}: expected array, got ${typeof comments}`);
        process.exit(1);
    }

    // Safe validation and filtering
    const validComments: Comment[] = [];
    for (const c of comments) {
        if (!c || typeof c !== 'object') {
            console.warn('Skipping invalid comment: not an object');
            continue;
        }
        if (!c.user || typeof c.user.login !== 'string') {
            console.warn('Skipping invalid comment: missing user.login');
            continue;
        }
        if (typeof c.path !== 'string') {
            console.warn('Skipping invalid comment: missing path');
            continue;
        }
        validComments.push(c);
    }

    // Filter for CodeRabbit
    const targetComments = validComments.filter(c => c.user.login.toLowerCase() === 'coderabbitai[bot]');
    if (targetComments.length === 0) {
        console.log('No CodeRabbit comments found.');
        return [];
    }

    // Group by file
    const groups = new Map<string, Comment[]>();
    for (const c of targetComments) {
        if (!groups.has(c.path)) {
            groups.set(c.path, []);
        }
        groups.get(c.path)?.push(c);
    }

    const tasks: FileTask[] = [];
    for (const [filePath, fileComments] of Array.from(groups)) {
        const absolutePath = path.resolve(config.repoRoot, filePath);

        // Security check
        const relativePath = path.relative(config.repoRoot, absolutePath);
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
            console.warn(`Skipping suspicious path: ${filePath}`);
            continue;
        }

        if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
            const fileContent = fs.readFileSync(absolutePath, 'utf-8');
            tasks.push({ filePath, absolutePath, fileContent, comments: fileComments });
        } else {
            console.warn(`File not found or not a file: ${filePath}`);
        }
    }
    return tasks;
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
function buildPrompt(task: FileTask): { systemInstruction: string; userPrompt: string } {
    const { filePath, fileContent, comments } = task;

    const sanitizedFilePath = sanitizeInput(filePath);
    const issues = comments.map((c, i) => {
        return `ISSUE #${i + 1}:
Comment: ${sanitizeInput(c.body)}
Diff Context:
${sanitizeInput(c.diff_hunk)}
`;
    }).join('\n');

    const systemInstruction = `You are an expert software engineer adhering to Australian English standards.
Your task is to fix the code in the provided file based on the code review comments.
STRICT RULES:
1. Return ONLY the corrected code for the entire file.
2. Do not add markdown backticks or explanations.
3. Maintain WCAG 2.2 AA accessibility standards.
4. Ensure data isolation (RLS) is preserved.
5. Address ALL listed issues in a single pass.
6. If the comments are not actionable or unsafe, return the original file content.`;

    const userPrompt = `
CONTEXT:
File Path: ${sanitizedFilePath}
Review Comments:
${issues}

FILE CONTENT:
${fileContent}
`;
    return { systemInstruction, userPrompt };
}

/**
 * Generates content using Gemini with retry logic.
 * @param {GoogleGenAI} genAI - The GenAI client instance.
 * @param {string} modelName - The model name to use.
 * @param {string} systemInstruction - The system instruction prompt.
 * @param {string} userPrompt - The user prompt details.
 * @param {string} filePath - The file path for logging/context.
 * @returns {Promise<string>} The generated fixed code.
 * @throws {Error} If generation fails after retries.
 */
async function generateWithRetry(genAI: GoogleGenAI, modelName: string, systemInstruction: string, userPrompt: string, filePath: string): Promise<string> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const timeoutMs = 90000; // Increased timeout for potentially larger files/tasks
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
            console.warn(`Attempt ${attempt} failed for ${filePath} with model ${modelName}: ${err.message}`);
            if (attempt >= maxRetries) {
                // If we fail, we rethrow so we can catch it in the loop and skip the file
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
 * @param {string} fixedCode - The code generated by Gemini.
 * @param {string} originalContent - The original content of the file.
 * @throws {Error} If Gemini returned an empty response.
 * @throws {Error} If the fixed code is suspiciously short compared to the original.
 */
function validateOutput(fixedCode: string, originalContent: string): void {
    if (!fixedCode) {
        throw new Error('Gemini returned empty response.');
    }

    // 1. Sanity check: Size comparison
    if (fixedCode.length < originalContent.length * 0.1 && originalContent.length > 50) {
        throw new Error('Validation failed: Fixed code is suspiciously short.');
    }
}

/**
 * Writes the fixed code to the file with backup mechanism.
 */
function writeWithBackup(fixedCode: string, task: FileTask): void {
    const { absolutePath, filePath, fileContent } = task;
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
        throw writeErr;
    }
}

/**
 * Main execution function.
 */
async function run(): Promise<void> {
    try {
        const config = loadConfig();
        const tasks = loadTasks(config);
        const genAI = new GoogleGenAI({ apiKey: config.apiKey });

        if (tasks.length === 0) {
            console.log('No tasks to process.');
            return;
        }

        console.log(`Found ${tasks.length} files to process.`);

        let failureCount = 0;

        for (const task of tasks) {
            console.log(`Processing ${task.filePath} with ${task.comments.length} comments...`);
            try {
                const { systemInstruction, userPrompt } = buildPrompt(task);
                const fixedCode = await generateWithRetry(genAI, config.modelName, systemInstruction, userPrompt, task.filePath);

                validateOutput(fixedCode, task.fileContent);
                writeWithBackup(fixedCode, task);
            } catch (e: any) {
                console.error(`Failed to process ${task.filePath}: ${e.message}`);
                failureCount++;
            }
        }

        if (failureCount > 0) {
            console.warn(`Completed with ${failureCount} errors.`);
            // We exit 0 even with errors to allow other fixes to be committed, 
            // unless we want to fail the whole workflow? 
            // Better to commit what we fixed. The logs will show errors.
            // But if ALL failed, maybe exit 1? 
            if (failureCount === tasks.length) {
                process.exit(1);
            }
        }

    } catch (error) {
        console.error('Fatal error during execution:', error);
        process.exit(1);
    }
}

run();