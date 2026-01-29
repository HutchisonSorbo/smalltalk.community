import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * @fileoverview Gemini Fixer Script (Batch Mode)
 * 
 * Uses Google's Gemini 3 Flash model to automatically fix code based on 
 * code review comments (e.g. from CodeRabbit).
 * 
 * Features:
 * - Reads `comments.json` (GitHub API format)
 * - Groups comments by file
 * - Batches fixes: 1 API call per file
 * - Linear processing to respect rate limits (implicit via awaiting)
 */

const MODEL_NAME = 'gemini-3-flash-preview';

// Biome-ignore lint/suspicious/noControlCharactersInRegex: Needed for sanitising LLM input
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
export function loadConfig(): Config {
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
 * Loads project context from mandatory files.
 * @param {Config} config - The configuration object.
 * @returns {string} The collected project context.
 */
function loadProjectContext(config: Config): string {
    const files = ['CLAUDE.md', 'DEVELOPMENT_STANDARDS.md', 'INCIDENT_RESPONSE.md'];
    let context = '';
    for (const file of files) {
        const filePath = path.resolve(config.repoRoot, file);
        try {
            if (fs.existsSync(filePath)) {
                context += `\n--- START ${file} ---\n`;
                context += fs.readFileSync(filePath, 'utf-8');
                context += `\n--- END ${file} ---\n`;
            }
        } catch (err) {
            console.warn(`Failed to read project context file ${file}: ${err}`);
        }
    }
    return context;
}

/**
 * Loads comments and prepares tasks grouped by file.
 * @param {Config} config - The configuration object.
 * @returns {FileTask[]} An array of tasks, where each task corresponds to a file and its comments.
 */
export function loadTasks(config: Config): FileTask[] {
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
 * Sanitises input strings to prevent prompt injection.
 */
function sanitiseInput(str: string): string {
    if (!str) return '';
    return str.replace(CONTROL_CHARS_REGEX, '')
        .replace(/```/g, "'''") // Neutralise block escapes
        .slice(0, 10000); // Limit length
}

/**
 * Constructs the prompts for Gemini.
 * @param {FileTask} task - The file task containing path, content, and comments.
 * @param {string} projectContext - The project context loaded from CLAUDE.md and DEVELOPMENT_STANDARDS.md.
 * @returns {{ systemInstruction: string; userPrompt: string }} The system and user prompts.
 */
export function buildPrompt(task: FileTask, projectContext: string): { systemInstruction: string; userPrompt: string } {
    const { filePath, fileContent, comments } = task;

    const sanitisedFilePath = sanitiseInput(filePath);
    const issues = comments.map((c, i) => {
        return `ISSUE #${i + 1}:
Comment: ${sanitiseInput(c.body)}
Diff Context:
${sanitiseInput(c.diff_hunk)}
`;
    }).join('\n');

    const systemInstruction = `You are a Senior Software Engineer at smalltalk.community. 
Your goal is to fix code while strictly adhering to our project standards and regulatory requirements.

PROJECT CONTEXT:
${projectContext}

STRICT RULES:
1. Always use Australian English spelling (e.g., utilise, organisation, programme).
2. Maintain WCAG 2.2 AA accessibility standards.
3. Ensure data isolation (RLS) is preserved. NEVER bypass RLS or expose service keys to the client.
4. Apply robust error handling (try/catch on all async) and input validation (Zod).
5. Address ALL listed issues in a single pass.
6. If the comments are not actionable or unsafe, return the original file content.

META-CONTEXT (OSS PLAN):
- You are running on an Open Source plan with strict rate limits (2 reviews/hour). 
- Your fix MUST be robust to avoid unnecessary back-and-forth which burns rate limits.
- If you are unsure, err on the side of caution/safety.

RESPONSE FORMAT:
You must provide your response in exactly the following XML-tagged format:
<thought_process>
- Analyse the requested changes.
- Identify potential security, accessibility, or compliance risks.
- Plan the implementation.
</thought_process>
<self_critique>
- Review your planned changes against project standards (CLAUDE.md, DEVELOPMENT_STANDARDS.md).
- Specifically check for Australian English, WCAG compliance, and RLS preservation.
</self_critique>
<fixed_code>
[The entire corrected source code for the file]
</fixed_code>
`;

    const userPrompt = `
CONTEXT:
File Path: ${sanitisedFilePath}
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
export async function generateWithRetry(genAI: GoogleGenAI, modelName: string, systemInstruction: string, userPrompt: string, filePath: string): Promise<string> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const timeoutMs = 90000;
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

            const result = await Promise.race([generatePromise, timeoutPromise]) as GenerateContentResponse;

            // Result handling based on @google/genai structure
            const candidate = result.candidates?.[0];
            let fullOutput = '';

            if (candidate?.content?.parts) {
                fullOutput = candidate.content.parts
                    .map(part => part.text)
                    .filter(Boolean)
                    .join('')
                    .trim();
            }

            // Extract thought process and critique for logging
            const thoughtProcess = fullOutput.match(/<thought_process>([\s\S]*?)<\/thought_process>/)?.[1]?.trim();
            const selfCritique = fullOutput.match(/<self_critique>([\s\S]*?)<\/self_critique>/)?.[1]?.trim();

            if (thoughtProcess) {
                console.log(`[THOUGHT PROCESS for ${filePath}]:\n${thoughtProcess}\n`);
            }
            if (selfCritique) {
                console.log(`[SELF-CRITIQUE for ${filePath}]:\n${selfCritique}\n`);
            }

            // Support summary logging for PR comments
            const summaryFile = process.env.SUMMARY_FILE;
            if (summaryFile) {
                try {
                    const summaryContent = `\n### 🤖 Senior AI Insights: ${filePath}\n\n<details>\n<summary>View Thought Process</summary>\n\n${thoughtProcess || 'No details provided.'}\n\n</details>\n\n<details>\n<summary>View Self-Critique</summary>\n\n${selfCritique || 'No details provided.'}\n\n</details>\n\n---\n`;
                    fs.appendFileSync(summaryFile, summaryContent);
                } catch (summaryErr) {
                    console.warn(`Failed to write to summary file: ${summaryErr}`);
                }
            }

            // Extract fixed code
            let fixedCode = fullOutput.match(/<fixed_code>([\s\S]*?)<\/fixed_code>/)?.[1]?.trim() || '';

            // Fallback: If the model didn't use tags but returned something, check if it's just code
            if (!fixedCode && fullOutput && !fullOutput.includes('<fixed_code>')) {
                fixedCode = fullOutput;
            }

            // Clean up potential markdown formatting if Gemini ignored the instruction
            if (fixedCode.startsWith('```')) {
                const lines = fixedCode.split('\n');
                // Remove first line (backticks) and last line (backticks)
                if (lines[lines.length - 1].trim().startsWith('```')) {
                    fixedCode = lines.slice(1, -1).join('\n');
                } else {
                    fixedCode = lines.slice(1).join('\n');
                }
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
export function validateOutput(fixedCode: string, originalContent: string): void {
    if (!fixedCode) {
        throw new Error('Gemini returned empty response.');
    }

    // 1. Sanity check: Size comparison
    // If the file is reasonably large, the fix shouldn't delete more than 50% of it 
    // unless the file was mostly comments/boilerplate which is unlikely for storage.ts
    const threshold = originalContent.length > 500 ? 0.5 : 0.1;
    if (fixedCode.length < originalContent.length * threshold && originalContent.length > 50) {
        throw new Error(`Validation failed: Fixed code is suspiciously short (${fixedCode.length} vs ${originalContent.length}).`);
    }

    // 2. Heuristic check: Presence of critical entry points
    // If the original file had 'export async function' or 'export class', the fixed one probably should too.
    const criticalKeywords = ['export async function', 'export class', 'export const POST', 'export const GET'];
    for (const keyword of criticalKeywords) {
        if (originalContent.includes(keyword) && !fixedCode.includes(keyword)) {
            throw new Error(`Validation failed: Fixed code is missing critical keyword "${keyword}" found in original.`);
        }
    }

    // 3. Seniority check: Australian English spelling (utilise vs utilize)
    const usEnglishMistakes = ['utilize', 'organization', 'realize', 'behavior'];
    const usFound = usEnglishMistakes.filter(m =>
        fixedCode.toLowerCase().includes(m) && !originalContent.toLowerCase().includes(m)
    );
    if (usFound.length > 0) {
        console.warn(`[SENIORITY WARNING]: US English spelling detected in fix: ${usFound.join(', ')}`);
        // We don't throw here to avoid blocking valid fixes, but we log it.
    }

    // 4. Critical pattern check: Deprecated SDKs or obvious security red flags
    const redFlags = ['@google/generative-ai', 'NEXT_PUBLIC_SUPABASE_SERVICE_KEY'];
    for (const flag of redFlags) {
        if (fixedCode.includes(flag) && !originalContent.includes(flag)) {
            throw new Error(`Validation failed: Fix introduced a critical red flag: "${flag}"`);
        }
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
export async function run(): Promise<void> {
    try {
        const config = loadConfig();
        const projectContext = loadProjectContext(config);
        const tasks = loadTasks(config);
        const genAI = new GoogleGenAI({ apiKey: config.apiKey });

        if (tasks.length === 0) {
            console.log('No tasks to process.');
            return;
        }

        const iterationCount = process.env.ITERATION_COUNT || '1';
        console.log(`--- Gemini Fixer Iteration ${iterationCount} ---`);

        console.log(`Found ${tasks.length} files to process.`);

        let failureCount = 0;

        for (const task of tasks) {
            console.log(`Processing ${task.filePath} with ${task.comments.length} comments...`);
            try {
                const { systemInstruction, userPrompt } = buildPrompt(task, projectContext);
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

// Only run if called directly
const scriptPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (scriptPath && fileURLToPath(import.meta.url) === scriptPath) {
    run();
}