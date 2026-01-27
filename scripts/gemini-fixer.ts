import { GoogleGenAI } from '@google/genai';
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

/**
 * Main execution function.
 * @async
 * @returns {Promise<void>}
 */
async function run(): Promise<void> {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const filePath = process.env.FILE_PATH;
    const commentBody = process.env.COMMENT_BODY;
    const diffHunk = process.env.DIFF_HUNK;
    const modelName = process.env.GEMINI_MODEL || MODEL_NAME;

    if (!apiKey || !filePath || !commentBody) {
        console.error('Missing required environment variables: GOOGLE_API_KEY, FILE_PATH, COMMENT_BODY');
        process.exit(1);
    }

    const genAI = new GoogleGenAI({ apiKey });

    const absolutePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(absolutePath, 'utf-8');

    const prompt = `
You are a senior software engineer at an organisation that prioritises high-quality, accessible, and secure code.
You are tasked with fixing a code issue identified by a CodeRabbit review comment.

### Context
- **File Path**: ${filePath}
- **Review Comment**: ${commentBody}
- **Diff Context**: 
\`\`\`
${diffHunk}
\`\`\`

### Instructions
1. Read the provided file content and the review comment carefully.
2. Generate the corrected version of the code that addresses the comment.
3. Ensure the fix adheres to Australian English spelling standards (e.g., utilise, organisation).
4. Maintain WCAG 2.2 Level AA accessibility standards.
5. Ensure data isolation and RLS security are respected.
6. Return ONLY the updated code for the ENTIRE file. Do not include markdown formatting like \`\`\`typescript blocks, just the raw code.

### Original File Content
\`\`\`
${fileContent}
\`\`\`
`;

    try {
        console.log(`Requesting fix for ${filePath} using ${modelName}...`);
        const maxRetries = 3;
        let attempt = 0;
        let result;

        while (attempt < maxRetries) {
            try {
                // Timeout logic using AbortController if supported by SDK or simple race
                // The @google/genai SDK might not support signal directly in generateContent options yet,
                // so we use a race or assume the SDK has internal timeouts. 
                // We'll wrap in a generic timeout promise.
                const timeoutMs = 60000;
                const generatePromise = genAI.models.generateContent({
                    model: modelName,
                    contents: [{
                        role: 'user',
                        parts: [{ text: prompt }]
                    }]
                });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
                );

                // @ts-ignore - Promise.race types can be tricky with SDK return types
                result = await Promise.race([generatePromise, timeoutPromise]);
                break; // Success
            } catch (err: any) {
                attempt++;
                console.warn(`Attempt ${attempt} failed for ${filePath} with model ${modelName}: ${err.message}`);
                if (attempt >= maxRetries) {
                    throw new Error(`Failed to generate content after ${maxRetries} attempts.`);
                }
                // Linear backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

        // Result handling based on @google/genai structure
        const candidate = (result as any).candidates?.[0];
        let fixedCode = candidate?.content?.parts?.[0]?.text?.trim() || '';

        // Clean up potential markdown formatting if Gemini ignored the instruction
        if (fixedCode.startsWith('```')) {
            const lines = fixedCode.split('\n');
            // Remove first line (```language) and last line (```)
            fixedCode = lines.slice(1, -1).join('\n');
        }

        if (!fixedCode) {
            console.error('Gemini returned empty response.');
            process.exit(1);
        }

        // --- Validation & Backup ---

        // 1. Sanity check: Size comparison (basic heuristic)
        // If the new code is drastically smaller (e.g. < 10% of original), it might be an error message or hallucination
        // unless the original file was huge and we are deleting most of it (unlikely for a 'fix').
        if (fixedCode.length < fileContent.length * 0.1 && fileContent.length > 50) {
            console.error('Validation failed: Fixed code is suspiciously short.');
            console.log('Fixed Code Preview:', fixedCode);
            process.exit(1);
        }

        // 2. Create Backup
        const backupPath = `${absolutePath}.bak`;
        fs.writeFileSync(backupPath, fileContent);
        console.log(`Backup created at ${backupPath}`);

        try {
            // Write to file
            fs.writeFileSync(absolutePath, fixedCode);
            console.log(`Successfully applied fix to ${filePath}`);
        } catch (writeErr) {
            console.error('Failed to write fixed code:', writeErr);
            // Restore backup
            fs.copyFileSync(backupPath, absolutePath);
            process.exit(1);
        }
    } catch (error) {
        console.error('Error during Gemini generation:', error);
        process.exit(1);
    }
}

run();
