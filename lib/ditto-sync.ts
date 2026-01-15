/**
 * Ditto Sync Conflict Resolution Utilities
 */

export function resolveConflict(local: any, remote: any): any {
    const localUpdated = new Date(local.updatedAt || 0).getTime();
    const remoteUpdated = new Date(remote.updatedAt || 0).getTime();
    return remoteUpdated >= localUpdated ? remote : local;
}

export function mergeMemberData(local: any, remote: any): any {
    const merged = { ...local, ...remote };
    if (local.skills && remote.skills) {
        merged.skills = [...new Set([...local.skills, ...remote.skills])];
    }
    return merged;
}
