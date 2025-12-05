import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import { storage, type MusicianFilters, type MarketplaceFilters } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertMusicianProfileSchema, insertMarketplaceListingSchema, insertMessageSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

const musicianFiltersSchema = z.object({
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
  availability: z.string().optional(),
  instruments: z.string().optional(),
  genres: z.string().optional(),
});

const marketplaceFiltersSchema = z.object({
  location: z.string().optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.string().refine((val) => !val || !isNaN(parseInt(val, 10)), {
    message: "minPrice must be a valid number",
  }).optional(),
  maxPrice: z.string().refine((val) => !val || !isNaN(parseInt(val, 10)), {
    message: "maxPrice must be a valid number",
  }).optional(),
});

// Allowed MIME types for image uploads
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Magic bytes for image validation
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header, WebP has WEBP after
};

function validateImageMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures = IMAGE_SIGNATURES[mimetype];
  if (!signatures) return false;
  
  for (const signature of signatures) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      if (mimetype === 'image/webp') {
        return buffer.length > 11 && 
               buffer[8] === 0x57 && // W
               buffer[9] === 0x45 && // E
               buffer[10] === 0x42 && // B
               buffer[11] === 0x50; // P
      }
      return true;
    }
  }
  return false;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'));
    }
  },
});

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

  // Get all musician profiles (public) with optional filtering
  app.get("/api/musicians", async (req, res) => {
    try {
      const parsed = musicianFiltersSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: parsed.error.errors });
      }
      
      const filters: MusicianFilters = {};
      const query = parsed.data;
      
      if (query.location) {
        filters.location = query.location;
      }
      if (query.experienceLevel) {
        filters.experienceLevel = query.experienceLevel;
      }
      if (query.availability) {
        filters.availability = query.availability;
      }
      if (query.instruments) {
        const instruments = query.instruments.split(',').filter(Boolean);
        if (instruments.length > 0) {
          filters.instruments = instruments;
        }
      }
      if (query.genres) {
        const genres = query.genres.split(',').filter(Boolean);
        if (genres.length > 0) {
          filters.genres = genres;
        }
      }

      const profiles = await storage.getMusicianProfiles(Object.keys(filters).length > 0 ? filters : undefined);
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
      
      // Get user info for messaging
      const user = await storage.getUser(profile.userId);
      res.json({ ...profile, user });
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
      console.log("Creating musician profile for user:", userId);
      console.log("Request body:", JSON.stringify(req.body));
      
      const parsed = insertMusicianProfileSchema.safeParse({ ...req.body, userId });
      
      if (!parsed.success) {
        console.log("Validation failed:", parsed.error.errors);
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      console.log("Parsed data:", JSON.stringify(parsed.data));
      const profile = await storage.createMusicianProfile(parsed.data);
      console.log("Profile created:", profile?.id);
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

  // Get all marketplace listings (public) with optional filtering
  app.get("/api/marketplace", async (req, res) => {
    try {
      const parsed = marketplaceFiltersSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: parsed.error.errors });
      }
      
      const filters: MarketplaceFilters = {};
      const query = parsed.data;
      
      if (query.location) {
        filters.location = query.location;
      }
      if (query.category) {
        const category = query.category.split(',').filter(Boolean);
        if (category.length > 0) {
          filters.category = category;
        }
      }
      if (query.condition) {
        const condition = query.condition.split(',').filter(Boolean);
        if (condition.length > 0) {
          filters.condition = condition;
        }
      }
      if (query.minPrice) {
        const minPrice = parseInt(query.minPrice, 10);
        if (!isNaN(minPrice)) {
          filters.minPrice = minPrice;
        }
      }
      if (query.maxPrice) {
        const maxPrice = parseInt(query.maxPrice, 10);
        if (!isNaN(maxPrice)) {
          filters.maxPrice = maxPrice;
        }
      }

      const listings = await storage.getMarketplaceListings(Object.keys(filters).length > 0 ? filters : undefined);
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

  // ========== MESSAGING ==========

  // Get all conversations for current user (protected)
  app.get("/api/messages/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get unread message count for current user (protected)
  app.get("/api/messages/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Get conversation with specific user (protected)
  app.get("/api/messages/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      
      // Get the other user to validate they exist
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Mark messages as read
      await storage.markMessagesAsRead(currentUserId, otherUserId);
      
      // Get all messages in conversation
      const messages = await storage.getConversation(currentUserId, otherUserId);
      
      res.json({ messages, otherUser });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Send a message (protected)
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });
      
      // Verify receiver exists
      const receiver = await storage.getUser(validatedData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      // Can't message yourself
      if (senderId === validatedData.receiverId) {
        return res.status(400).json({ message: "Cannot send message to yourself" });
      }
      
      const message = await storage.sendMessage(validatedData);
      res.status(201).json(message);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const firstError = error.errors?.[0]?.message || "Invalid message data";
        return res.status(400).json({ message: firstError });
      }
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ========== REVIEWS ==========

  // Get reviews for a target (musician profile or marketplace listing)
  app.get("/api/reviews/:targetType/:targetId", async (req, res) => {
    try {
      const { targetType, targetId } = req.params;
      
      if (!["musician", "listing"].includes(targetType)) {
        return res.status(400).json({ message: "Invalid target type. Must be 'musician' or 'listing'" });
      }
      
      const reviews = await storage.getReviewsForTarget(targetType, targetId);
      const { average, count } = await storage.getAverageRating(targetType, targetId);
      
      res.json({ reviews, average, count });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get average rating for a target
  app.get("/api/reviews/:targetType/:targetId/rating", async (req, res) => {
    try {
      const { targetType, targetId } = req.params;
      
      if (!["musician", "listing"].includes(targetType)) {
        return res.status(400).json({ message: "Invalid target type" });
      }
      
      const { average, count } = await storage.getAverageRating(targetType, targetId);
      res.json({ average, count });
    } catch (error) {
      console.error("Error fetching rating:", error);
      res.status(500).json({ message: "Failed to fetch rating" });
    }
  });

  // Check if current user has reviewed a target
  app.get("/api/reviews/:targetType/:targetId/check", isAuthenticated, async (req: any, res) => {
    try {
      const { targetType, targetId } = req.params;
      const userId = req.user.claims.sub;
      
      if (!["musician", "listing"].includes(targetType)) {
        return res.status(400).json({ message: "Invalid target type" });
      }
      
      const hasReviewed = await storage.hasUserReviewed(userId, targetType, targetId);
      res.json({ hasReviewed });
    } catch (error) {
      console.error("Error checking review:", error);
      res.status(500).json({ message: "Failed to check review status" });
    }
  });

  // Create a new review (protected)
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user.claims.sub;
      const { targetType, targetId, rating, comment } = req.body;
      
      if (!["musician", "listing"].includes(targetType)) {
        return res.status(400).json({ message: "Invalid target type. Must be 'musician' or 'listing'" });
      }
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      // Check if target exists
      if (targetType === "musician") {
        const profile = await storage.getMusicianProfile(targetId);
        if (!profile) {
          return res.status(404).json({ message: "Musician profile not found" });
        }
        // Can't review your own profile
        if (profile.userId === reviewerId) {
          return res.status(400).json({ message: "Cannot review your own profile" });
        }
      } else {
        const listing = await storage.getMarketplaceListing(targetId);
        if (!listing) {
          return res.status(404).json({ message: "Marketplace listing not found" });
        }
        // Can't review your own listing
        if (listing.userId === reviewerId) {
          return res.status(400).json({ message: "Cannot review your own listing" });
        }
      }
      
      // Check if user already reviewed this target
      const hasReviewed = await storage.hasUserReviewed(reviewerId, targetType, targetId);
      if (hasReviewed) {
        return res.status(400).json({ message: "You have already reviewed this" });
      }
      
      const validatedData = insertReviewSchema.parse({
        reviewerId,
        targetType,
        targetId,
        rating: parseInt(rating, 10),
        comment: comment || null,
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const firstError = error.errors?.[0]?.message || "Invalid review data";
        return res.status(400).json({ message: firstError });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Update a review (protected - only owner can update)
  app.patch("/api/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const reviewId = req.params.id;
      const userId = req.user.claims.sub;
      
      // Get existing review and verify ownership
      const existingReview = await storage.getReview(reviewId);
      
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (existingReview.reviewerId !== userId) {
        return res.status(403).json({ message: "You don't have permission to edit this review" });
      }
      
      const { rating, comment } = req.body;
      
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      const updatedReview = await storage.updateReview(reviewId, {
        rating: rating ? parseInt(rating, 10) : undefined,
        comment: comment !== undefined ? comment : undefined,
      });
      
      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Delete a review (protected - only owner can delete)
  app.delete("/api/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const reviewId = req.params.id;
      const userId = req.user.claims.sub;
      
      // Get existing review and verify ownership
      const existingReview = await storage.getReview(reviewId);
      
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      if (existingReview.reviewerId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this review" });
      }
      
      await storage.deleteReview(reviewId);
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // ========== FILE UPLOAD ==========

  // Get presigned URL for upload (protected)
  app.post("/api/objects/upload", isAuthenticated, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Direct file upload (protected) - for simpler client integration
  // Use custom wrapper to handle Multer errors properly
  app.post("/api/upload", isAuthenticated, (req: any, res, next) => {
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
          }
          return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        // Custom error from fileFilter
        return res.status(400).json({ message: err.message || "Invalid file type" });
      }
      next();
    });
  }, async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      // Validate MIME type again (defense in depth)
      if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Only image files (JPEG, PNG, WebP, GIF) are allowed" });
      }

      // Validate magic bytes to prevent spoofed MIME types
      if (!validateImageMagicBytes(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({ message: "Invalid image file: content does not match file type" });
      }

      const userId = req.user.claims.sub;
      const objectStorageService = new ObjectStorageService();
      
      // Get presigned URL
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      // Upload file to storage
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: req.file.buffer,
        headers: {
          "Content-Type": req.file.mimetype,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      // Set ACL policy and get normalized path
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        uploadURL,
        {
          owner: userId,
          visibility: "public", // Profile images and listing images are public
        }
      );

      console.log(`User ${userId} uploaded image: ${objectPath}`);
      res.json({ url: objectPath });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploaded objects (public for visibility: public)
  app.get("/objects/:objectPath(*)", async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // Check if user can access (for public files, this will pass)
      const userId = req.user?.claims?.sub;
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ message: "Object not found" });
      }
      console.error("Error serving object:", error);
      res.status(500).json({ message: "Failed to serve object" });
    }
  });

  // Serve public assets
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    try {
      const filePath = req.params.filePath;
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}
