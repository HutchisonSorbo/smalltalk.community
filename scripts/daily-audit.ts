import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT_DIR, 'audit-reports');

// Timezone-aware date handling (Melbourne)
const timeFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Melbourne',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short',
});

// Format: DD/MM/YYYY, HH:mm:ss am/pm AEST
const parts = timeFormatter.formatToParts(new Date());
const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

// Build YYYY-MM-DD for filename
const year = getPart('year');
const month = getPart('month');
const day = getPart('day');
const DATE_STR = `${year}-${month}-${day}`;
const REPORT_FILE = path.join(REPORT_DIR, `${DATE_STR}-audit-report.md`);

// Build display string
const DISPLAY_TIME = timeFormatter.format(new Date());

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

interface AuditResult {
  status: 'PASS' | 'FAIL' | 'WARNING';
  summary: string;
  details: string;
}

function runCommand(command: string): string {
  try {
    return execSync(command, { cwd: ROOT_DIR, encoding: 'utf8' });
  } catch (error: any) {
    return error.stdout ? error.stdout.toString() : error.message;
  }
}

async function checkCVEs(): Promise<AuditResult> {
  console.log('Running CVE Check...');
  try {
    // Run npm audit
    const auditOutput = runCommand('npm audit --json');
    const auditJson = JSON.parse(auditOutput);
    
    const vulnerabilities = auditJson.metadata?.vulnerabilities || {};
    const total = vulnerabilities.total || 0;
    
    let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
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
  } catch (e: any) {
    console.error('Error running checkCVEs:', e);
    return { status: 'FAIL', summary: 'Error running CVE check', details: 'Internal error while running npm audit, see workflow logs for details.' };
  }
}

async function checkRLS(): Promise<AuditResult> {
  console.log('Running RLS Check (Static Analysis)...');
  try {
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
      // Updated regex to handle single and double quotes
      const tableMatch = line.match(/export const (\w+) = pgTable\(['"](\w+)['"]/);
      
      if (tableMatch) {
        currentTable = tableMatch[1]; // The const name (e.g., 'users')
        tables.push(currentTable);
        policies[currentTable] = 0;
      }
      
      // In this Drizzle schema, policies are defined inside the pgTable callback
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
  } catch (e: any) {
    console.error('Error running checkRLS:', e);
    return { status: 'FAIL', summary: 'Error running RLS check', details: 'Internal error while analyzing schema, see workflow logs for details.' };
  }
}

async function checkSecrets(): Promise<AuditResult> {
    console.log('Running Secret Scan...');
    try {
        // Broadened patterns, exclusions, and output formatting (no snippets)
        // Patterns: NEXT_PUBLIC_, sk-, eyJ, AIza, api_key, secret, token
        const patterns = 'NEXT_PUBLIC_|sk-|eyJ|AIza|api_key|secret|token';
        
        // Exclude this script and report directory
        const excludeArgs = `--exclude-dir="node_modules" --exclude-dir=".next" --exclude-dir=".git" --exclude="daily-audit.ts" --exclude-dir="audit-reports"`;
        
        // Use -n for line numbers, -o to only show matching part? No, grep -r output is usually filename:line:content.
        // We want to suppress content to avoid leaking secrets in the report.
        // We can use awk or just process the output in JS.
        // -I ignores binary files.
        const command = `grep -rE "${patterns}" "${ROOT_DIR}" ${excludeArgs} -I -n || true`;
        
        const output = runCommand(command);
        const lines = output.split('\n').filter(l => l.trim() !== '');
        
        const suspicious: string[] = [];

        lines.forEach(line => {
             // Line format: filename:lineno:content
             const parts = line.split(':');
             if (parts.length < 3) return;

             const file = parts[0];
             const lineno = parts[1];
             const content = parts.slice(2).join(':');

             // Filter safe patterns
             if (content.includes('NEXT_PUBLIC_SUPABASE_URL')) return;
             if (content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) return;
             if (content.includes('NEXT_PUBLIC_APP_URL')) return;
             
             // Extra safety: Don't report on this file if grep missed the exclusion
             if (file.includes('daily-audit.ts')) return;
             if (file.includes('audit-reports/')) return;

             // Add to suspicious list (File:Line only)
             suspicious.push(`${path.relative(ROOT_DIR, file)}:${lineno}`);
        });

        const status = suspicious.length === 0 ? 'PASS' : 'WARNING';
        const summary = `${suspicious.length} potential secret exposures found`;
        let details = `\n**Suspicious Occurrences (File:Line):**\n`;
        if (suspicious.length > 0) {
            // Trim to max 20 to avoid huge reports
            suspicious.slice(0, 20).forEach(s => details += `- ${s}\n`);
            if (suspicious.length > 20) details += `- ...and ${suspicious.length - 20} more\n`;
        } else {
            details += "None found.\n";
        }

        return { status, summary, details };
    } catch (e: any) {
        console.error('Error running checkSecrets:', e);
        return { status: 'FAIL', summary: 'Error running secret scan', details: 'Internal error while scanning for secrets, see workflow logs for details.' };
    }
}

async function checkPerformance(): Promise<AuditResult> {
    console.log('Running Low-Bandwidth Performance Check...');
    try {
        const issues: string[] = [];
        let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';

        // 1. Check for Heavy Assets in public/ (> 500KB)
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
             
             try {
                findLargeFiles(publicDir);
             } catch (e: any) {
                 console.error('Error scanning public assets:', e);
                 issues.push('Error scanning public assets');
             }
        }

        // 2. Check for standard <img> tags
        try {
            const grepImg = `grep -r "<img" "${ROOT_DIR}" --include="*.tsx" --exclude-dir="node_modules" --exclude-dir=".next" || true`;
            const imgOutput = runCommand(grepImg);
            const imgLines = imgOutput.split('\n').filter(l => l.trim() !== '');
            
            if (imgLines.length > 0) {
                status = 'WARNING';
                issues.push(`Found ${imgLines.length} standard \`<img>\` tags (Use \\\`<Image />\\\' for bandwidth optimization)`);
                imgLines.slice(0, 3).forEach(l => issues.push(`- ${l.substring(0, 100).trim()}...`));
            }
        } catch (e: any) {
            console.error('Error scanning for <img> tags:', e);
            issues.push('Error scanning for unoptimized images');
        }

        // 3. Count 'use client'
        let clientComponents = 0;
        try {
            const grepClient = `grep -r "use client" "${ROOT_DIR}" --include="*.tsx" --exclude-dir="node_modules" --exclude-dir=".next" | wc -l`;
            clientComponents = parseInt(runCommand(grepClient).trim(), 10) || 0;
        } catch (e: any) {
            console.error('Error counting client components:', e);
            issues.push('Error counting client components');
        }

        // 4. Console.log check
        try {
            const grepConsole = `grep -r "console.log" "${ROOT_DIR}" --include="*.tsx" --include="*.ts" --exclude-dir="node_modules" --exclude-dir=".next" --exclude-dir="scripts" | wc -l`;
            const consoleCount = parseInt(runCommand(grepConsole).trim(), 10) || 0;
            if (consoleCount > 0) {
                issues.push(`Found ${consoleCount} console.log statements (Remove for production performance)`);
            }
        } catch (e: any) {
            console.error('Error checking console.log:', e);
            issues.push('Error checking console.log usage');
        }

        const summary = `${issues.length} performance warnings. Client Components: ${clientComponents}`;
        let details = `\n**Low-Bandwidth Optimization:**\n`;
        details += `- **Client Components ('use client'):** ${clientComponents} (More = heavier JS bundles)\n`;
        
        if (issues.length > 0) {
            details += `\n**Issues Found:**\n`;
            details += issues.map(i => `- ${i}`).join('\n');
        } else {
            details += `\n- ✅ No large assets (>500KB)\n- ✅ No unoptimized <img> tags\n- ✅ Clean console logs\n`;
        }

        return { status, summary, details };
    } catch (e: any) {
        console.error('Error running checkPerformance:', e);
        return { status: 'FAIL', summary: 'Error running performance check', details: 'Internal error while checking performance, see workflow logs for details.' };
    }
}

async function checkResilience(): Promise<AuditResult> {
    console.log('Running Resilience Check...');
    try {
        let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
        let details = '\n**Resilience Metrics:**\n';
        
        // 1. Count Error Boundaries
        let errorFiles = 0;
        try {
            errorFiles = parseInt(runCommand(`find "${path.join(ROOT_DIR, 'app')}" -name "error.tsx" | wc -l`).trim(), 10) || 0;
        } catch (e: any) {
            console.error('Error finding error.tsx:', e);
            details += `- ⚠️ Error counting Error Boundaries\n`;
        }
        
        // 2. Count Loading States
        let loadingFiles = 0;
        try {
            loadingFiles = parseInt(runCommand(`find "${path.join(ROOT_DIR, 'app')}" -name "loading.tsx" | wc -l`).trim(), 10) || 0;
        } catch (e: any) {
            console.error('Error finding loading.tsx:', e);
            details += `- ⚠️ Error counting Loading States\n`;
        }
        
        details += `- **Error Boundaries (error.tsx):** ${errorFiles} (Prevents white screens)\n`;
        details += `- **Loading States (loading.tsx):** ${loadingFiles} (Improves perceived performance)\n`;

        if (errorFiles < 1) {
            status = 'WARNING';
            details += `- ⚠️ NO Error Boundaries found! App is at risk of crashing completely on error.\n`;
        }

        // 3. API Try/Catch Check
        const apiDir = path.join(ROOT_DIR, 'app', 'api');
        const riskyRoutes: string[] = [];
        
        if (fs.existsSync(apiDir)) {
            const scanApiRoutes = (dir: string) => {
                try {
                    const files = fs.readdirSync(dir);
                    files.forEach(file => {
                        const filePath = path.join(dir, file);
                        try {
                            const stat = fs.statSync(filePath);
                            if (stat.isDirectory()) {
                                scanApiRoutes(filePath);
                            } else if (file === 'route.ts') {
                                const content = fs.readFileSync(filePath, 'utf8');
                                if ((content.includes('export async function GET') || content.includes('export async function POST')) && !content.includes('try {')) {
                                    riskyRoutes.push(path.relative(ROOT_DIR, filePath));
                                }
                            }
                        } catch (innerError: any) {
                            console.error(`Error scanning path ${filePath}:`, innerError);
                        }
                    });
                } catch (dirError: any) {
                    console.error(`Error scanning directory ${dir}:`, dirError);
                }
            };
            scanApiRoutes(apiDir);
        }
        
        if (riskyRoutes.length > 0) {
            status = 'WARNING';
            details += `\n**Risky API Routes (Missing try/catch):**\n`;
            details += riskyRoutes.map(r => `- ${r}`).join('\n');
        } else {
            details += `- ✅ All API routes appear to use error handling.\n`;
        }
        
        return { status, summary: `Resilience: ${status}`, details };
    } catch (e: any) {
        console.error('Error running checkResilience:', e);
        return { 
            status: 'FAIL', 
            summary: 'Resilience: ERROR', 
            details: `Internal error running resilience check: ${e.message || String(e)}` 
        };
    }
}

async function checkLegal(): Promise<AuditResult> {
    console.log('Running Legal Check...');
    try {
        let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
        let details = '\n**Legal Compliance:**\n';
        
        let hasPrivacy = false;
        try {
            hasPrivacy = fs.existsSync(path.join(ROOT_DIR, 'app', 'privacy', 'page.tsx')) || 
                         fs.existsSync(path.join(ROOT_DIR, 'privacy.md'));
        } catch (e) {
            console.error('Error checking for Privacy Policy:', e);
        }
                           
        let hasTerms = false;
        try {
            hasTerms = fs.existsSync(path.join(ROOT_DIR, 'app', 'terms', 'page.tsx')) ||
                       fs.existsSync(path.join(ROOT_DIR, 'terms.md'));
        } catch (e) {
            console.error('Error checking for Terms of Service:', e);
        }
                         
        if (hasPrivacy) details += `- ✅ Privacy Policy found.\n`;
        else {
            status = 'FAIL';
            details += `- ❌ MISSING Privacy Policy (Required for GDPR/App Stores).\n`;
        }
        
        if (hasTerms) details += `- ✅ Terms of Service found.\n`;
        else {
            status = 'FAIL';
            details += `- ❌ MISSING Terms of Service (High Legal Risk).\n`;
        }
        
        return { status, summary: `Legal: ${status}`, details };
    } catch (e: any) {
        console.error('Error running checkLegal:', e);
        return { 
            status: 'FAIL', 
            summary: 'Legal: ERROR', 
            details: `Internal error running legal check: ${e.message || String(e)}` 
        };
    }
}

async function checkSanitization(): Promise<AuditResult> {
    console.log('Running Data Sanitization Check...');
    try {
        let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
        let details = '\n**Input Validation (Zod):**\n';
        
        const apiDir = path.join(ROOT_DIR, 'app', 'api');
        const riskyRoutes: string[] = [];
        
        if (fs.existsSync(apiDir)) {
            const scanApiRoutes = (dir: string) => {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        scanApiRoutes(filePath);
                    } else if (file === 'route.ts') {
                        const content = fs.readFileSync(filePath, 'utf8');
                        // Check if file uses Zod or an existing schema
                        if (!content.includes('zod') && !content.includes('schema') && !content.includes('validate')) {
                             // Only flag if it handles POST/PUT/PATCH (where input matters)
                             if (content.includes('POST') || content.includes('PUT') || content.includes('PATCH')) {
                                riskyRoutes.push(path.relative(ROOT_DIR, filePath));
                             }
                        }
                    }
                });
            };
            scanApiRoutes(apiDir);
        }

        if (riskyRoutes.length > 0) {
            status = 'WARNING';
            details += `\n**Potential Unvalidated API Routes:**\n`;
            details += riskyRoutes.map(r => `- ${r} (Missing 'zod' or 'schema' keyword)`).join('\n');
        } else {
            details += `- ✅ API routes appear to use validation.\n`;
        }
        
        return { status, summary: `Sanitization: ${status}`, details };
    } catch (e: any) {
        console.error('Error running checkSanitization:', e);
        return { status: 'FAIL', summary: 'Sanitization Check Failed', details: 'Internal Error' };
    }
}

async function checkAgeGate(): Promise<AuditResult> {
    console.log('Running Age Gate Check...');
    try {
        let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
        let details = '\n**Age Restriction Enforcement:**\n';
        
        const schemaPath = path.join(ROOT_DIR, 'lib', 'onboarding-schemas.ts');
        if (!fs.existsSync(schemaPath)) {
            return { status: 'FAIL', summary: 'Missing Schema File', details: 'lib/onboarding-schemas.ts not found.' };
        }
        
        const content = fs.readFileSync(schemaPath, 'utf8');
        // Look for 13 year logic. Heuristic: "13" or logic calculating age.
        // Our fix added: "minAge" and "13"
        const hasAgeCheck = content.includes('minAge') || (content.includes('13') && content.includes('Date'));
        
        if (hasAgeCheck) {
            details += `- ✅ Age gate logic found in schemas (13+ enforcement detected).\n`;
        } else {
            status = 'FAIL';
            details += `- ❌ STRICT 13+ Age Gate NOT detected in lib/onboarding-schemas.ts!\n`;
        }
        
        return { status, summary: `Age Gate: ${status}`, details };
    } catch (e: any) {
        console.error('Error running checkAgeGate:', e);
        return { status: 'FAIL', summary: 'Age Gate Check Failed', details: 'Internal Error' };
    }
}

async function checkCacheHeaders(): Promise<AuditResult> {
    console.log('Running Cache Header Check...');
    try {
        let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
        let details = '\n**Cache Strategy:**\n';
        
        const apiDir = path.join(ROOT_DIR, 'app', 'api');
        let cacheControlCount = 0;
        let routeCount = 0;
        
        if (fs.existsSync(apiDir)) {
            const scanApiRoutes = (dir: string) => {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        scanApiRoutes(filePath);
                    } else if (file === 'route.ts') {
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (content.includes('GET')) {
                            routeCount++;
                            if (content.includes('Cache-Control') || content.includes('revalidate')) {
                                cacheControlCount++;
                            }
                        }
                    }
                });
            };
            scanApiRoutes(apiDir);
        }
        
        details += `- **Cached API Routes:** ${cacheControlCount} / ${routeCount}\n`;
        
        if (routeCount > 0 && cacheControlCount === 0) {
            status = 'WARNING';
            details += `- ⚠️ No API routes seem to use explicit 'Cache-Control' headers. Important for low bandwidth.\n`;
        } else if (cacheControlCount < routeCount / 2) {
             // Just an observation, not a fail
             details += `- ℹ️ Consider adding caching to more GET routes.\n`;
        }
        
        return { status, summary: `Cache: ${status}`, details };
    } catch (e: any) {
        console.error('Error running checkCacheHeaders:', e);
        return { status: 'FAIL', summary: 'Cache Check Failed', details: 'Internal Error' };
    }
}

async function checkDocumentation(): Promise<AuditResult> {
    console.log('Running Documentation Check...');
    try {
        let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
        let details = '\n**Code Documentation (JSDoc):**\n';
        
        const libDir = path.join(ROOT_DIR, 'lib');
        let totalFunctions = 0;
        let documentedFunctions = 0;
        
        if (fs.existsSync(libDir)) {
            const scanFiles = (dir: string) => {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        scanFiles(filePath);
                    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        // Rough regex to find exported functions
                        const functionMatches = content.match(/export (async )?function \w+|export const \w+ = \(|export const \w+ = (async )?\(/g);
                        if (functionMatches) {
                            totalFunctions += functionMatches.length;
                            // Count JSDoc blocks /** ... */
                            const jsDocMatches = content.match(/\/\*\*[\s\S]*?\*\//g);
                            if (jsDocMatches) {
                                documentedFunctions += jsDocMatches.length;
                            }
                        }
                    }
                });
            };
            scanFiles(libDir);
        }
        
        const coverage = totalFunctions > 0 ? (documentedFunctions / totalFunctions) * 100 : 100;
        details += `- **JSDoc Coverage in /lib:** ${coverage.toFixed(1)}% (${documentedFunctions}/${totalFunctions} functions)\n`;
        
        if (coverage < 20) {
             status = 'WARNING';
             details += `- ⚠️ Low documentation coverage! Aim for >20% for core business logic.\n`;
        } else {
             details += `- ✅ Good documentation habits detected.\n`;
        }
        
        return { status, summary: `Docs: ${coverage.toFixed(0)}%`, details };
    } catch (e: any) {
        console.error('Error running checkDocumentation:', e);
        return { status: 'FAIL', summary: 'Doc Check Failed', details: 'Internal Error' };
    }
}

async function generateReport() {
  try {
      const cve = await checkCVEs();
      const rls = await checkRLS();
      const secrets = await checkSecrets();
      const perf = await checkPerformance();
      const resilience = await checkResilience();
      const legal = await checkLegal();
      const sanitization = await checkSanitization();
      const ageGate = await checkAgeGate();
      const cache = await checkCacheHeaders();
      const docs = await checkDocumentation();
      
      const reportContent = `
# Security & Performance Audit Report
**Date:** ${DATE_STR}
**Time:** ${DISPLAY_TIME}
**Repository:** smalltalk.community

---

## Executive Summary

Daily automated audit results.

- **CVE Status:** ${cve.status}
- **RLS Status:** ${rls.status}
- **Secrets Status:** ${secrets.status}
- **Performance:** ${perf.status}
- **Resilience:** ${resilience.status}
- **Legal:** ${legal.status}
- **Sanitization:** ${sanitization.status}
- **Age Gate:** ${ageGate.status}
- **Caching:** ${cache.status}
- **Docs:** ${docs.status}

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

### 4. Input Sanitization (Zod)

**Status:** ${sanitization.status}
${sanitization.details}

### 5. Age Gate (13+)

**Status:** ${ageGate.status}
${ageGate.details}

---

## Performance & Reliability

### 1. Low Bandwidth Optimization

**Status:** ${perf.status}
${perf.details}

### 2. Caching Strategy

**Status:** ${cache.status}
${cache.details}

---

## Resilience, Legal & Docs

**Status:** ${resilience.status === 'PASS' && legal.status === 'PASS' && docs.status !== 'FAIL' ? 'PASS' : 'WARNING'}

### 1. Resilience (White Screen Check)
${resilience.details}

### 2. Legal Compliance
${legal.details}

### 3. Documentation Coverage
${docs.details}

---

## Audit Performed By

- Tool: Automated Script (Gemini Agent)
- Date: ${new Date().toISOString()}
`;

      fs.writeFileSync(REPORT_FILE, reportContent);
      console.log(`Report generated at: ${REPORT_FILE}`);
  } catch (e) {
      console.error('CRITICAL: Failed to generate report', e);
      process.exit(1);
  }
}

generateReport().catch(e => {
    console.error('Unhandled error in generateReport wrapper:', e);
    process.exit(1);
});
