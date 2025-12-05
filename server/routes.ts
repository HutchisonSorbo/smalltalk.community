import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertMusicianProfileSchema, insertMarketplaceListingSchema, insertMessageSchema } from "@shared/schema";

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
