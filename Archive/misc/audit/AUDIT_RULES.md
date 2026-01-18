# AUDIT_RULES.md

## Overview
This document defines comprehensive audit requirements for Next.js/React projects using Supabase and Vercel. All audits must follow the guidelines in CLAUDE.md and produce dated audit reports in the `audit/` folder.

## Audit Output Requirements

### File Naming Convention
- Format: `DDMMYY_audit.md`
- Example: `080126_audit.md` (8th January 2026)
- Location: `audit/` folder in project root

### Report Structure
Each audit report must include:

1. **Header Section**
   - Audit date and time
   - Auditor identification
   - Codebase version/commit hash
   - Total files analysed
   - Total lines of code reviewed

2. **Executive Summary**
   - Critical findings count
   - High priority findings count
   - Medium priority findings count
   - Low priority findings count
   - Overall security score (0-100)
   - Overall performance score (0-100)
   - Overall compliance score (0-100)

3. **Detailed Findings** (categorised and prioritised)

4. **Remediation Roadmap** (prioritised action items)

5. **Appendices** (dependencies report, metrics, etc.)

## 1. Code Quality and Best Practices

### 1.1 React-Specific Issues
- **Component Structure**
  - Components over 300 lines (should be split)
  - Missing PropTypes or TypeScript interfaces
  - Improper component composition (too deeply nested)
  - Mixing presentational and container logic
  - Missing key props in lists
  - Direct DOM manipulation (should use refs)
  - Inline function definitions in render (performance issue)
  - Missing display names for debugging

- **Hooks Usage**
  - Rules of Hooks violations (conditional hooks, hooks in loops)
  - Missing dependencies in useEffect arrays
  - Unnecessary dependencies causing re-renders
  - useEffect with async functions (antipattern)
  - State updates in render phase
  - Multiple useState calls that should be useReducer
  - Missing cleanup functions in useEffect
  - Stale closure issues

- **State Management**
  - Prop drilling (passing props through 3+ levels)
  - Duplicate state (same data in multiple components)
  - Derived state that should be computed
  - Unnecessary global state
  - State updates not batched properly
  - Missing optimistic updates for better UX
  - Incorrect state initialisation

- **Performance Patterns**
  - Missing React.memo on expensive components
  - Missing useMemo for expensive calculations
  - Missing useCallback for event handlers passed to children
  - Unnecessary object/array creation in render
  - Large context providers causing widespread re-renders
  - Virtual scrolling not used for long lists
  - Images not lazy loaded
  - Heavy computations on main thread

### 1.2 Next.js-Specific Issues
- **Rendering Strategies**
  - Incorrect use of 'use client' directive
  - Server components fetching data client-side
  - Client components that could be server components
  - Missing streaming/Suspense boundaries
  - Waterfall requests (should be parallel)
  - Over-use of dynamic rendering when static would work
  - Missing revalidate settings for ISR

- **App Router Issues**
  - Improper route grouping
  - Missing loading.tsx or error.tsx files
  - Route handlers without proper HTTP method checks
  - Missing route segment config options
  - Incorrect metadata API usage
  - Layout components doing data fetching (should be in page)
  - Nested layouts causing unnecessary re-renders

- **Image Optimisation**
  - Using <img> instead of next/image
  - Missing width/height on next/image
  - No priority flag on LCP images
  - Missing sizes attribute for responsive images
  - Unoptimised image formats (not using WebP/AVIF)
  - Images served from external domains without config

- **Performance Optimisations**
  - Missing bundle analysis
  - No dynamic imports for heavy components
  - Missing prefetching for important routes
  - Fonts not optimised (not using next/font)
  - Missing compression middleware
  - No edge runtime where beneficial
  - Third-party scripts not optimised (missing next/script)

### 1.3 TypeScript Issues
- **Type Safety**
  - Use of 'any' type (should be specific types)
  - Type assertions without validation (as keyword abuse)
  - Missing return types on functions
  - Implicit any in function parameters
  - Non-null assertions (!) without safety checks
  - Missing generic constraints
  - Type widening issues causing runtime errors

- **Type Definitions**
  - Missing types for third-party libraries
  - Inconsistent naming conventions
  - Overly complex types (should be simplified)
  - Missing utility types (Pick, Omit, Partial, etc.)
  - Duplicate type definitions
  - Types not exported when they should be

### 1.4 Code Smells
- **General Issues**
  - Functions over 50 lines (should be split)
  - Cyclomatic complexity over 10
  - Deeply nested conditionals (over 3 levels)
  - Magic numbers (unexplained constants)
  - Dead code (unreachable branches)
  - Commented-out code blocks
  - Console.log statements in production code
  - TODO/FIXME comments indicating incomplete work
  - Inconsistent naming conventions
  - Missing JSDoc comments on complex functions

- **DRY Violations**
  - Duplicate code blocks (copy-paste programming)
  - Similar functions that should be generalised
  - Repeated logic that should be extracted
  - Multiple components with same structure

- **Error Handling**
  - Try-catch blocks without specific error handling
  - Errors silently swallowed (empty catch blocks)
  - Missing error boundaries in React
  - No fallback UI for errors
  - Promise rejections not handled
  - Missing input validation before operations

## 2. Security Vulnerabilities

### 2.1 OWASP Top 10 Compliance
- **A01:2021 - Broken Access Control**
  - Missing authentication checks on API routes
  - Inadequate authorisation verification
  - Path traversal vulnerabilities
  - Insecure direct object references (IDOR)
  - Missing rate limiting on sensitive endpoints
  - CORS misconfiguration allowing unauthorised origins
  - Elevation of privilege vulnerabilities

- **A02:2021 - Cryptographic Failures**
  - Sensitive data transmitted without encryption
  - Weak cryptographic algorithms (MD5, SHA1)
  - Hardcoded encryption keys
  - Missing SSL/TLS configuration
  - Passwords stored in plain text or weak hashing
  - Missing HSTS headers
  - Sensitive data in URLs or logs

- **A03:2021 - Injection**
  - SQL injection vulnerabilities
  - NoSQL injection in database queries
  - Command injection in system calls
  - LDAP injection
  - XPath injection
  - Server-side template injection
  - Log injection

- **A04:2021 - Insecure Design**
  - Missing threat modeling
  - No security requirements in design
  - Insufficient security controls
  - Trust boundary violations
  - No defense in depth
  - Missing security patterns (fail secure, least privilege)

- **A05:2021 - Security Misconfiguration**
  - Default credentials in use
  - Unnecessary features enabled
  - Detailed error messages exposing system info
  - Missing security headers (CSP, X-Frame-Options, etc.)
  - Outdated framework versions
  - Development mode in production
  - Directory listing enabled
  - Backup files accessible

- **A06:2021 - Vulnerable and Outdated Components**
  - Dependencies with known CVEs
  - Unmaintained libraries
  - Missing security patches
  - End-of-life software in use
  - No software composition analysis

- **A07:2021 - Identification and Authentication Failures**
  - Weak password requirements
  - No account lockout mechanism
  - Predictable session IDs
  - Session fixation vulnerabilities
  - Missing multi-factor authentication on sensitive operations
  - Credential stuffing vulnerabilities
  - Insecure password recovery

- **A08:2021 - Software and Data Integrity Failures**
  - No integrity checks on updates
  - Insecure deserialization
  - No CI/CD pipeline security
  - Unverified third-party code
  - Missing SRI (Subresource Integrity) on CDN resources

- **A09:2021 - Security Logging and Monitoring Failures**
  - Missing audit logs
  - Insufficient logging of security events
  - No alerting on suspicious activity
  - Logs not protected from tampering
  - No centralised log management

- **A10:2021 - Server-Side Request Forgery (SSRF)**
  - Unvalidated URLs in server-side requests
  - No allowlist for external requests
  - Missing network segmentation
  - Cloud metadata endpoints accessible

### 2.2 Client-Side Security
- **XSS Prevention**
  - Unsanitised user input rendered in DOM
  - dangerouslySetInnerHTML usage without sanitisation
  - Direct HTML injection
  - Event handler injection
  - DOM-based XSS vulnerabilities
  - Reflected XSS in URL parameters
  - Stored XSS in database content

- **CSRF Protection**
  - State-changing operations without CSRF tokens
  - Missing SameSite cookie attributes
  - No anti-CSRF measures on forms
  - GET requests changing server state

- **Content Security Policy**
  - Missing or weak CSP headers
  - Inline scripts not properly nonces
  - Unsafe-eval or unsafe-inline in CSP
  - No CSP reporting endpoint

### 2.3 API Security
- **Authentication**
  - JWT tokens without expiration
  - Refresh tokens not rotated
  - Bearer tokens in URLs
  - No token revocation mechanism
  - Weak token generation
  - Missing token signature verification

- **Authorisation**
  - Missing resource-level permission checks
  - Horizontal privilege escalation possible
  - Vertical privilege escalation possible
  - No role-based access control (RBAC)
  - Function-level access control missing

- **Input Validation**
  - Missing schema validation on API inputs
  - No input length limits
  - Special characters not sanitised
  - File uploads without type validation
  - No size limits on uploads
  - Mass assignment vulnerabilities

- **Rate Limiting**
  - No rate limiting on API endpoints
  - Inadequate rate limits (too permissive)
  - No exponential backoff
  - Rate limiting bypassable

### 2.4 Supabase-Specific Security
- **Row Level Security (RLS)**
  - Tables without RLS policies enabled
  - Overly permissive RLS policies (allowing all access)
  - RLS policies not covering all CRUD operations
  - Missing RLS policies for specific user roles
  - RLS policies with logic errors
  - Policies not using security definer functions where needed
  - Missing indexes on RLS policy columns (performance issue)

- **Database Security**
  - Service role key used in client-side code
  - Anon key with excessive permissions
  - Database functions without security definer
  - Functions accessible without authentication
  - Missing input validation in database functions
  - SQL injection in database functions
  - Triggers without proper security checks

- **Storage Security**
  - Public buckets containing sensitive data
  - Missing RLS on storage.objects
  - No file type validation
  - Missing virus scanning on uploads
  - Predictable file names exposing structure
  - No size limits on storage buckets

- **Realtime Security**
  - Realtime channels without authentication
  - Broadcast messages containing sensitive data
  - No authorisation checks on presence
  - Missing filtering on realtime subscriptions

- **Edge Functions**
  - Functions without authentication checks
  - Secrets hardcoded in edge functions
  - No input validation in edge functions
  - CORS misconfigured on edge functions

### 2.5 Environment and Configuration
- **Secrets Management**
  - API keys hardcoded in source code
  - .env files committed to git
  - Secrets in client-side code
  - Missing .env.example file
  - Secrets in error messages
  - Keys in comments or documentation

- **Environment Variables**
  - NEXT_PUBLIC_ prefix on sensitive data
  - Missing environment variable validation
  - No different configs for environments
  - Production credentials in development

## 3. Performance Optimisation

### 3.1 Frontend Performance
- **Core Web Vitals**
  - LCP (Largest Contentful Paint) over 2.5s
  - FID (First Input Delay) over 100ms
  - CLS (Cumulative Layout Shift) over 0.1
  - TTFB (Time to First Byte) over 800ms
  - FCP (First Contentful Paint) over 1.8s
  - INP (Interaction to Next Paint) issues

- **Bundle Optimisation**
  - Total bundle size over 200KB (gzipped)
  - Main bundle not code-split
  - Vendor bundles too large
  - Duplicate code across chunks
  - Unused exports in bundles
  - Large libraries imported entirely (use tree-shaking)
  - Missing compression (Gzip/Brotli)

- **Asset Optimisation**
  - Images not compressed
  - Missing responsive images
  - SVGs not optimised
  - Fonts not subsetting
  - Icon libraries fully imported (use selective imports)
  - CSS not minified
  - JavaScript not minified in production

- **Loading Strategies**
  - Critical resources not preloaded
  - Non-critical resources blocking render
  - Missing resource hints (dns-prefetch, preconnect)
  - JavaScript blocking HTML parsing
  - CSS blocking render
  - No lazy loading on below-fold content

### 3.2 Backend Performance
- **Database Optimisation**
  - Missing indexes on frequently queried columns
  - N+1 query problems
  - Queries fetching unnecessary columns (use SELECT specific)
  - Missing query result caching
  - Full table scans on large tables
  - Inefficient join operations
  - Missing database connection pooling
  - Queries not using prepared statements
  - Suboptimal query execution plans

- **API Performance**
  - API routes doing synchronous operations
  - Missing response caching
  - No database query batching
  - Sequential operations that could be parallel
  - Missing pagination on large datasets
  - No compression on API responses
  - Excessive data returned (should use field selection)

- **Caching Strategies**
  - No HTTP caching headers
  - Missing Redis/Memcached for session data
  - Static assets not cached
  - API responses not cached
  - Stale-while-revalidate not used
  - No CDN caching strategy
  - Cache invalidation strategy missing

### 3.3 Rendering Performance
- **Server-Side Rendering**
  - Unnecessary data fetching on server
  - Slow server-side computations
  - No streaming for long responses
  - Missing static generation where possible
  - Waterfall data fetching patterns

- **Client-Side Rendering**
  - Excessive re-renders due to state changes
  - Large component trees without virtualization
  - Expensive calculations in render
  - No debouncing on frequent events
  - Animations not using GPU acceleration
  - Layout thrashing (read-write-read patterns)

### 3.4 Network Performance
- **Request Optimisation**
  - Too many HTTP requests
  - No request batching
  - Missing HTTP/2 push
  - No service worker for offline support
  - Missing prefetching for navigation
  - Third-party scripts blocking render

- **Payload Optimisation**
  - Large JSON payloads
  - No data compression
  - Redundant data in responses
  - Missing API response pagination
  - GraphQL over-fetching (if used)

## 4. Compliance and Legal Requirements

### 4.1 Australian Privacy Principles (APPs)
- **APP 1: Open and Transparent Management**
  - Missing privacy policy
  - Privacy policy not easily accessible
  - No clear explanation of data practices
  - Missing contact information for privacy queries

- **APP 3: Collection of Solicited Information**
  - Collecting more data than necessary
  - No clear purpose for data collection
  - Collection not reasonably necessary
  - Missing consent mechanisms

- **APP 5: Notification of Collection**
  - Users not informed about data collection
  - Missing notification at point of collection
  - No explanation of how data will be used
  - Overseas disclosure not disclosed

- **APP 6: Use or Disclosure**
  - Using data for purposes not disclosed
  - Sharing data without consent
  - No opt-out for direct marketing
  - Secondary purposes not related to primary

- **APP 7: Direct Marketing**
  - No unsubscribe mechanism
  - Direct marketing without consent
  - Missing opt-out instructions
  - Continuing after opt-out

- **APP 8: Cross-Border Disclosure**
  - Transferring data overseas without disclosure
  - No safeguards for overseas transfers
  - Missing information about receiving countries
  - Inadequate protection in recipient country

- **APP 11: Security of Information**
  - Inadequate security measures
  - No encryption of sensitive data
  - Missing access controls
  - No destruction of data when no longer needed

- **APP 12: Access to Information**
  - No mechanism for users to access their data
  - Excessive delays in providing access
  - Unreasonable charges for access
  - Missing data portability features

- **APP 13: Correction of Information**
  - No way for users to correct their data
  - Delays in making corrections
  - No notification to third parties of corrections

### 4.2 Child Safety (Victoria Standards)
- **Age Verification**
  - No age verification on registration
  - Easily bypassable age gates
  - Collecting child data without parental consent
  - No age-appropriate privacy notices

- **Content Moderation**
  - User-generated content not moderated
  - No reporting mechanism for inappropriate content
  - Missing content filtering for children
  - Inappropriate advertising to children
  - No parental controls available

- **Data Protection for Minors**
  - Collecting more data from children than necessary
  - No special protections for child data
  - Sharing child data with third parties
  - Location tracking of minors
  - No mechanism to delete child accounts

- **Communication Safety**
  - No restrictions on adult-child communication
  - Missing chat moderation
  - Direct messaging without supervision
  - No blocking/reporting features
  - Contact information of children accessible

- **eSafety Commissioner Compliance**
  - Not registered with eSafety Commissioner (if required)
  - Missing safety by design principles
  - No risk assessment for child safety
  - Missing transparency reports
  - Non-compliance with online content scheme

### 4.3 GDPR Compliance (for International Users)
- **Lawful Basis for Processing**
  - No lawful basis documented
  - Consent not freely given
  - Pre-checked consent boxes
  - Consent bundled inappropriately

- **Data Subject Rights**
  - No right to erasure mechanism
  - Missing data portability feature
  - No right to object mechanism
  - Missing right to restriction
  - No automated decision-making disclosures

- **Data Protection Impact Assessment**
  - No DPIA for high-risk processing
  - Missing risk mitigation measures
  - No consultation with DPO (if required)

- **Breach Notification**
  - No breach detection mechanisms
  - Missing breach notification procedures
  - No 72-hour notification capability
  - No communication plan for affected users

### 4.4 Accessibility (WCAG 2.1)
- **Level A Compliance**
  - Missing alt text on images
  - No keyboard navigation
  - Forms without labels
  - Time limits without extensions
  - Auto-playing audio/video

- **Level AA Compliance**
  - Insufficient colour contrast (under 4.5:1)
  - No text resize support (up to 200%)
  - Images of text used unnecessarily
  - Multiple ways to find pages missing
  - Focus indicators not visible

- **ARIA Implementation**
  - Missing ARIA labels
  - Incorrect ARIA roles
  - ARIA states not updated
  - Redundant ARIA attributes
  - Screen reader testing not done

## 5. DevOps and Infrastructure

### 5.1 Vercel Configuration
- **Build Optimisation**
  - Build times over 5 minutes
  - No caching of build artifacts
  - Unnecessary rebuilds triggered
  - Missing build output optimisation

- **Deployment Settings**
  - No preview deployments for PRs
  - Missing environment variable configuration
  - No deployment protection
  - Incorrect build command configuration
  - Missing framework preset optimisations

- **Edge Configuration**
  - Edge functions not used where beneficial
  - Missing edge middleware
  - No geographic routing optimisation
  - ISR not configured properly

### 5.2 Monitoring and Logging
- **Error Tracking**
  - No error tracking service integrated
  - Client-side errors not logged
  - Missing error context information
  - No alerting on critical errors
  - Source maps not uploaded for debugging

- **Performance Monitoring**
  - No performance monitoring (RUM)
  - Missing APM for backend
  - No tracking of Core Web Vitals
  - Database query performance not monitored
  - API response times not tracked

- **Logging**
  - Insufficient logging of critical operations
  - Logs containing sensitive information
  - No structured logging format
  - Missing correlation IDs for tracing
  - No log aggregation service

### 5.3 CI/CD Pipeline
- **Security Scanning**
  - No dependency scanning in CI
  - Missing SAST (static analysis) tools
  - No secrets scanning
  - Missing license compliance checks
  - No DAST (dynamic analysis) in staging

- **Testing**
  - No unit tests or coverage under 80%
  - Missing integration tests
  - No end-to-end tests for critical paths
  - Tests not running in CI
  - No performance testing
  - Missing accessibility testing

- **Deployment Pipeline**
  - Manual deployment process
  - No rollback strategy
  - Missing smoke tests after deployment
  - No blue-green or canary deployments
  - Production deployments without approval

## 6. Documentation and Maintenance

### 6.1 Code Documentation
- **Missing Documentation**
  - No README in project root
  - Missing API documentation
  - No architecture diagrams
  - Component documentation missing
  - No onboarding guide for new developers

- **Inline Documentation**
  - Complex functions without comments
  - No JSDoc for public APIs
  - Outdated comments (code changed, comments didn't)
  - Commented-out code without explanation

### 6.2 Dependency Management
- **Package Management**
  - Outdated dependencies (check npm outdated)
  - Dependencies with security advisories
  - Unused dependencies in package.json
  - Missing lock file (package-lock.json)
  - Inconsistent versions across dependencies
  - Using deprecated packages

- **License Compliance**
  - Dependencies with incompatible licenses
  - GPL-licensed code in proprietary project
  - Missing license attribution
  - No license compliance audit

## 7. Testing Requirements

### 7.1 Test Coverage
- **Unit Tests**
  - Functions without unit tests
  - Utility functions not tested
  - Business logic not covered
  - Edge cases not tested
  - Error paths not tested

- **Integration Tests**
  - API routes without integration tests
  - Database operations not tested
  - Third-party integrations not mocked
  - Authentication flows not tested

- **End-to-End Tests**
  - Critical user journeys not tested
  - Payment flows without e2e tests
  - Registration/login not tested
  - No cross-browser testing

### 7.2 Test Quality
- **Test Issues**
  - Flaky tests (intermittent failures)
  - Tests depending on external services
  - Tests with hardcoded values
  - Tests not isolated (sharing state)
  - Slow tests (over 100ms for unit tests)
  - Tests that don't test behaviour (implementation tests)

## 8. Mobile and Responsive Design

### 8.1 Responsive Issues
- **Layout Problems**
  - Fixed widths breaking on mobile
  - Horizontal scrolling on small screens
  - Text too small on mobile
  - Touch targets under 44x44px
  - No viewport meta tag
  - Content cut off on small screens

- **Performance on Mobile**
  - Large bundle sizes for mobile
  - No adaptive loading for slow connections
  - Images too large for mobile
  - No reduced motion support
  - Touch interactions laggy

### 8.2 Progressive Web App
- **PWA Features**
  - No service worker
  - Missing manifest.json
  - No offline fallback
  - Not installable
  - Missing icon sizes
  - No splash screens

## 9. Third-Party Integrations

### 9.1 Integration Security
- **API Keys and Credentials**
  - Third-party API keys in client code
  - No API key rotation policy
  - Excessive permissions granted to integrations
  - No monitoring of third-party usage

### 9.2 Dependency on External Services
- **Reliability Issues**
  - No fallback if third-party service fails
  - Missing circuit breakers
  - No timeout configuration
  - Single point of failure
  - No health checks on dependencies

## 10. Audit Methodology

### 10.1 Automated Tools
Use these tools and report their findings:
- **npm audit** (dependency vulnerabilities)
- **Snyk** or **OWASP Dependency-Check** (CVE scanning)
- **ESLint** with security plugins
- **TypeScript compiler** in strict mode
- **Lighthouse** (performance and accessibility)
- **axe DevTools** (accessibility)
- **WebPageTest** (performance metrics)
- **Security Headers** checker
- **SSL Labs** test (if applicable)
- **React DevTools Profiler** (component performance)
- **Next.js Bundle Analyzer**

### 10.2 Manual Review Process
1. Read and understand CLAUDE.md requirements
2. Review all files systematically (no files skipped)
3. Cross-reference findings between automated and manual
4. Test security vulnerabilities in isolated environment
5. Verify compliance requirements against legislation
6. Performance test under load where possible
7. Review git history for accidentally committed secrets

### 10.3 Severity Classification

**Critical (P0)**
- Active exploitation possible
- Data breach risk
- Authentication bypass
- Complete system compromise
- Child safety violations
- Privacy law violations with penalty risk

**High (P1)**
- Significant security vulnerability
- Performance degradation affecting users
- Compliance requirement not met
- Potential for exploitation with some complexity

**Medium (P2)**
- Security hardening needed
- Performance could be improved
- Code quality issues risking bugs
- Best practices not followed

**Low (P3)**
- Minor improvements
- Code style issues
- Non-critical optimisations
- Documentation gaps

## 11. Remediation Guidelines

### 11.1 Remediation Format
For each issue, provide:

```markdown
### [SEVERITY] Issue Title

**Location:** `path/to/file.tsx:line_number`

**Category:** Security | Performance | Compliance | Code Quality

**Description:**
[Clear explanation of what's wrong]

**Impact:**
[What could happen if not fixed]

**Current Code:**
```typescript
// Show the problematic code
```

**Fixed Code:**
```typescript
// Show the corrected code
```

**Steps to Fix:**
1. [Step by step instructions]
2. [With specific commands if applicable]

**References:**
- [Link to documentation]
- [CVE number if applicable]
- [Related issues]

**Estimated Effort:** [Small/Medium/Large]
```

### 11.2 Priority Matrix
Create a prioritisation matrix based on:
- Severity of issue
- Ease of fix
- Impact on users
- Compliance deadlines
- Dependencies between fixes

## 12. Continuous Improvement

### 12.1 Follow-Up Actions
- Set up automated security scanning in CI
- Schedule regular dependency updates
- Implement pre-commit hooks for quality checks
- Set up performance budgets
- Create security incident response plan
- Establish code review checklist

### 12.2 Metrics to Track
- Time to fix critical issues
- Number of repeat issues
- Test coverage percentage
- Security vulnerabilities over time
- Performance metrics trends
- Compliance audit scores

## 13. Report Deliverables

Each audit must produce:

1. **Main Report:** `DDMMYY_audit.md` with all findings
2. **Executive Summary:** One-page PDF for stakeholders
3. **Remediation Backlog:** CSV/Excel with prioritised issues
4. **Dependency Report:** Full list of CVEs found
5. **Performance Report:** Lighthouse and WebPageTest results
6. **Compliance Checklist:** Status of all legal requirements

## 14. Sign-Off Requirements

Audit is complete only when:
- [ ] Every file has been reviewed
- [ ] All automated tools have been run
- [ ] Severity classifications are justified
- [ ] Remediation steps are specific and actionable
- [ ] Report follows naming convention
- [ ] Report is saved in audit/ folder
- [ ] CLAUDE.md requirements have been followed
- [ ] No findings have been omitted
- [ ] Cross-references are accurate
- [ ] Code examples compile and run

---

**Document Version:** 1.0  
**Last Updated:** 8 January 2026  
**Next Review:** Annually or when major framework updates occur