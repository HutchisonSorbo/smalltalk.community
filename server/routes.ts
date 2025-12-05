import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMusicianProfileSchema, insertMarketplaceListingSchema } from "@shared/schema";

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ========== MUSICIAN PROFILES ==========

  // Get all musician profiles (public)
  app.get("/api/musicians", async (req, res) => {
    try {
      const profiles = await storage.getMusicianProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching musicians:", error);
      res.status(500).json({ message: "Failed to fetch musicians" });
    }
  });

  // Get musician profile by ID (public)
  app.get("/api/musicians/:id", async (req, res) => {
    try {
      const profile = await storage.getMusicianProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Musician not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching musician:", error);
      res.status(500).json({ message: "Failed to fetch musician" });
    }
  });

  // Get current user's musician profiles (protected)
  app.get("/api/my/profiles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profiles = await storage.getMusicianProfilesByUser(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Create musician profile (protected)
  app.post("/api/musicians", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertMusicianProfileSchema.safeParse({ ...req.body, userId });
      
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const profile = await storage.createMusicianProfile(parsed.data);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating musician profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  // Update musician profile (protected)
  app.put("/api/musicians/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMusicianProfile(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const parsed = insertMusicianProfileSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      // Strip userId and id to prevent ownership reassignment
      const { userId: _, id: __, ...safeData } = parsed.data as any;
      const updated = await storage.updateMusicianProfile(req.params.id, safeData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating musician profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Delete musician profile (protected)
  app.delete("/api/musicians/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMusicianProfile(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteMusicianProfile(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting musician profile:", error);
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  // ========== MARKETPLACE LISTINGS ==========

  // Get all marketplace listings (public)
  app.get("/api/marketplace", async (req, res) => {
    try {
      const listings = await storage.getMarketplaceListings();
      res.json(listings);
    } catch (error) {
      console.error("Error fetching marketplace listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // Get marketplace listing by ID (public)
  app.get("/api/marketplace/:id", async (req, res) => {
    try {
      const listing = await storage.getMarketplaceListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Get seller info
      const seller = await storage.getUser(listing.userId);
      res.json({ ...listing, seller });
    } catch (error) {
      console.error("Error fetching marketplace listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  // Get current user's marketplace listings (protected)
  app.get("/api/my/listings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listings = await storage.getMarketplaceListingsByUser(userId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // Create marketplace listing (protected)
  app.post("/api/marketplace", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertMarketplaceListingSchema.safeParse({ ...req.body, userId });
      
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const listing = await storage.createMarketplaceListing(parsed.data);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating marketplace listing:", error);
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  // Update marketplace listing (protected)
  app.put("/api/marketplace/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMarketplaceListing(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const parsed = insertMarketplaceListingSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      // Strip userId and id to prevent ownership reassignment
      const { userId: _, id: __, ...safeData } = parsed.data as any;
      const updated = await storage.updateMarketplaceListing(req.params.id, safeData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating marketplace listing:", error);
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  // Delete marketplace listing (protected)
  app.delete("/api/marketplace/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getMarketplaceListing(req.params.id);
      
      if (!existing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteMarketplaceListing(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting marketplace listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });
}
