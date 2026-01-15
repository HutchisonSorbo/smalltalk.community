import { describe, it, expect } from 'vitest';
import { validateTenantAccess } from '@/lib/tenant';

describe('Tenant Isolation', () => {
    it('prevents cross-tenant access', () => {
        expect(() => validateTenantAccess('tenant-a', 'tenant-b')).toThrow(/denied/);
    });

    it('allows same-tenant access', () => {
        expect(() => validateTenantAccess('tenant-a', 'tenant-a')).not.toThrow();
    });

    it('rejects invalid inputs', () => {
        expect(() => validateTenantAccess('', 'tenant-b')).toThrow(/Invalid/);
        expect(() => validateTenantAccess('tenant-a', '')).toThrow(/Invalid/);
        expect(() => validateTenantAccess('   ', 'tenant-b')).toThrow(/Invalid/);
    });

    it('is case-sensitive', () => {
        expect(() => validateTenantAccess('Tenant-A', 'tenant-a')).toThrow(/denied/);
    });
});
