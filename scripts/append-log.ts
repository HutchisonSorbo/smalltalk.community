"use server";

import fs from "fs";
import path from "path";

const logPath = path.join(process.cwd(), "artifacts", "superpowers", "execution.md");

/**
 * Appends a log entry to the execution markdown file.
 * Creates the directory if it doesn't exist.
 * 
 * @param {string} stepName - The name of the executed step.
 * @param {string[]} filesChanged - List of files that were modified.
 * @param {string[]} changes - List of description bullet points for the changes.
 * @param {string} verification - Description of the verification step performed.
 * @param {string} result - The result of the step (e.g., 'Implemented', 'Passed').
 * @returns {Promise<void>}
 */
export async function appendExecutionLog(stepName: string, filesChanged: string[], changes: string[], verification: string, result: string): Promise<void> {
    const entry = `
### ${stepName}
- **Files Changed**: ${filesChanged.join(", ")}
- **Changes**:
${changes.map(c => `  - ${c}`).join("\n")}
- **Verification**: \`${verification}\`
- **Result**: ${result}
`;

    try {
        await fs.promises.mkdir(path.dirname(logPath), { recursive: true });
        await fs.promises.appendFile(logPath, entry);
    } catch (e) {
        console.error("Failed to append to execution log", e);
    }
}
