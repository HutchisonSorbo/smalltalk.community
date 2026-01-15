/**
 * Ditto Sync Conflict Resolution and Data Merging Utilities
 */

/**
 * Interface for a document with an optional updatedAt field.
 */
interface Syncable {
    updatedAt?: string | number | Date;
    [key: string]: any;
}

/**
 * Resolves conflicts between a local and remote document using Last-Write-Wins (LWW).
 * Validates parseable updatedAt values and handles invalid inputs gracefully.
 * 
 * @template T - The type of the document.
 * @param {T} local - The local version of the document.
 * @param {T} remote - The remote version of the document.
 * @returns {T} The winning document.
 * @throws {Error} If local or remote are not objects.
 */
export function resolveConflict<T extends Syncable>(local: T, remote: T): T {
    if (typeof local !== 'object' || local === null || typeof remote !== 'object' || remote === null) {
        throw new Error("Invalid inputs: local and remote must be objects");
    }

    const localUpdated = new Date(local.updatedAt || 0).getTime();
    const remoteUpdated = new Date(remote.updatedAt || 0).getTime();

    // If both are invalid/missing, prefer remote as a predictable fallback
    if (isNaN(localUpdated) && isNaN(remoteUpdated)) return remote;
    if (isNaN(localUpdated)) return remote;
    if (isNaN(remoteUpdated)) return local;

    return remoteUpdated >= localUpdated ? remote : local;
}

/**
 * Merges member data from local and remote sources.
 * Remote fields override local fields, except for the 'skills' array which is unioned and deduplicated.
 * 
 * @template T - An object type that may contain a 'skills' array.
 * @param {T} local - The local data.
 * @param {Partial<T>} remote - The remote updates.
 * @returns {T} The merged data.
 */
export function mergeMemberData<T extends { skills?: string[] } & Record<string, any>>(local: T, remote: Partial<T>): T {
    const merged = { ...local, ...remote };

    if (local.skills && remote.skills) {
        merged.skills = [...new Set([...local.skills, ...remote.skills])];
    }

    return merged;
}
