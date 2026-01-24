/**
 * Tenant-scoped localStorage utilities
 * Prevents data leakage between tenants by namespacing all keys
 */

const NAMESPACE_PREFIX = "communityos";

/**
 * Generate a namespaced key for localStorage
 * Format: communityos:{tenantId}:{key}
 */
export function getTenantStorageKey(tenantId: string, key: string): string {
    return `${NAMESPACE_PREFIX}:${tenantId}:${key}`;
}

/**
 * Get item from tenant-scoped localStorage
 */
export function getTenantStorage<T>(tenantId: string, key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
        const namespacedKey = getTenantStorageKey(tenantId, key);
        const item = localStorage.getItem(namespacedKey);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`[TenantStorage] Error getting ${key}:`, error);
        return null;
    }
}

/**
 * Set item in tenant-scoped localStorage
 */
export function setTenantStorage<T>(tenantId: string, key: string, value: T): void {
    if (typeof window === "undefined") return;

    try {
        const namespacedKey = getTenantStorageKey(tenantId, key);
        localStorage.setItem(namespacedKey, JSON.stringify(value));
    } catch (error) {
        console.error(`[TenantStorage] Error setting ${key}:`, error);
    }
}

/**
 * Remove item from tenant-scoped localStorage
 */
export function removeTenantStorage(tenantId: string, key: string): void {
    if (typeof window === "undefined") return;

    try {
        const namespacedKey = getTenantStorageKey(tenantId, key);
        localStorage.removeItem(namespacedKey);
    } catch (error) {
        console.error(`[TenantStorage] Error removing ${key}:`, error);
    }
}

/**
 * Clear all tenant-specific localStorage data
 * Use with caution - removes all data for the tenant
 */
export function clearTenantStorage(tenantId: string): void {
    if (typeof window === "undefined") return;

    const prefix = `${NAMESPACE_PREFIX}:${tenantId}:`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log(`[TenantStorage] Cleared ${keysToRemove.length} items for tenant ${tenantId}`);
}

/**
 * Get all keys for a tenant (without the namespace prefix)
 */
export function getTenantStorageKeys(tenantId: string): string[] {
    if (typeof window === "undefined") return [];

    const prefix = `${NAMESPACE_PREFIX}:${tenantId}:`;
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
            keys.push(key.slice(prefix.length));
        }
    }

    return keys;
}

/**
 * Calculate storage usage for a tenant (in bytes)
 */
export function getTenantStorageUsage(tenantId: string): number {
    if (typeof window === "undefined") return 0;

    const prefix = `${NAMESPACE_PREFIX}:${tenantId}:`;
    let totalBytes = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
            const value = localStorage.getItem(key);
            if (value) {
                totalBytes += key.length + value.length;
            }
        }
    }

    return totalBytes;
}
