import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Gemini Fixer Script
 * 
 * Utilises Gemini 3.0 Flash to automatically resolve CodeRabbit review comments.
 */

async function run() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const filePath = process.env.FILE_PATH;
    const commentBody = process.env.COMMENT_BODY;
    const diffHunk = process.env.DIFF_HUNK;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash'; // Fallback to 2.0 if 3.0 not found

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
        const result = await genAI.models.generateContent({
            model: modelName,
            contents: [{
                role: 'user',
                parts: [{ text: prompt }]
            }]
        });

        // Result handling based on @google/genai structure
        const candidate = result.candidates?.[0];
        let fixedCode = candidate?.content?.parts?.[0]?.text?.trim() || '';

        // Clean up potential markdown formatting if Gemini ignored the instruction
        if (fixedCode.startsWith('```')) {
            fixedCode = fixedCode.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
        }

        if (fixedCode && fixedCode.length > 0) {
            fs.writeFileSync(absolutePath, fixedCode, 'utf-8');
            console.log(`Successfully applied fix to ${filePath}`);
        } else {
            console.error('Gemini returned empty response.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error during Gemini generation:', error);
        process.exit(1);
    }
}

run();
