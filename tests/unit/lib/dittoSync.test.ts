import { describe, it, expect } from 'vitest';
import { resolveConflict, mergeMemberData } from '@/lib/dittoSync';

describe('dittoSync Utilities', () => {
    describe('resolveConflict', () => {
        it('resolves using Last-Write-Wins', () => {
            const local = { id: '1', updatedAt: '2026-01-01T10:00:00Z', value: 'local' };
            const remote = { id: '1', updatedAt: '2026-01-01T12:00:00Z', value: 'remote' };
            expect(resolveConflict(local, remote)).toEqual(remote);
        });

        it('returns local if newer than remote', () => {
            const local = { id: '1', updatedAt: '2026-01-02T10:00:00Z', value: 'local' };
            const remote = { id: '1', updatedAt: '2026-01-01T12:00:00Z', value: 'remote' };
            expect(resolveConflict(local, remote)).toEqual(local);
        });

        it('returns remote if timestamps are equal (convergent consistency)', () => {
            const time = '2026-01-01T10:00:00Z';
            const local = { id: '1', updatedAt: time, value: 'local' };
            const remote = { id: '1', updatedAt: time, value: 'remote' };
            expect(resolveConflict(local, remote)).toEqual(remote);
        });

        it('handles undefined/missing timestamps by preferring remote', () => {
            const local = { id: '1', value: 'local' };
            const remote = { id: '1', value: 'remote' };
            expect(resolveConflict(local, remote)).toEqual(remote);
        });

        it('handles missing local timestamp (prefers remote)', () => {
            const local = { id: '1', value: 'local' };
            const remote = { id: '1', updatedAt: '2026-01-01T12:00:00Z', value: 'remote' };
            expect(resolveConflict(local, remote)).toEqual(remote);
        });
    });

    describe('mergeMemberData', () => {
        it('merges non-array fields (remote wins)', () => {
            const local = { name: 'John', age: 30 };
            const remote = { name: 'Johnny', age: 31 };
            expect(mergeMemberData(local, remote)).toEqual({ name: 'Johnny', age: 31 });
        });

        it('deduplicates skills arrays', () => {
            const local = { skills: ['React', 'Node'] };
            const remote = { skills: ['Node', 'TypeScript'] };
            const merged = mergeMemberData(local, remote);
            expect(merged.skills).toHaveLength(3);
            expect(merged.skills).toEqual(expect.arrayContaining(['React', 'Node', 'TypeScript']));
        });

        it('handles missing/undefined skills on one side', () => {
            const local = { skills: ['React'] };
            const remote = { headline: 'Dev' }; // no skills
            const merged = mergeMemberData(local, remote);
            expect(merged.skills).toEqual(['React']);
            expect(merged.headline).toBe('Dev');
        });
    });
});
