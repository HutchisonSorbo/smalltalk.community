# CommunityOS Code-Based Audit Report

**Date**: 17 January 2026  
**Auditor**: AI Agent  
**Scope**: Full code analysis of CommunityOS components and potential failure points

---

## Executive Summary

CommunityOS apps are not loading in production. After comprehensive code analysis, the following **root causes** have been identified:

| Issue | Severity | Component | Impact |
|-------|----------|-----------|--------|
| Dynamic imports with SSR disabled may fail silently | High | AppContentLoader.tsx | Apps show skeleton forever |
| Tenant context may be null if DB query fails | High | tenant-context.ts | All apps fail to load |
| DittoSync uses localStorage mock (not production-ready) | Medium | useDittoSync.ts | Data not persisted properly |
| No error boundaries around app components | High | AppContentLoader.tsx | Errors crash entire page |
| Missing loading/error states for tenant fetch | Medium | TenantLayout | No feedback on failure |

---

## Detailed Findings

### 1. CRITICAL: Missing Error Boundaries in AppContentLoader

**File**: `components/communityos/AppContentLoader.tsx`

**Problem**: Dynamic imports with `ssr: false` can fail silently. If any app component throws an error during render, the entire page crashes with no fallback.

**Current Code** (lines 36-54):

```typescript
const CRMApp = dynamic(
    () => import("./apps/CRMApp").then((m) => ({ default: m.CRMApp })),
    { loading: () => <AppLoadingSkeleton />, ssr: false }
);
// ... same pattern for other apps
```

**Problem**: No error handling - if import fails or component throws, user sees permanent skeleton or crash.

**FIX REQUIRED**:

```typescript
// Add error boundary wrapper
import { ErrorBoundary } from "react-error-boundary";

function AppErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                App Failed to Load
            </h3>
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                {error.message}
            </p>
            <button
                onClick={resetErrorBoundary}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
                Try Again
            </button>
        </div>
    );
}

export function AppContentLoader({ appId }: AppContentLoaderProps): React.ReactElement | null {
    const content = (() => {
        switch (appId) {
            case "crm":
                return <CRMApp />;
            case "rostering":
                return <RosteringApp />;
            // ... other cases
        }
    })();

    return (
        <ErrorBoundary FallbackComponent={AppErrorFallback}>
            {content}
        </ErrorBoundary>
    );
}
```

---

### 2. CRITICAL: Tenant Context Failure Handling

**File**: `app/communityos/[tenantId]/layout.tsx`

**Problem**: If `getTenantByCode()` fails (DB error, network issue), tenant is null and:

- Apps try to use `tenant?.id` which becomes `undefined`
- DittoSync collection becomes `undefined:crm_contacts`
- All app data is lost/broken

**Current Code** (lines 21-24):

```typescript
const tenant = await getTenantByCode(tenantCode);
if (!tenant) {
    notFound();
}
```

**Problem**: Silent failure - no error message, just 404.

**FIX REQUIRED**:

```typescript
// Add better error handling and logging
export default async function TenantLayout({ children, params }: TenantLayoutProps) {
    const { tenantId: tenantCode } = await params;

    let tenant: Tenant | null = null;
    let fetchError: Error | null = null;

    try {
        tenant = await getTenantByCode(tenantCode);
    } catch (error) {
        fetchError = error instanceof Error ? error : new Error("Unknown error");
        console.error(`[CommunityOS] Failed to fetch tenant "${tenantCode}":`, error);
        // Log to Sentry in production
    }

    if (!tenant) {
        // Provide more helpful error page
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-red-600">
                        Organisation Not Found
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {fetchError 
                            ? "There was an error loading this organisation. Please try again later."
                            : `The organisation "${tenantCode}" could not be found.`
                        }
                    </p>
                    <a href="/dashboard" className="mt-4 inline-block text-primary hover:underline">
                        Return to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    // ... rest of component
}
```

---

### 3. MEDIUM: DittoSync is a Mock Implementation

**File**: `hooks/useDittoSync.ts`

**Problem**: This is a **placeholder implementation** using localStorage. It works for prototyping but:

- Data is browser-specific (no cross-device sync)
- Data can be lost on cache clear
- No real-time collaboration
- Comment on line 43: "Note: This is a placeholder implementation until Ditto SDK is integrated"

**Current Behavior**:

- Data stored in `localStorage` with key `ditto:${tenantId}:${collection}`
- If `tenantId` is undefined (from failed tenant fetch), key becomes `ditto:undefined:collection`

**FIX REQUIRED** (Short-term - add validation):

```typescript
export function useDittoSync<T extends DittoDocument>(
    optionsOrCollectionString: UseDittoSyncOptions | string
): UseDittoSyncResult<T> {
    const options: UseDittoSyncOptions = typeof optionsOrCollectionString === "string"
        ? { collection: optionsOrCollectionString, tenantId: "" }
        : optionsOrCollectionString;
    
    const { collection, tenantId } = options;
    
    // VALIDATION: Warn if tenantId is missing
    if (!tenantId && typeof optionsOrCollectionString === "object") {
        console.warn("[useDittoSync] No tenantId provided - data may not persist correctly");
    }
    
    // VALIDATION: Prevent undefined in storage key
    const safeTenantId = tenantId || "local";
    const storageKey = `ditto:${safeTenantId}:${collection}`;
    
    // ... rest of implementation
}
```

**FIX REQUIRED** (Long-term):

- Integrate actual Ditto SDK for offline-first sync
- OR use Supabase realtime for data persistence
- Add data migration from localStorage to server

---

### 4. MEDIUM: CRMApp Uses tenant?.id Unsafely

**File**: `components/communityos/apps/CRMApp.tsx`

**Problem** (line 24-25):

```typescript
const { tenant } = useTenant();
const { documents: contacts, ... } = useDittoSync<Contact>(`${tenant?.id}:crm_contacts`);
```

If `tenant` is null, this creates collection `undefined:crm_contacts`.

**FIX REQUIRED**:

```typescript
export function CRMApp() {
    const { tenant, isLoading } = useTenant();
    
    // Guard against missing tenant
    if (isLoading) {
        return <AppLoadingSkeleton />;
    }
    
    if (!tenant) {
        return (
            <div className="text-center py-12 text-red-600">
                <p>Unable to load CRM - Organisation context not available.</p>
            </div>
        );
    }
    
    const { documents: contacts, ... } = useDittoSync<Contact>(`${tenant.id}:crm_contacts`);
    // ... rest of component
}
```

**Apply same fix to**: `RosteringApp.tsx`, `InventoryApp.tsx`, `GenericCommunityApp.tsx`

---

### 5. LOW: InformationHub Uses Static Data

**File**: `components/communityos/information-hub/index.tsx`

**Problem**: `getTenantData()` only returns static data for 'stc' tenant. Other tenants get default template:

```typescript
function getTenantData(tenantCode: string): TenantData {
    if (tenantCode === "stc") {
        return stcTenantData;
    }
    return defaultTenantData;
}
```

**Impact**: Low - this is expected behavior for demo but should be documented.

---

### 6. LOW: CommunityInsightsAI External API Dependency

**File**: `components/communityos/CommunityInsightsAI.tsx`

**Problem**: Calls `/api/community-insights` endpoint. If that API fails:

- No specific error handling for API failures
- May show generic error or hang

**FIX RECOMMENDED**: Add timeout and specific error states.

---

## Implementation Priority

### Immediate Fixes (Deploy ASAP)

1. **Add Error Boundaries** to `AppContentLoader.tsx`
   - ~30 lines of code
   - Prevents entire page crashes

2. **Add null guards** to all app components (CRMApp, RosteringApp, etc.)
   - ~10 lines per file
   - Prevents undefined collection keys

3. **Improve TenantLayout error handling**
   - ~20 lines of code
   - Shows helpful error instead of 404

### Short-term Fixes (Next Sprint)

1. **Add tenantId validation** to `useDittoSync`
2. **Add loading states** to TenantProvider

### Long-term (Roadmap)

1. **Replace localStorage mock** with Supabase or Ditto SDK
2. **Add comprehensive error logging** with Sentry integration

---

## Files Requiring Changes

| File | Changes Required | Priority |
|------|------------------|----------|
| `components/communityos/AppContentLoader.tsx` | Add ErrorBoundary | Critical |
| `components/communityos/apps/CRMApp.tsx` | Add tenant null check | Critical |
| `components/communityos/apps/RosteringApp.tsx` | Add tenant null check | Critical |
| `components/communityos/apps/InventoryApp.tsx` | Add tenant null check | Critical |
| `components/communityos/apps/GenericCommunityApp.tsx` | Add tenant null check | Critical |
| `app/communityos/[tenantId]/layout.tsx` | Improve error handling | High |
| `hooks/useDittoSync.ts` | Add tenantId validation | Medium |

---

## Testing Checklist

After implementing fixes:

- [ ] Navigate to `/communityos/stc/dashboard` - should load
- [ ] Navigate to `/communityos/invalid/dashboard` - should show helpful error
- [ ] Click any app tile - should load or show error gracefully
- [ ] Add/edit data in CRM - should persist (localStorage)
- [ ] Refresh page - data should still be there
- [ ] Clear browser cache - expected: data lost (until Ditto integrated)

---

*Report generated: 17 January 2026 20:35 AEDT*
