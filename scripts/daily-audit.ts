
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT_DIR, 'audit-reports');
const DATE_STR = new Date().toISOString().split('T')[0];
const REPORT_FILE = path.join(REPORT_DIR, `${DATE_STR}-audit-report.md`);

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

interface AuditResult {
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string[];
}

function runCommand(command: string): string {
  try {
    return execSync(command, { cwd: ROOT_DIR, encoding: 'utf8' });
  } catch (error: any) {
    return error.stdout ? error.stdout.toString() : error.message;
  }
}

async function checkCVEs(): Promise<{ status: string, summary: string, details: string }> {
  console.log('Running CVE Check...');
  try {
    // Run npm audit
    const auditOutput = runCommand('npm audit --json');
    const auditJson = JSON.parse(auditOutput);
    
    const vulnerabilities = auditJson.metadata?.vulnerabilities || {};
    const total = vulnerabilities.total || 0;
    
    let status = 'PASS';
    if (vulnerabilities.critical > 0) status = 'FAIL';
    else if (vulnerabilities.high > 0) status = 'WARNING';

    const summary = `Total: ${total} (Critical: ${vulnerabilities.critical}, High: ${vulnerabilities.high}, Moderate: ${vulnerabilities.moderate}, Low: ${vulnerabilities.low})`;
    
    // Check specific Next.js/React versions from package.json
    const packageJsonPath = path.join(ROOT_DIR, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const nextVersion = packageJson.dependencies.next;
    const reactVersion = packageJson.dependencies.react;

    let details = `\n**Dependency Vulnerabilities:**\n${summary}\n\n**Key Versions:**\n- Next.js: ${nextVersion}\n- React: ${reactVersion}\n`;

    return { status, summary, details };
  } catch (e) {
    return { status: 'FAIL', summary: 'Error running npm audit', details: String(e) };
  }
}

async function checkRLS(): Promise<{ status: string, summary: string, details: string }> {
  console.log('Running RLS Check (Static Analysis)...');
  
  const schemaPath = path.join(ROOT_DIR, 'shared', 'schema.ts');
  if (!fs.existsSync(schemaPath)) {
    return { status: 'FAIL', summary: 'Schema file not found', details: 'shared/schema.ts is missing' };
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const lines = schemaContent.split('\n');
  
  const tables: string[] = [];
  const policies: Record<string, number> = {};
  
  let currentTable = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Simple regex to find table definitions. 
    // export const tableName = pgTable("table_name", ...
    const tableMatch = line.match(/export const (\w+) = pgTable\("/);
    if (tableMatch) {
      currentTable = tableMatch[1];
      tables.push(currentTable);
      policies[currentTable] = 0;
    }
    
    if (currentTable && line.includes('pgPolicy(')) {
      policies[currentTable]++;
    }
  }

  const tablesWithoutPolicies = tables.filter(t => policies[t] === 0);
  const status = tablesWithoutPolicies.length === 0 ? 'PASS' : 'FAIL';
  
  let details = `\n**Tables Analyzed:** ${tables.length}\n`;
  details += `**Tables with Policies:** ${tables.length - tablesWithoutPolicies.length}\n`;
  details += `**Tables WITHOUT Policies:** ${tablesWithoutPolicies.length}\n`;
  
  if (tablesWithoutPolicies.length > 0) {
    details += `\n**Missing RLS:**\n- ${tablesWithoutPolicies.join('\n- ')}\n`;
  }

  return { status, summary: `${tablesWithoutPolicies.length} tables missing RLS`, details };
}

async function checkSecrets(): Promise<{ status: string, summary: string, details: string }> {
    console.log('Running Secret Scan...');
    // Simple grep for obvious secrets
    // Exclude .env, .git, node_modules, .next
    
    // We are looking for "sk-...", "ey...", "AIza..." type patterns in code files
    // This is a basic heuristic
    
    // Better: Check for "NEXT_PUBLIC_" prefixing specific keywords
    
    const command = `grep -r "NEXT_PUBLIC_" "${ROOT_DIR}" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules" --exclude-dir=".next" --exclude-dir=".git" | grep -iE "key|secret|token|auth" || true`;
    
    const output = runCommand(command);
    const lines = output.split('\n').filter(l => l.trim() !== '');
    
    // Filter out known safe keys if necessary (e.g. Supabase URL is safe, Anon key is safe-ish but we want to check)
    // CLAUDE.md says: NEXT_PUBLIC_SUPABASE_URL is safe.
    
    const suspicious = lines.filter(line => {
        // Allow SUPABASE_URL and SUPABASE_ANON_KEY (as per common patterns, though CLAUDE.md says anon key is safe for client)
        if (line.includes('NEXT_PUBLIC_SUPABASE_URL')) return false;
        if (line.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) return false; // Explicitly allowed in client
        if (line.includes('NEXT_PUBLIC_APP_URL')) return false;
        
        return true;
    });

    const status = suspicious.length === 0 ? 'PASS' : 'WARNING';
    const summary = `${suspicious.length} potential secret exposures found`;
    let details = `\n**Suspicious Occurrences:**\n`;
    if (suspicious.length > 0) {
        details += suspicious.map(s => `- \`${s.substring(0, 100)}...\``).join('\n');
    } else {
        details += "None found.";
    }

    return { status, summary, details };
}

async function checkPerformance(): Promise<{ status: string, summary: string, details: string }> {
    console.log('Running Low-Bandwidth Performance Check...');
    
    const issues: string[] = [];
    let status = 'PASS';

    // 1. Check for Heavy Assets in public/ (> 500KB)
    // Critical for low bandwidth
    try {
        const publicDir = path.join(ROOT_DIR, 'public');
        if (fs.existsSync(publicDir)) {
             const findLargeFiles = (dir: string) => {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        findLargeFiles(filePath);
                    } else {
                        const sizeKB = stat.size / 1024;
                        if (sizeKB > 500) {
                            issues.push(`Large Asset: ${path.relative(ROOT_DIR, filePath)} (${sizeKB.toFixed(2)} KB)`);
                            status = 'WARNING';
                        }
                    }
                });
             };
             findLargeFiles(publicDir);
        }
    } catch (e) {
        issues.push(`Error scanning public assets: ${e}`);
    }

    // 2. Check for standard <img> tags (Should use next/image)
    // Standard img tags don't lazy load or resize automatically
    try {
        // grep for "<img" in .tsx files
        const grepImg = `grep -r "<img" "${ROOT_DIR}" --include="*.tsx" --exclude-dir="node_modules" --exclude-dir=".next" || true`;
        const imgOutput = runCommand(grepImg);
        const imgLines = imgOutput.split('\n').filter(l => l.trim() !== '');
        
        if (imgLines.length > 0) {
            status = 'WARNING';
            issues.push(`Found ${imgLines.length} standard \`<img>\` tags (Use \`<Image />\` for bandwidth optimization)`);
             // Limit detail to first 3
            imgLines.slice(0, 3).forEach(l => issues.push(`- ${l.substring(0, 100).trim()}...`));
        }
    } catch (e) {}

    // 3. Count 'use client' (Bundle Bloat)
    let clientComponents = 0;
    try {
        const grepClient = `grep -r "use client" "${ROOT_DIR}" --include="*.tsx" --exclude-dir="node_modules" --exclude-dir=".next" | wc -l`;
        clientComponents = parseInt(runCommand(grepClient).trim(), 10) || 0;
    } catch (e) {}

    // 4. Console.log check (Cleanup)
    try {
         const grepConsole = `grep -r "console.log" "${ROOT_DIR}" --include="*.tsx" --include="*.ts" --exclude-dir="node_modules" --exclude-dir=".next" --exclude-dir="scripts" | wc -l`;
         const consoleCount = parseInt(runCommand(grepConsole).trim(), 10) || 0;
         if (consoleCount > 0) {
             issues.push(`Found ${consoleCount} console.log statements (Remove for production performance)`);
         }
    } catch (e) {}

    const summary = `${issues.length} performance warnings found. Client Components: ${clientComponents}`;
    let details = `\n**Low-Bandwidth Optimization:**\n`;
    details += `- **Client Components ('use client'):** ${clientComponents} (More = heavier JS bundles)\n`;
    
    if (issues.length > 0) {
        details += `\n**Issues Found:**\n`;
        details += issues.map(i => `- ${i}`).join('\n');
    } else {
        details += `\n- ✅ No large assets (>500KB)\n- ✅ No unoptimized <img> tags\n- ✅ Clean console logs`;
    }

    return { status, summary, details };
}

async function generateReport() {
  const cve = await checkCVEs();
  const rls = await checkRLS();
  const secrets = await checkSecrets();
  const perf = await checkPerformance();
  
  const reportContent = `
# Security & Performance Audit Report
**Date:** ${DATE_STR}
**Time:** ${new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne' })} AEST
**Repository:** smalltalk.community

---

## Executive Summary
Daily automated audit results.

- **CVE Status:** ${cve.status}
- **RLS Status:** ${rls.status}
- **Secrets Status:** ${secrets.status}
- **Performance:** ${perf.status}

---

## Security Audit Results

### 1. CVE Analysis
**Status:** ${cve.status}
${cve.details}

### 2. Supabase Security (RLS)
**Status:** ${rls.status}
${rls.details}

### 3. Code Security (Secrets)
**Status:** ${secrets.status}
${secrets.details}

---

## Performance Audit (Low Bandwidth)
**Status:** ${perf.status}
${perf.details}

---

## Audit Performed By
- Tool: Automated Script (Gemini Agent)
- Date: ${new Date().toISOString()}

`;

  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(`Report generated at: ${REPORT_FILE}`);
}

generateReport().catch(console.error);
