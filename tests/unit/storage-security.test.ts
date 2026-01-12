
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to create the mock object so it's available for the factory
const { mockDb } = vi.hoisted(() => {
  return {
    mockDb: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    }
  };
});

// Mock the dependencies
vi.mock('@/server/db', () => ({
  db: mockDb
}));

// Import storage after mocking
import { storage } from '@/server/storage';

describe('Storage Security - Wildcard Injection', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should escape wildcards in getBands search query', async () => {
    const searchQuery = '100%';

    // @ts-ignore
    const spy = vi.spyOn(storage, '_escapeLikeString');

    await storage.getBands({ searchQuery });

    // This expects the spy to be called.
    // If the vulnerability exists, this will FAIL.
    expect(spy).toHaveBeenCalledWith(searchQuery);
  });

  it('should escape wildcards in getBands location filter', async () => {
      const location = 'New York%';
      // @ts-ignore
      const spy = vi.spyOn(storage, '_escapeLikeString');

      await storage.getBands({ location });

      expect(spy).toHaveBeenCalledWith(location);
  });

  it('should escape wildcards in getGigs search query', async () => {
    const searchQuery = 'Rock_n_Roll';
    // @ts-ignore
    const spy = vi.spyOn(storage, '_escapeLikeString');

    await storage.getGigs({ searchQuery });

    expect(spy).toHaveBeenCalledWith(searchQuery);
  });

  it('should escape wildcards in getGigs location filter', async () => {
    const location = 'London_';
    // @ts-ignore
    const spy = vi.spyOn(storage, '_escapeLikeString');

    await storage.getGigs({ location });

    expect(spy).toHaveBeenCalledWith(location);
  });

  it('should escape wildcards in getProfessionalProfiles search query', async () => {
    const searchQuery = 'Tech_Support';
    // @ts-ignore
    const spy = vi.spyOn(storage, '_escapeLikeString');

    await storage.getProfessionalProfiles({ searchQuery });

    expect(spy).toHaveBeenCalledWith(searchQuery);
  });

  it('should escape wildcards in getProfessionalProfiles location filter', async () => {
    const location = 'Remote%';
    // @ts-ignore
    const spy = vi.spyOn(storage, '_escapeLikeString');

    await storage.getProfessionalProfiles({ location });

    expect(spy).toHaveBeenCalledWith(location);
  });

  it('should escape wildcards in getClassifieds search query', async () => {
      const searchQuery = 'Guitar%';
      // @ts-ignore
      const spy = vi.spyOn(storage, '_escapeLikeString');

      // Note: getClassifieds uses filter.location which is the one that needs escaping
      await storage.getClassifieds({ location: searchQuery });

      expect(spy).toHaveBeenCalledWith(searchQuery);
  });

});
