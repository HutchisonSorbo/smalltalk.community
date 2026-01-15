import { describe, it, expect } from 'vitest';
import { resolveConflict, mergeMemberData } from '@/lib/ditto-sync';

describe('Ditto Sync', () => {
    it('resolves conflicts based on updatedAt', () => {
        const local = { updatedAt: '2026-01-01' };
        const remote = { updatedAt: '2026-01-02' };
        expect(resolveConflict(local, remote)).toBe(remote);
    });

    it('merges data arrays correctly', () => {
        const local = { skills: ['coding'] };
        const remote = { skills: ['testing'] };
        const merged = mergeMemberData(local, remote);
        expect(merged.skills).toContain('coding');
        expect(merged.skills).toContain('testing');
    });
});
