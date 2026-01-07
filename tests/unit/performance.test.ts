
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseStorage } from '../../server/storage';
import { db } from '../../server/db';

// Mock the db
vi.mock('../../server/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    execute: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Performance Critical Paths', () => {
  let storage: DatabaseStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new DatabaseStorage();
  });

  describe('getAverageRating', () => {
    it('should use caching to reduce DB hits', async () => {
      // Mock the DB response
      const mockResult = [{ average: 4.5, count: 10 }];
      (db.select as any).mockImplementation(() => ({
        from: () => ({
          where: () => Promise.resolve(mockResult)
        })
      }));

      const start = performance.now();
      
      // First call - hits DB
      await storage.getAverageRating('user', '123');
      
      // Second call - should hit cache
      await storage.getAverageRating('user', '123');
      
      const end = performance.now();
      
      expect(db.select).toHaveBeenCalledTimes(1);
      console.log(`getAverageRating latency (2 calls, 1 cached): ${end - start}ms`);
    });

    it('should invalidate cache when a review is created', async () => {
      // 1. Prime the cache
      (db.select as any).mockImplementation(() => ({
        from: () => ({
          where: () => Promise.resolve([{ average: 4.5, count: 10 }])
        })
      }));
      await storage.getAverageRating('user', '123');

      // 2. Create a review (should invalidate)
      (db.insert as any).mockReturnValue({
        values: () => ({
          returning: () => Promise.resolve([{ targetType: 'user', targetId: '123' }])
        })
      });
      await storage.createReview({ targetType: 'user', targetId: '123' } as any);

      // 3. Get rating again - should trigger DB select again
      await storage.getAverageRating('user', '123');
      
      // Expect 2 selects (initial + post-invalidation)
      expect(db.select).toHaveBeenCalledTimes(2);
    });
  });

  describe('Search Optimization', () => {
    it('should construct optimized queries', async () => {
        // This test verifies the query logic doesn't crash
        // We can't easily inspect the generated SQL string without a real DB or deeper mocking
        // But we can verify it returns conditions
        
        // Access private method via casting
        const buildFilters = (storage as any)._buildMusicianFilters.bind(storage);
        
        const filters = { searchQuery: 'Guitar' };
        const conditions = buildFilters(filters);
        
        expect(conditions.length).toBeGreaterThan(0);
    });
  });
});
