# AI Agent Production Testing Protocol
## smalltalk.community Comprehensive Testing Suite

**Version**: 1.0  
**Created**: 17 January 2026  
**Purpose**: Complete production testing of https://smalltalk.community  
**Contact**: smalltalkcommunity.backup@gmail.com

---

## ⚠️ CRITICAL: Read Before Starting

Before beginning ANY testing or fixes, you **MUST** read:

1. **[CLAUDE.md](./CLAUDE.md)** - Essential AI agent rules and standards
2. **[DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md)** - Complete technical standards
3. **[INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)** - Incident handling procedures

**Repository**: https://github.com/HutchisonSorbo/smalltalk.community

---

## Mission Briefing

You are tasked with **comprehensive production testing** of https://smalltalk.community, a multi-tenant community platform for youth services in regional Victoria, Australia. Your objective is to:

1. Create **2 test accounts** (1 user, 1 organisation)
2. Test **complete onboarding flows** for both account types
3. Verify **all apps load and function** without errors
4. Test **organisation white label dashboard** and all 19 CommunityOS apps
5. Verify **Community Insights AI** works correctly
6. **Identify, fix, test, repeat** until all features work correctly

---

## System Overview

### Technology Stack

- **Framework**: Next.js 15.x with App Router
- **Language**: TypeScript 5.x
- **Database**: Supabase (PostgreSQL with RLS)
- **Sync**: Ditto offline-first mesh networking
- **Hosting**: Vercel (with Edge Functions)
- **Auth**: Supabase Auth with RLS policies
- **Node**: v22.x
- **Package Manager**: pnpm

### Critical Requirements

- **Minimum Age**: 13 years (strictly enforced)
- **Age Groups**: Teen (13-17), Adult (18-64), Senior (65+)
- **SDK**: Use `@google/genai` ONLY (NOT `@google/generative-ai`)
- **Security**: RLS enabled on ALL database tables
- **Region**: Regional Victoria, Australia

### Features to Test

1. Individual user registration and onboarding
2. Organisation registration and onboarding
3. Public-facing apps (Apprenticeship Hub, Peer Support, etc.)
4. Organisation CommunityOS dashboard (19 apps)
5. White label branding for organisations
6. Community Insights AI functionality
7. Data isolation between tenants
8. Error handling and user experience

---

## Phase 1: Pre-Test Setup

### 1.1 Environment Preparation

# Verify node version
node --version  # Should be 22.x

# Create test tracking file
touch TEST_RESULTS.md
```


### 1.2 Test Account Details

**Individual User Account:**

- Email: `test-user-${timestamp}@smalltalk.test` (use current timestamp)
- Full Name: Test User Agent
- DOB: 2005-06-15 (Age 20, Adult cohort, meets 13+ requirement)
- Location: Kilmore, Victoria, 3757
- Account Type: Individual

**Organisation Account:**

- Organisation Name: Test Organisation \${timestamp}
- Contact Name: Test Org Admin
- Email: `test-org-${timestamp}@smalltalk.test`
- Account Type: Organisation
- Region: Mitchell Shire, Victoria
- ABN: (if required, use valid test ABN format)


### 1.3 Create Testing Tracker

Create `TEST_RESULTS.md` in the repository root:

```markdown
# smalltalk.community Testing Results

**Date**: 17 January 2026
**Tester**: AI Agent
**Environment**: Production (https://smalltalk.community)
**Start Time**: [timestamp]

## Test Accounts Created
- [ ] Individual User: [email]
- [ ] Organisation: [email]

## Testing Phases
- [ ] Phase 1: Pre-Test Setup
- [ ] Phase 2: Individual User Testing
- [ ] Phase 3: Organisation Testing
- [ ] Phase 4: Error Detection & Fixing
- [ ] Phase 5: Final Verification

## Quick Stats
- **Total Tests**: 0
- **Passed**: 0
- **Failed**: 0
- **Fixed**: 0

## Issues Log
[Issues will be documented below]

***
```


---

## Phase 2: Individual User Testing

### 2.1 User Registration

**Objective**: Create individual user account and complete onboarding

**Test Steps:**

1. **Navigate to sign-up page**

```
URL: https://smalltalk.community/auth/signup
OR look for "Sign Up" button on homepage
```

2. **Complete registration form**
    - [ ] All form fields are present and labelled
    - [ ] Enter test user details (see 1.2)
    - [ ] Verify age validation enforces 13+ minimum
    - [ ] DOB picker works correctly
    - [ ] Password requirements are displayed
    - [ ] Terms and conditions checkbox present
3. **Submit and verify**
    - [ ] Form submits successfully
    - [ ] Appropriate redirect (to dashboard or email verification)
    - [ ] No console errors (press F12 to check)
    - [ ] Success message displayed
4. **Document findings in TEST_RESULTS.md**:

```markdown
### 2.1 User Registration
**Status**: ✅ Pass / ❌ Fail
**Timestamp**: [time]

**Checklist**:
- Form loads: ✅/❌
- All fields present: ✅/❌
- Age validation (13+): ✅/❌
- Submission works: ✅/❌
- Redirect correct: ✅/❌
- Console errors: ✅ None / ❌ [paste errors]

**Issues Found**: [List any]
**Screenshots**: [If applicable]
```


### 2.2 User Login and Onboarding

**Test Steps:**

1. **Login with test credentials**

```
URL: https://smalltalk.community/login
OR https://smalltalk.community/auth/login
```

    - [ ] Login page loads
    - [ ] Enter email and password
    - [ ] Submit form
    - [ ] Authentication successful
    - [ ] Redirected to appropriate page
2. **Complete onboarding flow**
    - [ ] Onboarding wizard appears (if applicable)
    - [ ] Profile completion prompts
    - [ ] Age cohort correctly assigned (Adult for DOB 2005-06-15)
    - [ ] Location/region selection works
    - [ ] Profile photo upload (if available)
3. **Access user dashboard**
    - [ ] Dashboard loads successfully
    - [ ] User profile displays correctly
    - [ ] Navigation menu is complete
    - [ ] No broken links
    - [ ] Responsive design works (resize browser window)
4. **Document findings**:

```markdown
### 2.2 User Login & Onboarding
**Status**: ✅ Pass / ❌ Fail

**Login**: ✅ Success / ❌ Failed
**Onboarding**: ✅ Complete / ❌ Issues
**Dashboard Access**: ✅ Granted / ❌ Denied
**Profile Completion**: ✅ Works / ❌ Issues
**Age Cohort**: ✅ Adult (correct) / ❌ [incorrect assignment]

**Issues**: [List any]
```


### 2.3 Apps Section Testing

**Test Steps:**

1. **Navigate to Apps page**

```
URL: https://smalltalk.community/apps
OR find "Apps" in navigation menu
```

2. **Verify Apps page**
    - [ ] Page loads without errors
    - [ ] All app cards/tiles display
    - [ ] App descriptions visible
    - [ ] Images/icons load correctly
    - [ ] Layout is responsive
3. **Test each public-facing app**

Expected apps (based on repository structure):
    - Apprenticeship Hub
    - Peer Support Finder
    - Volunteer Passport
    - Work Experience Hub
    - Youth Service Navigator
    - Local Music Network
    - [Any other public apps]

**For EACH app:**

a. Click on app card/button
b. Verify app page loads (no 404 errors)
c. Check for missing UI elements
d. Look for broken images or missing buttons
e. Test primary functionality (e.g., search, form submission)
f. Open browser console (F12) and check for errors
g. Test navigation back to Apps section

**Document using this template:**

```markdown
#### App: [APP_NAME]
- **URL**: [full URL]
- **Loads**: ✅ Yes / ❌ No
- **UI Complete**: ✅ Yes / ❌ Missing: [list]
- **Primary Function**: ✅ Works / ❌ Broken: [explain]
- **Console Errors**: ✅ None / ❌ [paste errors]
- **Notes**: [Any observations]
```

4. **Create summary table**:

```markdown
### 2.3 Apps Section Testing

| App Name | Loads | UI Complete | Functions | Console Errors |
|----------|-------|-------------|-----------|----------------|
| Apprenticeship Hub | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| Peer Support | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| Volunteer Passport | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| ... | ... | ... | ... | ... |

**Overall Status**: ✅ All working / ⚠️ Issues found / ❌ Critical failures
**Critical Issues**: [List any blocking issues]
```


### 2.4 User Features Testing

**Test Steps:**

1. **Settings/Preferences**
    - [ ] Settings page accessible
    - [ ] Profile can be edited
    - [ ] Email can be changed
    - [ ] Password can be changed
    - [ ] Privacy settings available
    - [ ] Changes save successfully
2. **Navigation Testing**
    - [ ] All menu items work
    - [ ] No 404 errors
    - [ ] Breadcrumbs work (if present)
    - [ ] Back button functions correctly
3. **Document findings**:

```markdown
### 2.4 User Features
**Settings**: ✅ Working / ❌ Issues: [list]
**Navigation**: ✅ Complete / ❌ Broken links: [list]
**Profile Editing**: ✅ Works / ❌ Failed: [explain]
```


---

## Phase 3: Organisation Testing

### 3.1 Organisation Registration

**Test Steps:**

1. **Logout from user account**
    - [ ] Find logout button
    - [ ] Confirm logout successful
    - [ ] Clear browser cookies (optional but recommended)
2. **Navigate to organisation sign-up**

```
Look for:
- "Sign Up as Organisation" link
- Account type selector during registration
- Separate organisation registration page
```

3. **Complete organisation form**
    - [ ] Organisation name field
    - [ ] Contact person details
    - [ ] Organisation email
    - [ ] ABN/ACN field (Australian Business Number)
    - [ ] Organisation type selector
    - [ ] Location/region selection
    - [ ] Terms acceptance
4. **Submit and verify**
    - [ ] Form submits successfully
    - [ ] Verification process explained (if manual approval required)
    - [ ] Confirmation email sent (check spam folder)
    - [ ] Account status clear
5. **Document findings**:

```markdown
### 3.1 Organisation Registration
**Status**: ✅ Pass / ❌ Fail

**Form Fields**:
- Organisation name: ✅/❌
- Contact details: ✅/❌
- ABN/ACN: ✅/❌
- Organisation type: ✅/❌
- Location: ✅/❌

**Submission**: ✅ Success / ❌ Failed
**Verification**: [Describe process]
**Issues**: [List any]
```


### 3.2 Organisation Login and Setup

**Test Steps:**

1. **Login as organisation**

```
URL: https://smalltalk.community/login
Use organisation test credentials
```

    - [ ] Login successful
    - [ ] Account type correctly identified
    - [ ] Redirected to organisation dashboard
2. **Complete organisation setup**
    - [ ] Setup wizard appears (if applicable)
    - [ ] Organisation profile configuration
    - [ ] Branding/logo upload
    - [ ] Colour scheme customisation
    - [ ] Settings configuration
3. **Test white label features**
    - [ ] Organisation logo displays
    - [ ] Custom colours applied
    - [ ] Organisation name appears in header/footer
    - [ ] Custom domain/subdomain (if applicable)
4. **Document findings**:

```markdown
### 3.2 Organisation Login & Setup
**Login**: ✅ Success / ❌ Failed
**Setup Wizard**: ✅ Present / ❌ Not found
**Profile Config**: ✅ Complete / ❌ Issues: [list]
**White Label**: ✅ Working / ❌ Not applying: [explain]
**Logo Upload**: ✅ Works / ❌ Failed
**Custom Colors**: ✅ Applied / ❌ Not working
```


### 3.3 CommunityOS Dashboard Access

**Test Steps:**

1. **Navigate to CommunityOS**

```
URL: https://smalltalk.community/communityos
OR find "CommunityOS" or "Dashboard" in organisation menu
```

2. **Verify dashboard loads**
    - [ ] Dashboard page accessible
    - [ ] White label branding visible
    - [ ] Organisation name/logo displays
    - [ ] Custom colours applied (if set)
    - [ ] Layout renders correctly
    - [ ] No console errors
3. **Check dashboard widgets**
    - [ ] All widgets load
    - [ ] Analytics/metrics display (even if empty)
    - [ ] Quick actions available
    - [ ] App icons/cards visible
    - [ ] Responsive design works
4. **Document findings**:

```markdown
### 3.3 CommunityOS Dashboard
**Access**: ✅ Granted / ❌ Denied: [error]
**White Label**: ✅ Active / ❌ Not applied
**Branding**: ✅ Displays correctly / ❌ Issues: [list]
**Layout**: ✅ Complete / ❌ Broken: [describe]
**Console Errors**: ✅ None / ❌ [paste errors]
```


### 3.4 CommunityOS Apps Testing (All 19 Apps)

**Critical**: Test EVERY app systematically. Do not skip any app.

**Expected CommunityOS Apps:**

Based on repository structure, the 19 apps should be:

1. CRM (Customer Relationship Management)
2. Assets Management
3. Financial Management
4. Governance
5. HR (Human Resources)
6. Projects
7. Fundraising
8. Events
9. Learning/Training
10. Compliance
11. Partnerships
12. Rostering/Scheduling
13. Safeguarding
14. Inventory
15. Volunteers
16. Analytics
17. Communications
18. Reports
19. Settings

**Testing Protocol for EACH App:**

```markdown
### App #[X]: [APP_NAME]

**URL**: https://smalltalk.community/communityos/[app-slug]

#### 1. Access Test
- [ ] App icon/card visible in dashboard
- [ ] Click opens app (no 404)
- [ ] URL is correct

#### 2. Loading Test
- [ ] Page loads completely
- [ ] Loading time: [X seconds]
- [ ] No infinite loading spinners
- [ ] Layout renders correctly

#### 3. UI Completeness
- [ ] All buttons visible
- [ ] Forms display correctly
- [ ] Tables/lists render
- [ ] Icons/images load
- [ ] Navigation menu present
- [ ] Search functionality (if applicable)

#### 4. Console Check
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab for errors
- [ ] Document any errors below

**Console Errors**:
```

[Paste any errors here, or write "None"]

```

#### 5. Functionality Test
**Primary Function**: [Describe main purpose of app]
- [ ] Tested: [What you tested]
- [ ] Result: ✅ Works / ❌ Broken
- [ ] Notes: [Any observations]

**Secondary Features**:
- [ ] [Feature 1]: ✅/❌
- [ ] [Feature 2]: ✅/❌
- [ ] [Feature 3]: ✅/❌

#### 6. Data Operations (if applicable)
- [ ] Can create record
- [ ] Can view records
- [ ] Can edit record
- [ ] Can delete record
- [ ] Data persists after refresh

#### 7. Tenant Isolation
- [ ] Only organisation's data visible
- [ ] No data from other tenants shown

**Status**: ✅ Fully Functional / ⚠️ Minor Issues / ❌ Critical Failure

**Issues Found**:
[List any issues with severity: Critical/High/Medium/Low]

***
```

**Create Master Apps Table:**

After testing all apps, create this summary:

```markdown
### 3.4 CommunityOS Apps - Master Results

| # | App Name | Access | Loads | UI | Functions | Tenant Isolation | Status |
|---|----------|--------|-------|-----|-----------|------------------|--------|
| 1 | CRM | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 2 | Assets | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 3 | Financial | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 4 | Governance | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 5 | HR | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 6 | Projects | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 7 | Fundraising | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 8 | Events | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 9 | Learning | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 10 | Compliance | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 11 | Partnerships | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 12 | Rostering | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 13 | Safeguarding | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 14 | Inventory | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 15 | Volunteers | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 16 | Analytics | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 17 | Communications | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 18 | Reports | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |
| 19 | Settings | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/⚠️/❌ |

**Overall Statistics**:
- **Total Apps**: 19
- **Fully Functional**: [count]
- **Minor Issues**: [count]
- **Critical Failures**: [count]
- **Pass Rate**: [percentage]%

**Critical Issues Requiring Immediate Fix**:
1. [Issue 1]
2. [Issue 2]
...

**Apps with Minor Issues**:
1. [App name]: [Issue description]
2. [App name]: [Issue description]
...
```


### 3.5 Community Insights AI Testing

**Test Steps:**

1. **Locate AI feature**

Possible locations:

```
- https://smalltalk.community/communityos/insights
- https://smalltalk.community/communityos/analytics (AI tab)
- Dashboard widget
- Settings > AI Features
```

2. **Access AI interface**
    - [ ] AI feature is accessible
    - [ ] Interface loads correctly
    - [ ] Input field visible
    - [ ] Submit button present
    - [ ] Model information displayed (if applicable)
3. **Test AI responses**

**Test Prompt 1: Basic Query**

```
Prompt: "Provide a summary of community engagement for this organisation."

Expected: AI processes and returns relevant response
Actual: [Paste response or describe what happened]
Response Time: [X seconds]
Status: ✅ Success / ❌ Failed
```

**Test Prompt 2: Data-Specific Query**

```
Prompt: "What insights can you provide about our member demographics?"

Expected: AI references organisation data appropriately
Actual: [Paste response]
Response Time: [X seconds]
Status: ✅ Success / ❌ Failed
```

**Test Prompt 3: Error Handling**

```
Prompt: [Empty submission or special characters: @#$%^&*]

Expected: Graceful error message
Actual: [Describe behaviour]
Status: ✅ Handled / ❌ Crashed
```

4. **Evaluate AI performance**
    - [ ] Responses are relevant
    - [ ] Responses reference correct tenant data
    - [ ] No sensitive data inappropriately exposed
    - [ ] Response times acceptable (<10s)
    - [ ] Error messages are user-friendly
    - [ ] Console shows no critical errors
5. **Check SDK compliance**

Open browser console and check network requests:
    - [ ] Verify using correct Google AI SDK
    - [ ] Check for `@google/genai` imports (correct)
    - [ ] NO imports from `@google/generative-ai` (deprecated)
6. **Document findings**:

```markdown
### 3.5 Community Insights AI

**Access**:
- Location: [URL or path]
- Status: ✅ Accessible / ❌ Not found

**Interface**:
- Loads: ✅ Yes / ❌ No
- UI Complete: ✅ Yes / ❌ Missing: [list]

**Functionality**:
| Prompt Type | Response | Time | Status |
|-------------|----------|------|--------|
| Basic query | [Summary] | Xs | ✅/❌ |
| Data query | [Summary] | Xs | ✅/❌ |
| Error test | [Summary] | Xs | ✅/❌ |

**Quality Assessment**:
- Relevance: ✅ Good / ⚠️ Acceptable / ❌ Poor
- Accuracy: ✅ Good / ⚠️ Acceptable / ❌ Poor
- Speed: ✅ Fast (<5s) / ⚠️ Slow (5-10s) / ❌ Very slow (>10s)
- Error Handling: ✅ Graceful / ❌ Crashes

**SDK Compliance**:
- Using @google/genai: ✅ Yes / ❌ No (CRITICAL if No)

**Console Errors**: ✅ None / ❌ [paste errors]

**Issues**: [List any problems]
```


---

## Phase 4: Error Detection \& Fixing Protocol

### 4.1 Error Classification System

When you find an error, classify it using this severity matrix:

```markdown
## Error: [ERROR_ID] - [Brief Description]

**Severity**: [Select one]
- 🔴 **CRITICAL**: Blocks core functionality, prevents user access, security vulnerability
- 🟠 **HIGH**: Major feature broken, affects multiple users, data integrity issue
- 🟡 **MEDIUM**: Feature partially broken, workaround available, UX issue
- 🟢 **LOW**: Cosmetic issue, minor inconvenience, documentation error

**Location**: [URL or file path]
**Affected Users**: Individual / Organisation / Both
**Discovered**: Phase [X], Step [X]

### Error Details

**What Happened**:
[Clear description of the error]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behaviour**:
[What should happen]

**Actual Behaviour**:
[What actually happened]

**Console Errors**:
```

[Paste full error from browser console]

```

**Screenshots/Evidence**:
[Describe or note if captured]

**Browser**: [e.g., Chrome 120, Firefox 115]
**Device**: Desktop / Mobile / Tablet
**Viewport**: [e.g., 1920x1080]

### Root Cause Analysis

**Hypothesis**:
[Your theory about what's causing the issue]

**Relevant Files**:
- `path/to/file1.tsx`
- `path/to/file2.ts`
- `app/api/[route]/route.ts`

**Suspected Issue**:
[Technical explanation of the problem]

***
```


### 4.2 Fix Implementation Workflow

**⚠️ MANDATORY PROCESS: Follow these steps exactly**

When you identify an error:

**Step 1: STOP TESTING**

- Do not proceed to next test
- Document the error completely
- Assign ERROR_ID (e.g., ERR001, ERR002)

**Step 2: ANALYZE**

```bash
# Read relevant code standards
cat CLAUDE.md

# Check related files
# For UI issues:
ls app/[relevant-route]/
cat app/[relevant-route]/page.tsx

# For API issues:
cat app/api/[relevant-route]/route.ts

# For database issues:
cat lib/supabase.ts

# Check for similar issues
git log --grep="[related keyword]" --oneline
```

**Step 3: PROPOSE FIX**

```markdown
### Proposed Fix for [ERROR_ID]

**Root Cause**:
[Explanation of what's actually wrong]

**Solution**:
[Explanation of the fix]

**Files to Change**:
1. `path/to/file1.ts`
   - Change: [What needs to change]
   - Reason: [Why this fixes it]

2. `path/to/file2.tsx`
   - Change: [What needs to change]
   - Reason: [Why this fixes it]

**Code Changes**:
```typescript
// File: path/to/file.ts

// ❌ BEFORE (Broken):
const data = await fetchData();

// ✅ AFTER (Fixed):
const data = await fetchData().catch(error => {
  console.error('Error fetching data:', error);
  return null;
});
```

**Standards Compliance**:

- [x] Follows CLAUDE.md rules
- [x] Uses correct SDK (@google/genai)
- [x] Has proper error handling (try/catch)
- [x] Validates inputs
- [x] User-friendly error messages
- [x] No console.log in production code

**Side Effects**:
[Any other parts of the app this might affect]

```

**Step 4: IMPLEMENT FIX**

```bash
# Create fix branch
git checkout -b fix/[error-description]

# Example: git checkout -b fix/crm-app-loading-error

# Make changes to files
# Edit files using your code editor

# Test locally if possible
pnpm dev
# Test the specific functionality that was broken

# Commit with descriptive message
git add .
git commit -m "fix: [concise description of what was fixed]

Resolves [ERROR_ID]

Changes:
- [Change 1]
- [Change 2]

Root cause: [Brief explanation]
Fix: [Brief explanation]

Tested:
- [What you tested]
- [Result]

Complies with: CLAUDE.md, DEVELOPMENT_STANDARDS.md"

# Push to GitHub
git push origin fix/[error-description]
```

**Step 5: CREATE PULL REQUEST**

```markdown
### Fix: [Clear Title Describing the Fix]

**Fixes**: [ERROR_ID]
**Severity**: 🔴/🟠/🟡/🟢

#### Problem
[Clear description of the issue found during testing]

**Reproduction Steps**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What was happening]

#### Solution
[Explanation of what was changed and why it fixes the issue]

**Files Changed**:
- `path/to/file1.ts`: [What changed]
- `path/to/file2.tsx`: [What changed]

#### Testing Performed
- [x] Reproduced original error
- [x] Applied fix
- [x] Verified fix resolves issue
- [x] Tested related functionality still works
- [x] Checked for new console errors (none found)
- [x] Tested in Chrome and Firefox
- [x] Verified no regressions

#### Standards Compliance Checklist
- [x] Read CLAUDE.md before implementing
- [x] Uses @google/genai SDK (NOT @google/generative-ai)
- [x] Error handling with try/catch blocks
- [x] Input validation present
- [x] User-facing errors are friendly
- [x] No sensitive data in error messages
- [x] RLS policies respected (if database change)
- [x] No console.log() in production code
- [x] TypeScript types are correct
- [x] No security vulnerabilities introduced

#### Deployment Notes
[Any special considerations for deployment]

***
**Commit**: [commit hash]
**Branch**: fix/[error-description]
**Reviewer**: @HutchisonSorbo or CI/CD automated checks
```

**Step 6: VERIFY FIX**

After PR is merged and deployed:

```bash
# Pull latest changes
git checkout main
git pull origin main

# Clear browser cache (important!)
# Chrome: Ctrl+Shift+Delete > Clear cached images and files

# Re-test the specific functionality
# Navigate to the area that was broken
# Verify the fix works
# Check for any new errors
```

**Step 7: UPDATE TESTING LOG**

```markdown
### [ERROR_ID] - ✅ RESOLVED

**Original Issue**: [Brief description]
**Severity**: 🔴/🟠/🟡/🟢
**Discovered**: [Phase/Step]
**Fixed**: [Date/Time]

**Fix Details**:
- Commit: [hash]
- PR: [link]
- Deployed: [timestamp]

**Re-test Results**:
- [x] Original error no longer occurs
- [x] Related functionality works
- [x] No new errors introduced
- [x] Performance acceptable

**Status**: ✅ VERIFIED FIXED
```

**Step 8: RESUME TESTING**

- Return to the test you were performing
- Continue with the next item in the checklist
- Monitor for any related issues


### 4.3 Common Error Patterns \& Solutions

**Error Pattern 1: Missing UI Element (Button, Form Field, etc.)**

```markdown
**Symptoms**: Button or component not visible
**Common Causes**:
1. Conditional rendering hiding element
2. Import statement missing
3. Component not in DOM
4. CSS display: none issue

**Check**:
- Component file exists in `components/` folder
- Component is imported correctly
- No conditional logic accidentally hiding it
- CSS doesn't have display: none or visibility: hidden

**Example Fix**:
```typescript
// ❌ BEFORE: Button hidden by condition
{isAdmin && <Button>Delete</Button>}

// ✅ AFTER: Show to all users
<Button>Delete</Button>
```

```

**Error Pattern 2: API Route 404 Not Found**

```markdown
**Symptoms**: API calls return 404 errors
**Common Causes**:
1. API route file doesn't exist
2. File naming doesn't match Next.js conventions
3. Wrong HTTP method exported
4. Dynamic route mismatch

**Check**:
- File exists at `app/api/[route]/route.ts`
- File exports GET, POST, etc. handlers
- Route name matches fetch URL
- Dynamic parameters match (e.g., [id])

**Example Fix**:
```typescript
// ❌ BEFORE: Missing export
async function GET(request: Request) {
  return Response.json({ data });
}

// ✅ AFTER: Properly exported
export async function GET(request: Request) {
  return Response.json({ data });
}
```

```

**Error Pattern 3: Database Query Fails / No Data Returned**

```markdown
**Symptoms**: Queries return empty or error
**Common Causes**:
1. RLS (Row Level Security) blocking query
2. User not authenticated
3. Tenant ID not filtered
4. Wrong table name

**Check**:
- User is logged in (check auth state)
- RLS policies allow user's role to read data
- Query includes tenant filter (multi-tenant apps)
- Table name is correct in Supabase

**Example Fix**:
```typescript
// ❌ BEFORE: Missing tenant filter
const { data } = await supabase
  .from('members')
  .select('*');

// ✅ AFTER: Includes tenant isolation
const { data } = await supabase
  .from('members')
  .select('*')
  .eq('tenant_id', user.tenant_id);
```

```

**Error Pattern 4: White Label Branding Not Applying**

```markdown
**Symptoms**: Custom logo/colors not showing
**Common Causes**:
1. Organisation settings not saved
2. Context provider missing
3. CSS variables not updating
4. Cache issue

**Check**:
- Organisation metadata exists in database
- Theme/Brand context wraps components
- CSS custom properties in globals.css
- Browser cache cleared

**Example Fix**:
```typescript
// ❌ BEFORE: Hardcoded colors
<div className="bg-blue-500">

// ✅ AFTER: Uses organisation theme
<div style={{ backgroundColor: organisation.brandColor }}>
```

```

**Error Pattern 5: AI Insights Not Responding**

```markdown
**Symptoms**: AI prompts fail or timeout
**Common Causes**:
1. Wrong SDK imported (@google/generative-ai instead of @google/genai)
2. API key missing or invalid
3. Rate limiting exceeded
4. Incorrect model name

**Check**:
- Using @google/genai (CRITICAL - see CLAUDE.md)
- GOOGLE_API_KEY environment variable set in Vercel
- API endpoint has error handling
- Model name is correct (gemini-2.0-flash-exp)

**Example Fix**:
```typescript
// ❌ BEFORE: Wrong SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

// ✅ AFTER: Correct SDK
import { GoogleGenerativeAI } from '@google/genai';
```

```

---

## Phase 5: Comprehensive Testing Checklist

### 5.1 Pre-Flight Checklist

```markdown
## Pre-Flight Checklist

- [ ] Read CLAUDE.md completely
- [ ] Read DEVELOPMENT_STANDARDS.md
- [ ] TEST_RESULTS.md created
- [ ] Browser DevTools open (F12)
- [ ] Network tab monitoring enabled
- [ ] Console tab visible
- [ ] Test credentials prepared
- [ ] Git repository cloned locally
```


### 5.2 Individual User Testing Checklist

```markdown
## Individual User Tests

### Registration & Onboarding
- [ ] Sign-up page loads
- [ ] Form fields complete
- [ ] Age validation works (13+ minimum)
- [ ] DOB picker functional
- [ ] Password requirements shown
- [ ] Form submits successfully
- [ ] Appropriate redirect occurs
- [ ] No console errors

### Dashboard Access
- [ ] Login successful
- [ ] Dashboard loads
- [ ] Profile displays correctly
- [ ] Navigation menu complete
- [ ] All links work (no 404s)
- [ ] Settings accessible
- [ ] Responsive design works

### Apps Access
- [ ] Apps page loads
- [ ] All app cards display
- [ ] Each app tested individually
- [ ] No missing buttons
- [ ] Forms work correctly
- [ ] Navigation works
- [ ] No console errors on any app
```


### 5.3 Organisation Testing Checklist

```markdown
## Organisation Tests

### Registration & Setup
- [ ] Organisation sign-up found
- [ ] Registration form complete
- [ ] All fields present and functional
- [ ] Validation works
- [ ] Form submits successfully
- [ ] Login successful
- [ ] Setup wizard complete
- [ ] Profile configured

### White Label
- [ ] Logo upload works
- [ ] Custom colors apply
- [ ] Organisation name displays
- [ ] Branding visible throughout
- [ ] Custom domain works (if applicable)

### CommunityOS Dashboard
- [ ] Dashboard accessible
- [ ] White label active
- [ ] All widgets load
- [ ] Layout complete
- [ ] No console errors
```


### 5.4 CommunityOS Apps Checklist (All 19)

```markdown
## CommunityOS Apps (Complete List)

- [ ] 1. CRM - Fully tested
- [ ] 2. Assets - Fully tested
- [ ] 3. Financial - Fully tested
- [ ] 4. Governance - Fully tested
- [ ] 5. HR - Fully tested
- [ ] 6. Projects - Fully tested
- [ ] 7. Fundraising - Fully tested
- [ ] 8. Events - Fully tested
- [ ] 9. Learning - Fully tested
- [ ] 10. Compliance - Fully tested
- [ ] 11. Partnerships - Fully tested
- [ ] 12. Rostering - Fully tested
- [ ] 13. Safeguarding - Fully tested
- [ ] 14. Inventory - Fully tested
- [ ] 15. Volunteers - Fully tested
- [ ] 16. Analytics - Fully tested
- [ ] 17. Communications - Fully tested
- [ ] 18. Reports - Fully tested
- [ ] 19. Settings - Fully tested

**For EACH app above, verify**:
- [ ] App loads without errors
- [ ] UI is complete (no missing buttons)
- [ ] Primary functions work
- [ ] Data operations work (CRUD)
- [ ] Tenant data isolated
- [ ] No console errors
```


### 5.5 AI \& Advanced Features Checklist

```markdown
## AI & Advanced Features

### Community Insights AI
- [ ] AI feature located
- [ ] Interface loads
- [ ] Input field present
- [ ] Submit button works
- [ ] AI responds to prompts
- [ ] Responses are relevant
- [ ] Response times acceptable
- [ ] Error handling graceful
- [ ] Using @google/genai SDK (CRITICAL)
- [ ] No inappropriate data exposure

### Performance
- [ ] Pages load quickly (<3s)
- [ ] No infinite loading states
- [ ] Forms submit promptly
- [ ] API responses timely
- [ ] Images optimised

### Security & Data
- [ ] Tenant data isolated
- [ ] Can't see other organisation's data
- [ ] RLS policies working
- [ ] Age restrictions enforced (13+)
- [ ] Authentication required
- [ ] Sessions expire appropriately
```


### 5.6 Technical Quality Checklist

```markdown
## Technical Quality

### Console Errors
- [ ] No errors on homepage
- [ ] No errors on user dashboard
- [ ] No errors on apps pages
- [ ] No errors on org dashboard
- [ ] No errors on any CommunityOS app
- [ ] No errors in AI features

### Navigation
- [ ] All menu items work
- [ ] No broken links (404s)
- [ ] Back button works
- [ ] Breadcrumbs work (if present)
- [ ] External links open correctly

### Forms & Input
- [ ] All forms validate input
- [ ] Error messages are clear
- [ ] Success messages display
- [ ] Required fields marked
- [ ] Help text present
- [ ] Submission works

### Responsive Design
- [ ] Desktop view (1920x1080) works
- [ ] Tablet view (768x1024) works
- [ ] Mobile view (375x667) works
- [ ] No horizontal scrolling
- [ ] Touch targets adequate (mobile)
```


---

## Phase 6: Final Reporting

### 6.1 Executive Summary Template

```markdown
# smalltalk.community - Testing Report
**Final Summary**

***

## Overview

**Date**: 17 January 2026
**Tester**: AI Agent
**Environment**: Production (https://smalltalk.community)
**Duration**: [X hours]
**Contact**: smalltalkcommunity.backup@gmail.com

***

## Test Accounts Created

- **Individual User**: [email@smalltalk.test]
  - Status: ✅ Active / ❌ Issues
  - Age Cohort: Adult
  - Access Level: Standard user
  
- **Organisation**: [Test Organisation Name]
  - Contact: [email@smalltalk.test]
  - Status: ✅ Active / ❌ Issues
  - White Label: ✅ Applied / ❌ Not working

***

## Test Results Summary

### Overall Statistics

- **Total Tests Performed**: [count]
- **Tests Passed**: [count] ([percentage]%)
- **Tests Failed**: [count] ([percentage]%)
- **Issues Found**: [count]
- **Issues Fixed**: [count]
- **Issues Remaining**: [count]

### Severity Breakdown

| Severity | Count | Fixed | Remaining |
|----------|-------|-------|-----------|
| 🔴 Critical | [X] | [X] | [X] |
| 🟠 High | [X] | [X] | [X] |
| 🟡 Medium | [X] | [X] | [X] |
| 🟢 Low | [X] | [X] | [X] |

***

## Phase Results

### Phase 2: Individual User Testing
**Status**: ✅ Pass / ⚠️ Issues Found / ❌ Fail

- Registration: ✅/❌
- Login: ✅/❌
- Dashboard: ✅/❌
- Apps ([X]/[Y] working): ⚠️/✅/❌

**Critical Issues**: [count]
**Details**: See Section 6.2

### Phase 3: Organisation Testing
**Status**: ✅ Pass / ⚠️ Issues Found / ❌ Fail

- Registration: ✅/❌
- Setup: ✅/❌
- White Label: ✅/❌
- CommunityOS Access: ✅/❌
- Apps ([X]/19 working): ⚠️/✅/❌
- AI Insights: ✅/❌

**Critical Issues**: [count]
**Details**: See Section 6.3

***

## Key Findings

### ✅ Working Features (Strengths)

1. [Feature 1]: [Brief description of what works well]
2. [Feature 2]: [Brief description of what works well]
3. [Feature 3]: [Brief description of what works well]
...

### ❌ Issues Found (Weaknesses)

[List all issues discovered, grouped by severity]

#### 🔴 Critical Issues

1. **[ERROR_ID]**: [Brief description]
   - **Impact**: [What this breaks]
   - **Status**: ✅ Fixed / 🔧 In Progress / ❌ Open
   - **PR/Commit**: [link if fixed]

2. **[ERROR_ID]**: [Brief description]
   - **Impact**: [What this breaks]
   - **Status**: ✅ Fixed / 🔧 In Progress / ❌ Open
   - **PR/Commit**: [link if fixed]

#### 🟠 High Priority Issues

1. **[ERROR_ID]**: [Brief description]
   - **Impact**: [What this affects]
   - **Status**: ✅ Fixed / 🔧 In Progress / ❌ Open
   - **PR/Commit**: [link if fixed]

#### 🟡 Medium Priority Issues

[List issues]

#### 🟢 Low Priority / Cosmetic Issues

[List issues]

***

## Fixes Applied

### Total Commits: [X]
### Total PRs: [X]

| Commit | Description | Files Changed | Issue Fixed |
|--------|-------------|---------------|-------------|
| [hash] | [description] | [count] | [ERROR_ID] |
| [hash] | [description] | [count] | [ERROR_ID] |
...

### Example Fix Details

**Fix #1: [ERROR_ID]**
- **Problem**: [What was broken]
- **Solution**: [What was changed]
- **Files Modified**: [list]
- **Testing**: [Verified working]
- **Commit**: [link]

***

## CommunityOS Apps Status

| # | App Name | Status | Notes |
|---|----------|--------|-------|
| 1 | CRM | ✅/⚠️/❌ | [Issues if any] |
| 2 | Assets | ✅/⚠️/❌ | [Issues if any] |
| 3 | Financial | ✅/⚠️/❌ | [Issues if any] |
| 4 | Governance | ✅/⚠️/❌ | [Issues if any] |
| 5 | HR | ✅/⚠️/❌ | [Issues if any] |
| 6 | Projects | ✅/⚠️/❌ | [Issues if any] |
| 7 | Fundraising | ✅/⚠️/❌ | [Issues if any] |
| 8 | Events | ✅/⚠️/❌ | [Issues if any] |
| 9 | Learning | ✅/⚠️/❌ | [Issues if any] |
| 10 | Compliance | ✅/⚠️/❌ | [Issues if any] |
| 11 | Partnerships | ✅/⚠️/❌ | [Issues if any] |
| 12 | Rostering | ✅/⚠️/❌ | [Issues if any] |
| 13 | Safeguarding | ✅/⚠️/❌ | [Issues if any] |
| 14 | Inventory | ✅/⚠️/❌ | [Issues if any] |
| 15 | Volunteers | ✅/⚠️/❌ | [Issues if any] |
| 16 | Analytics | ✅/⚠️/❌ | [Issues if any] |
| 17 | Communications | ✅/⚠️/❌ | [Issues if any] |
| 18 | Reports | ✅/⚠️/❌ | [Issues if any] |
| 19 | Settings | ✅/⚠️/❌ | [Issues if any] |

**Apps Fully Functional**: [X]/19 ([percentage]%)

***

## Recommendations

### 🚨 Immediate Actions Required (Critical)

1. **[Action 1]**: [Description]
   - **Why**: [Impact if not addressed]
   - **Estimated Effort**: [Hours/Days]
   
2. **[Action 2]**: [Description]
   - **Why**: [Impact if not addressed]
   - **Estimated Effort**: [Hours/Days]

### ⚠️ Short-term Improvements (High Priority)

1. [Improvement 1]
2. [Improvement 2]
3. [Improvement 3]

### 💡 Long-term Enhancements (Nice to Have)

1. [Enhancement 1]
2. [Enhancement 2]
3. [Enhancement 3]

### ✨ Additional Suggestions

- [Suggestion 1]
- [Suggestion 2]
- [Suggestion 3]

***

## Standards Compliance

### CLAUDE.md Compliance
- [x] Using @google/genai SDK (NOT @google/generative-ai)
- [x] Age minimum enforced (13+)
- [x] RLS enabled on database tables
- [x] Input validation present
- [x] Error handling implemented
- [x] Environment variables secured

### Code Quality
- [x] No console.log in production
- [x] TypeScript types correct
- [x] Error messages user-friendly
- [x] No hardcoded secrets
- [x] Proper async/await usage

***

## Testing Coverage

### User Flows Tested
- [x] Individual registration and onboarding
- [x] Organisation registration and setup
- [x] User dashboard access
- [x] Organisation dashboard access
- [x] Public apps functionality
- [x] CommunityOS apps functionality
- [x] AI Insights feature
- [x] White label branding
- [x] Authentication flows
- [x] Error scenarios

### Browser Compatibility
- [x] Chrome (latest)
- [ ] Firefox (latest) - [If not tested, note here]
- [ ] Safari (latest) - [If not tested, note here]
- [ ] Edge (latest) - [If not tested, note here]
- [ ] Mobile browsers - [If not tested, note here]

***

## Appendices

### Appendix A: Test Credentials

**⚠️ Store securely - for internal use only**

```

Individual User:

- Email: [email]
- Password: [password]
- DOB: 2005-06-15
- Location: Kilmore, VIC 3757

Organisation:

- Name: [organisation name]
- Email: [email]
- Password: [password]
- Contact: Test Org Admin

```

### Appendix B: Console Errors Log

[Compile all unique console errors encountered]

```

Error 1:
[Paste error message]
Location: [URL]
Frequency: [How often it occurred]

Error 2:
[Paste error message]
Location: [URL]
Frequency: [How often it occurred]
...

```

### Appendix C: Performance Observations

[Any performance metrics collected]

- Homepage load time: [X seconds]
- Dashboard load time: [X seconds]
- AI response time: [X seconds]
- App load times: [X seconds average]

### Appendix D: Screenshots

[Reference any screenshots captured]

- Homepage: [filename or description]
- User dashboard: [filename or description]
- Org dashboard: [filename or description]
- Errors: [filename or description]

***

## Conclusion

[2-3 paragraphs summarising:
- Overall quality of the platform
- Readiness for production use
- Most critical issues
- Confidence in platform stability
- Next steps recommended]

***

## Sign-off

**Tested by**: AI Agent
**Reviewed by**: [To be filled]
**Date**: 17 January 2026
**Report Version**: 1.0

**Contact for Questions**:
- Primary: smalltalkcommunity.backup@gmail.com
- Repository: https://github.com/HutchisonSorbo/smalltalk.community

***

*End of Report*
```


### 6.2 GitHub Issues Template

For any **unfixed critical or high-priority issues**, create GitHub issues:

```markdown
***
**Title**: [Component/Feature]: [Clear description of issue]
**Labels**: `bug`, `testing`, `priority-[critical/high/medium/low]`
**Assignees**: @HutchisonSorbo
***

## Issue Description

During comprehensive production testing, the following issue was identified:

**Severity**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Environment**:
- URL: [specific page URL]
- User Type: Individual / Organisation / Both
- Browser: [name and version]
- Device: Desktop / Mobile / Tablet
- Viewport: [e.g., 1920x1080]

***

## Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]

***

## Expected Behaviour

[Clear description of what should happen]

***

## Actual Behaviour

[Clear description of what actually happens]

***

## Console Errors

```

[Paste full console error output]

```

***

## Screenshots

[Attach or describe screenshots if available]

***

## Impact Assessment

**Affected Users**: [Individual / Organisation / Both]
**Workaround Available**: [Yes/No - describe if yes]
**Blocks**: [What functionality this prevents]

***

## Root Cause Analysis

**Hypothesis**: [Your theory about what's causing the issue]

**Suspected Files**:
- `path/to/file1.tsx`
- `path/to/file2.ts`

**Related Code**:
```typescript
[Paste relevant code snippet if known]
```


***

## Suggested Fix

[If you have a proposed solution, describe it here]

**Files to Change**:

- [file 1]: [what to change]
- [file 2]: [what to change]

**Implementation Notes**:
[Any technical considerations]

***

## Testing Checklist

Once fixed, verify:

- [ ] Original error no longer occurs
- [ ] Related functionality still works
- [ ] No new console errors
- [ ] Fix complies with CLAUDE.md standards
- [ ] Tested in multiple browsers
- [ ] No regressions introduced

***

## Related

**Discovered in**: Production testing session, [date]
**Test Report**: See TEST_RESULTS.md
**Related Issues**: [Link to any related issues]

***

**Reported by**: AI Agent (Automated Testing)
**Contact**: smalltalkcommunity.backup@gmail.com

```

---

## Phase 7: Success Criteria

### 7.1 Testing Mission Complete When:

```markdown
## Mission Success Criteria

### Core Requirements (MUST ALL PASS)

- [ ] Both test accounts created successfully
- [ ] Individual user can register, login, and access dashboard
- [ ] Organisation can register, login, and access CommunityOS
- [ ] All public-facing apps load without critical errors
- [ ] At least 15/19 CommunityOS apps fully functional
- [ ] Community Insights AI responds to prompts
- [ ] White label branding applies correctly
- [ ] No critical security vulnerabilities found
- [ ] Age validation enforces 13+ minimum
- [ ] RLS policies prevent cross-tenant data access

### Quality Standards (TARGET)

- [ ] 90%+ of features working correctly
- [ ] All critical issues fixed
- [ ] All high-priority issues have PRs
- [ ] Console errors addressed
- [ ] User experience is smooth
- [ ] Performance acceptable (<3s page loads)

### Documentation Requirements

- [ ] TEST_RESULTS.md complete and detailed
- [ ] All errors documented with ERROR_IDs
- [ ] All fixes have commit messages and PRs
- [ ] Final summary report generated
- [ ] GitHub issues created for remaining problems
- [ ] Test credentials recorded securely

### Code Quality Maintained

- [ ] All fixes follow CLAUDE.md standards
- [ ] Using @google/genai SDK (NOT deprecated package)
- [ ] Proper error handling implemented
- [ ] Input validation present
- [ ] No security vulnerabilities introduced
- [ ] No console.log() in production code
- [ ] TypeScript has no errors
```


### 7.2 Emergency Stop Conditions

**⚠️ STOP TESTING IMMEDIATELY if you encounter:**

1. **Data Loss**: Any action that deletes or corrupts production data
    - Document immediately
    - Do NOT attempt to fix
    - Create CRITICAL GitHub issue
    - Email smalltalkcommunity.backup@gmail.com
2. **Security Breach**: Ability to access other users' data inappropriately
    - Document the exact vulnerability
    - Create CRITICAL GitHub issue
    - Email smalltalkcommunity.backup@gmail.com
    - Do NOT publicise the vulnerability
3. **Complete System Failure**: Entire platform becomes inaccessible
    - Check if it's a deployment issue
    - Document the trigger
    - Email smalltalkcommunity.backup@gmail.com
4. **Authentication Bypass**: Ability to access features without login
    - Document the bypass method
    - Create CRITICAL security issue
    - Email smalltalkcommunity.backup@gmail.com
5. **PII (Personal Information) Exposure**: Sensitive data displayed inappropriately
    - Document exactly what data is exposed
    - Create CRITICAL privacy issue
    - Email smalltalkcommunity.backup@gmail.com

**In ALL emergency cases:**

- Stop testing immediately
- Document exact steps that led to the issue
- Create a CRITICAL severity GitHub issue
- Email: smalltalkcommunity.backup@gmail.com with subject "CRITICAL: [brief description]"
- Do NOT attempt to fix without explicit approval
- Do NOT continue testing until issue is resolved

---

## Phase 8: Tools \& Resources

### 8.1 Development Tools

**GitHub Repository**:

- URL: https://github.com/HutchisonSorbo/smalltalk.community
- Branch: main (production)
- For fixes: Create feature branches (fix/[description])

**Browser Developer Tools**:

- Open: Press F12 in Chrome/Firefox/Edge
- Console tab: For JavaScript errors
- Network tab: For API call monitoring
- Elements tab: For inspecting HTML/CSS

**Local Development**:

```bash
# If testing locally
pnpm install
pnpm dev
# Opens on http://localhost:3000
```


### 8.2 Key Documentation

**Primary Reference**:

- **CLAUDE.md** - Essential AI agent rules (READ FIRST)
- **DEVELOPMENT_STANDARDS.md** - Complete technical standards
- **INCIDENT_RESPONSE.md** - Incident handling procedures

**Repository Structure**:

```
smalltalk.community/
├── app/                  # Next.js app directory
│   ├── (payload)/       # CMS routes
│   ├── api/             # API routes
│   ├── apps/            # Public-facing apps
│   ├── auth/            # Authentication pages
│   ├── communityos/     # Organisation dashboard
│   ├── dashboard/       # User dashboard
│   └── onboarding/      # Onboarding flows
├── components/          # React components
├── lib/                 # Utilities and configurations
├── public/              # Static assets
├── CLAUDE.md           # ⭐ AI agent rules
├── DEVELOPMENT_STANDARDS.md  # Technical standards
└── package.json        # Dependencies
```


### 8.3 Testing Utilities

**Check Current Deployment**:

```bash
curl -I https://smalltalk.community
# Should return 200 OK
```

**Test API Endpoint**:

```bash
curl -X POST https://smalltalk.community/api/[endpoint] \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Check Console for Errors**:

```javascript
// In browser console, paste this to see all errors:
console.log('Monitoring console for errors...');
window.addEventListener('error', (e) => {
  console.error('ERROR:', e.message, e.filename, e.lineno);
});
```


### 8.4 Contact Information

**Primary Contact**:

- Email: smalltalkcommunity.backup@gmail.com
- Subject: "Testing Report - [Date]"

**For Emergencies**:

- Subject: "CRITICAL: [Brief Description]"
- Include: ERROR_ID, reproduction steps, impact

**Repository Maintainer**:

- GitHub: @HutchisonSorbo
- For PR reviews and approvals

---

## Phase 9: Best Practices \& Guidelines

### 9.1 Testing Mindset

**Be Systematic**:

- Follow the protocol in order
- Don't skip steps even if things seem fine
- Document as you go, not after

**Be Thorough**:

- Test every feature completely
- Try edge cases (empty inputs, long text, special characters)
- Verify both success and error scenarios

**Be Objective**:

- Report what you observe, not what you expect
- Don't assume something works without testing
- Document both good and bad findings

**Be Constructive**:

- Suggest fixes, not just problems
- Explain why something is an issue
- Prioritise issues by severity


### 9.2 Documentation Standards

**Clear Language**:

- Use simple, precise descriptions
- Avoid ambiguous terms like "doesn't work" (be specific)
- Include exact error messages

**Complete Information**:

- Always include URLs or file paths
- Paste full console errors
- Note browser and viewport size
- Timestamp all entries

**Structured Format**:

- Use markdown formatting (headers, lists, code blocks)
- Use checkboxes for tracking (- [ ])
- Use tables for comparing multiple items
- Use severity emojis (🔴🟠🟡🟢) for quick scanning


### 9.3 Code Standards Compliance

Before committing ANY fix, verify:

```markdown
## Pre-Commit Checklist

- [ ] Read CLAUDE.md completely
- [ ] Code follows TypeScript standards
- [ ] Using @google/genai SDK (NOT @google/generative-ai)
- [ ] Error handling with try/catch blocks
- [ ] Input validation present (Zod schemas)
- [ ] User-facing error messages are friendly
- [ ] No sensitive data in error messages
- [ ] No console.log() in production code
- [ ] Environment variables used for secrets
- [ ] RLS policies respected (database)
- [ ] No security vulnerabilities introduced
- [ ] Australian English spelling used
- [ ] Comments explain WHY, not WHAT
```


### 9.4 Communication Protocol

**Regular Updates**:

- Commit to `TEST_RESULTS.md` frequently
- Push updates every 1-2 hours
- Tag commits with `[TEST]` prefix

**Clear Commit Messages**:

```bash
# Format:
[TEST] phase-X: Brief description of progress

# Examples:
git commit -m "[TEST] phase-2: Completed user registration testing - all passing"
git commit -m "[TEST] phase-3: Found 3 issues in CRM app - documented as ERR001-003"
git commit -m "[TEST] phase-4: Fixed ERR001 - missing submit button in member form"
```

**Issue References**:

- Always reference ERROR_IDs in commits
- Link commits to PRs
- Cross-reference related issues


### 9.5 Edge Cases \& Special Scenarios

Don't forget to test:

```markdown
## Edge Cases Checklist

### Input Validation
- [ ] Empty form submissions
- [ ] Maximum character lengths exceeded
- [ ] Special characters (@#$%^&*)
- [ ] SQL injection attempts (', --, OR 1=1)
```

- [ ] XSS attempts (<script>alert('xss')</script>)

```
- [ ] Invalid email formats
- [ ] Phone numbers with various formats

### Date & Time
- [ ] Past dates where future expected
- [ ] Future dates where past expected
- [ ] Date of birth resulting in age <13 (should be rejected)
- [ ] Leap year dates (Feb 29)
- [ ] Invalid dates (Feb 31, Month 13)

### User Interactions
- [ ] Double-clicking submit buttons
- [ ] Browser back button after submission
- [ ] Multiple browser tabs with same account
- [ ] Rapid form submissions (rate limiting)
- [ ] Session timeout during form completion

### File Operations (if applicable)
- [ ] Very large files (>10MB)
- [ ] Invalid file types
- [ ] Empty files (0 bytes)
- [ ] Files with no extensions
- [ ] Files with special characters in names

### Network Conditions
- [ ] Slow connection simulation
- [ ] Network disconnection mid-operation
- [ ] Reconnection after offline period
- [ ] API timeout handling

### Display & UI
- [ ] Very long text (truncation)
- [ ] Empty states (no data to display)
- [ ] Loading states
- [ ] Error states
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Browser zoom (50%, 100%, 150%, 200%)
```


---

## Final Notes

### For the AI Agent

This testing protocol is comprehensive and designed to ensure the smalltalk.community platform is production-ready. Your systematic approach will help identify issues before real users encounter them.

**Key Principles**:

1. **Be methodical**: Follow each phase in order
2. **Document everything**: Record both successes and failures
3. **Fix iteratively**: Fix issues as you find them, then re-test
4. **Follow standards**: Always reference CLAUDE.md before coding
5. **Communicate clearly**: Your documentation helps future testing and fixes

**Remember**:

- Every issue you find and fix improves the platform
- Clear documentation helps maintainability
- Standards compliance prevents future problems
- Thorough testing protects real users


### For Human Reviewers

This testing was performed by an AI agent following a structured protocol. When reviewing:

1. Check TEST_RESULTS.md for comprehensive findings
2. Review all PRs created during testing
3. Verify fixes comply with CLAUDE.md standards
4. Consider running additional manual tests for critical features
5. Deploy fixes in stages if many changes were made

### Success Metrics

A successful testing session includes:

- ✅ Complete documentation in TEST_RESULTS.md
- ✅ All critical issues resolved or documented
- ✅ Test accounts functional
- ✅ No security vulnerabilities introduced
- ✅ Standards compliance maintained
- ✅ Clear path forward for remaining issues

---

## Document Control

**Filename**: `AI_AGENT_TESTING_PROTOCOL.md`
**Version**: 1.0
**Created**: 17 January 2026
**Last Updated**: 17 January 2026
**Maintained by**: smalltalk.community
**Contact**: smalltalkcommunity.backup@gmail.com
**Repository**: https://github.com/HutchisonSorbo/smalltalk.community

---

**🚀 Begin testing when ready. Good luck!**

*This testing protocol ensures comprehensive coverage while maintaining code quality and security standards. Follow it systematically for best results.*

```

***

This complete `.md` document is ready to save as `AI_AGENT_TESTING_PROTOCOL.md` in your repository root. It includes all the corrections you requested:

1. ✅ Email changed to **smalltalkcommunity.backup@gmail.com** throughout
2. ✅ References **```

