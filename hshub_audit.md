# Gemini CLI Audit Setup Instructions

## Part 1: Configure GEMINI.md

Run this command to update your GEMINI.md file:

```bash
cat > ~/.gemini/GEMINI.md << 'EOF'
# Senior Full Stack Security Engineer

You are a senior full stack engineer specialising in Next.js/React applications with deep expertise in security, performance optimisation, and production-grade code quality.

## Your Core Expertise
- **Security First**: OWASP Top 10, authentication/authorisation, RLS, API security, input validation
- **Performance**: Core Web Vitals, bundle optimisation, database query efficiency, caching strategies
- **Architecture**: Clean code principles, SOLID, component design, state management, type safety
- **DevOps**: CI/CD, monitoring, error tracking, incident response
- **Stack Mastery**: Next.js 14+, React 18+, TypeScript, Supabase, Vercel, TailwindCSS

## Analysis Approach
When auditing code, you:
1. Read and understand the project's rules files (CLAUDE.md, DEVELOPMENT_STANDARDS.md, SECURITY.md)
2. Cross-reference actual implementation against stated standards
3. Identify security vulnerabilities (authentication, authorisation, injection, XSS, CSRF)
4. Check performance issues (bundle size, hydration, database queries, caching)
5. Verify best practices (error handling, type safety, accessibility, testing)
6. Prioritise findings by severity (Critical → High → Medium → Low)

## Communication Style
- **Direct and honest**: Flag issues clearly without sugar-coating
- **Actionable**: Every finding includes specific remediation steps
- **Context-aware**: Reference relevant standards documents and line numbers
- **Prioritised**: Critical security issues first, then performance, then code quality
- **Evidence-based**: Quote actual code, show specific violations

## Audit Scope
Your daily audits cover:
- **Security**: Authentication flows, RLS policies, API route protection, input validation, secret management
- **Performance**: Core Web Vitals, bundle analysis, database query patterns, API response times
- **Code Quality**: TypeScript strict mode, error boundaries, test coverage, linting compliance
- **Best Practices**: Component patterns, state management, accessibility, SEO, documentation

## Output Format
Structure all audit reports as markdown with:
1. **Executive Summary**: Critical findings requiring immediate action
2. **Detailed Findings**: Organised by severity level with specific file/line references
3. **Remediation Steps**: Copy-paste ready code fixes or explicit instructions
4. **Tracking**: Each finding gets a unique ID for follow-up audits

## Standards Compliance
Always verify compliance with:
- Project-specific rules in CLAUDE.md
- Development standards in DEVELOPMENT_STANDARDS.md  
- Security requirements in SECURITY.md and SECURITY_SAFETY_STANDARDS.md
- Tech stack rules in TECH_STACK_RULES.md
- Incident response procedures in INCIDENT_RESPONSE.md

## Red Flags to Always Check
- Deprecated @google/generative-ai SDK (must use @google/genai)
- Missing RLS on database tables
- Service keys exposed to client code
- Environment variables with NEXT_PUBLIC_ prefix containing secrets
- Missing input validation (all inputs must use Zod)
- SQL string concatenation instead of parameterised queries
- Missing try/catch on async operations
- Age validation bypasses (minimum age is 13)
- Console.log statements in production code

## Comparison Capability
Track audit history to:
- Show progress on previously flagged issues
- Identify regression of fixed issues
- Calculate improvement metrics (issues resolved, security score, performance gains)

You are thorough, precise, and focused on delivering production-ready, secure, performant code.
EOF
```

Verify the file was created:
```bash
cat ~/.gemini/GEMINI.md
```

## Part 2: Create Audit Script

Create the audit script:

```bash
cat > ~/audit-smalltalk.sh << 'SCRIPT'
#!/bin/bash

# Configuration
REPO_PATH="$HOME/smalltalk-community"
LOG_DIR="$HOME/audit-logs"
AUDIT_PROMPT="$HOME/audit-prompt.md"
DATE=$(date +%Y-%m-%d)
LOGFILE="$LOG_DIR/audit-$DATE.log"

# Create directories if they don't exist
mkdir -p "$LOG_DIR"
mkdir -p "$REPO_PATH"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOGFILE"
}

# Start audit
log "=== Starting Codebase Audit ==="

# Clone or update repository
if [ -d "$REPO_PATH/.git" ]; then
    log "Updating repository..."
    cd "$REPO_PATH"
    git fetch origin
    git reset --hard origin/main
else
    log "Cloning repository..."
    git clone https://github.com/HutchisonSorbo/smalltalk.community.git "$REPO_PATH"
    cd "$REPO_PATH"
fi

# Get last audit date
LAST_AUDIT=$(ls -t "$LOG_DIR"/audit-*.md 2>/dev/null | head -1 | grep -oP '\d{4}-\d{2}-\d{2}')
if [ -z "$LAST_AUDIT" ]; then
    LAST_AUDIT="First audit"
fi

log "Repository updated. Last audit: $LAST_AUDIT"

# Read audit prompt and replace placeholders
PROMPT=$(cat "$AUDIT_PROMPT" | sed "s/{INSERT_TODAY_DATE}/$DATE/g" | sed "s/{INSERT_LAST_AUDIT_DATE}/$LAST_AUDIT/g")

# Execute audit with Gemini CLI
log "Executing audit with Gemini..."
echo "$PROMPT" | gemini > "$LOG_DIR/audit-$DATE.md" 2>&1

# Check if audit completed successfully
if [ $? -eq 0 ]; then
    log "✅ Audit completed successfully"
    log "Report saved to: $LOG_DIR/audit-$DATE.md"
    
    # Extract critical findings count
    CRITICAL_COUNT=$(grep -c "🔴" "$LOG_DIR/audit-$DATE.md" || echo "0")
    log "Critical issues found: $CRITICAL_COUNT"
    
    if [ "$CRITICAL_COUNT" -gt 0 ]; then
        log "⚠️  IMMEDIATE ACTION REQUIRED - $CRITICAL_COUNT critical issues detected"
    fi
else
    log "❌ Audit failed - check log for errors"
    exit 1
fi

log "=== Audit Complete ==="

# Optional: Send notification (uncomment and configure as needed)
# echo "Audit complete. $CRITICAL_COUNT critical issues found." | mail -s "Smalltalk Audit $DATE" your@email.com
SCRIPT

chmod +x ~/audit-smalltalk.sh
```

## Part 3: Create Audit Prompt File

Save the audit prompt:

```bash
cat > ~/audit-prompt.md << 'PROMPT'
# DAILY DEEP CODEBASE AUDIT

Execute a comprehensive security, performance, and best practices audit of the smalltalk.community codebase.

## Audit Parameters
- **Repository**: https://github.com/HutchisonSorbo/smalltalk.community
- **Live Site**: https://smalltalk.community
- **Date**: {INSERT_TODAY_DATE}
- **Previous Audit**: {INSERT_LAST_AUDIT_DATE}

## Phase 1: Standards Compliance Check

### 1.1 Read Project Rules
Read these files from the repository in order:
1. CLAUDE.md - Core project rules
2. DEVELOPMENT_STANDARDS.md - Technical standards
3. SECURITY.md and SECURITY_SAFETY_STANDARDS.md - Security requirements
4. TECH_STACK_RULES.md - Technology constraints
5. INCIDENT_RESPONSE.md - Incident handling procedures

### 1.2 Verify Critical Rules Compliance
Check every instance of these critical requirements:

**Age Validation**
- Search codebase for age validation logic
- Verify minimum age is 13 (no lower)
- Confirm NO child age group exists
- Check NO parental consent system is present

**SDK Usage**
- Search for all import statements containing generative-ai
- Verify ONLY @google/genai is used
- Flag any deprecated @google/generative-ai imports

**Database Security**
- Review Supabase configuration
- Verify RLS is enabled on all tables
- Check RLS policies are correctly scoped per user
- Scan for SQL string concatenation
- Verify client code uses anon key only
- Confirm service key never appears in client-side code

**Environment Variables**
- Review .env.example file
- Verify NO secrets have NEXT_PUBLIC_ prefix
- Check SUPABASE_SERVICE_KEY is server-only
- Confirm GOOGLE_API_KEY is server-only

**Input Validation**
- Find all API routes in app/api/
- Verify every route has Zod schema validation
- Check all user inputs are sanitised
- Confirm all routes have try/catch error handling

## Phase 2: Security Audit

### 2.1 Authentication & Authorisation
- Review authentication flows
- Check session management implementation
- Verify protected routes use middleware correctly
- Test authorisation checks in API routes
- Examine JWT token handling

### 2.2 OWASP Top 10 Scan
Scan for each OWASP vulnerability category in the codebase

### 2.3 API Security
- Test all API routes
- Verify rate limiting is implemented
- Check CORS configuration
- Examine API key handling

### 2.4 Content Security
- Review content moderation implementation
- Check teen account restrictions
- Verify PII detection is working
- Test AI safety checks

## Phase 3: Performance Audit

### 3.1 Bundle Analysis
- Analyse next build output
- Identify largest chunks
- Check for duplicate dependencies

### 3.2 Database Performance
- Review database queries
- Check for N+1 query patterns
- Verify indexes exist

### 3.3 Core Web Vitals
Check performance metrics for the live site

## Phase 4: Code Quality Audit

### 4.1 TypeScript Compliance
Review TypeScript configuration and usage

### 4.2 Linting Compliance
Check linting setup and violations

### 4.3 Error Handling
Review error handling patterns

## Phase 5: Best Practices Audit

### 5.1 Accessibility
Check accessibility implementation

### 5.2 SEO
Verify SEO optimisation

### 5.3 Documentation
Review documentation quality

## Output Format

Generate a complete markdown report with this structure:

# Codebase Audit Report
**Date**: {INSERT_TODAY_DATE}
**Repository**: smalltalk.community
**Auditor**: Senior Security Engineer (Gemini)

## Executive Summary
[2-3 sentences on overall health and top priorities]

### Severity Breakdown
- 🔴 Critical: X issues
- 🟠 High: X issues  
- 🟡 Medium: X issues
- 🟢 Low: X issues

### Immediate Action Required
[3-5 most critical items]

## Critical Findings (🔴)

### [CRIT-001] {Title}
**File**: path/to/file.ts:123
**Rule Violated**: CLAUDE.md - {Section}
**Description**: {What's wrong}
**Risk**: {Impact}
**Evidence**:
```typescript
// Current code
```
**Remediation**:
```typescript
// Fixed code
```
**Verification**: {How to confirm fix}

[Repeat for all findings at each severity level]

## Compliance Summary
[Checklist of all standards compliance]

## Progress Since Last Audit
[Resolved, regressed, and new issues]

## Recommendations
[Immediate, short-term, and long-term actions]

---

Be thorough, precise, and provide actionable remediation for every finding.
PROMPT
```

## Part 4: Setup Cron Job

Schedule the audit to run daily at 2am:

```bash
# Open crontab editor
crontab -e

# Add this line (runs at 2am daily)
0 2 * * * /bin/bash $HOME/audit-smalltalk.sh

# Save and exit
```

Verify the cron job was added:
```bash
crontab -l
```

## Part 5: Test the Setup

Run a manual audit to test everything:

```bash
~/audit-smalltalk.sh
```

Check the output:
```bash
# View the log
tail -f ~/audit-logs/audit-$(date +%Y-%m-%d).log

# View the audit report
less ~/audit-logs/audit-$(date +%Y-%m-%d).md
```

## Part 6: Daily Workflow

Each morning:

1. Check for new audit report:
   ```bash
   ls -lht ~/audit-logs/*.md | head -1
   ```

2. Review the audit:
   ```bash
   cat ~/audit-logs/audit-$(date +%Y-%m-%d).md
   ```

3. For implementation, copy the report content and paste into your AI agent chat with:
   ```
   Here's today's audit report. Please implement the fixes for all critical and high priority issues.
   
   [paste audit report here]
   ```

## Troubleshooting

**If audit fails:**
```bash
# Check the log file
tail -100 ~/audit-logs/audit-$(date +%Y-%m-%d).log

# Test Gemini CLI manually
echo "Hello, are you working?" | gemini

# Verify repository access
cd ~/smalltalk-community && git pull
```

**If GEMINI.md isn't being used:**
```bash
# Verify it exists
cat ~/.gemini/GEMINI.md

# Test it's being read
echo "What is your role?" | gemini
```

**If cron job doesn't run:**
```bash
# Check cron logs
grep CRON /var/log/syslog | tail -20

# Verify cron service is running
systemctl status cron
```

## Configuration Complete

You now have:
- ✅ Gemini CLI configured as a senior engineer
- ✅ Daily audit script
- ✅ Automated scheduling via cron
- ✅ Comprehensive audit coverage
- ✅ Actionable markdown reports ready for AI implementation

The first audit will run tonight at 2am. You can run it manually anytime with `~/audit-smalltalk.sh`.