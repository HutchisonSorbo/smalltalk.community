"use server";

import fs from "fs";
import path from "path";

const logPath = path.join(process.cwd(), "artifacts", "superpowers", "execution.md");

export async function appendExecutionLog(stepName: string, filesChanged: string[], changes: string[], verification: string, result: string) {
    const entry = `
### ${stepName}
- **Files Changed**: ${filesChanged.join(", ")}
- **Changes**:
${changes.map(c => `  - ${c}`).join("\n")}
- **Verification**: \`${verification}\`
- **Result**: ${result}
`;

    // Ensure directory exists (it should)
    try {
        await fs.promises.appendFile(logPath, entry);
    } catch (e) {
        console.error("Failed to append to execution log", e);
    }
}
