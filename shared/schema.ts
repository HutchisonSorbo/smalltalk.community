import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [
    index("IDX_session_expire").on(table.expire),
    pgPolicy("service_read", { for: "select", to: "service_role", using: sql`true` }),
    pgPolicy("service_write", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  ],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  dateOfBirth: timestamp("date_of_birth"),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("users_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("users_self_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.id}`, withCheck: sql`auth.uid() = ${table.id}` }),
]);

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Musician profiles table
export const musicianProfiles = pgTable("musician_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  instruments: text("instruments").array().notNull().default(sql`'{}'::text[]`),
  genres: text("genres").array().notNull().default(sql`'{}'::text[]`),
  experienceLevel: varchar("experience_level", { length: 50 }),
  availability: varchar("availability", { length: 100 }),
  location: varchar("location", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  isLookingForGroup: boolean("is_looking_for_group").default(false),
  isLocationShared: boolean("is_location_shared").default(false),
  isContactInfoPublic: boolean("is_contact_info_public").default(false),
  socialLinks: jsonb("social_links").$type<{
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
    appleMusic?: string;
    website?: string;
  }>().default({}),
  influences: text("influences").array().notNull().default(sql`'{}'::text[]`),
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("musicians_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("musicians_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("musicians_owner_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.userId}`, withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("musicians_owner_delete", { for: "delete", to: "authenticated", using: sql`auth.uid() = ${table.userId}` }),
  index("musicians_user_id_idx").on(table.userId),
]);

export const musicianProfilesRelations = relations(musicianProfiles, ({ one }) => ({
  user: one(users, {
    fields: [musicianProfiles.userId],
    references: [users.id],
  }),
}));

export const insertMusicianProfileSchema = createInsertSchema(musicianProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMusicianProfile = z.infer<typeof insertMusicianProfileSchema>;
export type MusicianProfile = typeof musicianProfiles.$inferSelect;

// Marketplace listings table
export const marketplaceListings = pgTable("marketplace_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  condition: varchar("condition", { length: 50 }),
  price: integer("price"),
  priceType: varchar("price_type", { length: 50 }).default("fixed"),
  location: varchar("location", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  imageUrls: text("image_urls").array().default(sql`'{}'::text[]`),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("marketplace_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("marketplace_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("marketplace_owner_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.userId}`, withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("marketplace_owner_delete", { for: "delete", to: "authenticated", using: sql`auth.uid() = ${table.userId}` }),
  index("marketplace_user_id_idx").on(table.userId),
]);

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one }) => ({
  user: one(users, {
    fields: [marketplaceListings.userId],
    references: [users.id],
  }),
}));

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // 'message', 'invite', 'system'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 255 }),
  metadata: jsonb("metadata"), // For storing extra data like requestId
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("notifications_self_read", { for: "select", to: "authenticated", using: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("notifications_self_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("notifications_self_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.userId}`, withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("notifications_self_delete", { for: "delete", to: "authenticated", using: sql`auth.uid() = ${table.userId}` }),
  index("notifications_user_id_idx").on(table.userId),
]);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Contact Requests table
export const contactRequests = pgTable("contact_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id), // Linking to User ID for easier notification routing
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("contact_requests_read", { for: "select", to: "authenticated", using: sql`auth.uid() = ${table.requesterId} OR auth.uid() = ${table.recipientId}` }),
  pgPolicy("contact_requests_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.requesterId}` }),
  pgPolicy("contact_requests_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.recipientId} OR auth.uid() = ${table.requesterId}` }),
  index("contact_requests_requester_id_idx").on(table.requesterId),
  index("contact_requests_recipient_id_idx").on(table.recipientId),
]);

export const contactRequestsRelations = relations(contactRequests, ({ one }) => ({
  requester: one(users, {
    fields: [contactRequests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  recipient: one(users, {
    fields: [contactRequests.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
}));

export const insertContactRequestSchema = createInsertSchema(contactRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;

// Victoria regions for location filtering
export const victoriaRegions = [
  "Melbourne CBD",
  "Inner Melbourne",
  "Northern Melbourne",
  "Western Melbourne",
  "Eastern Melbourne",
  "South Eastern Melbourne",
  "Mornington Peninsula",
  "Geelong",
  "Ballarat",
  "Bendigo",
  "Shepparton",
  "Wodonga",
  "Warrnambool",
  "Gippsland",
  "Other Victoria",
] as const;

// Instruments list
export const instruments = [
  "Guitar",
  "Bass",
  "Drums",
  "Keyboard/Piano",
  "Vocals",
  "Saxophone",
  "Trumpet",
  "Violin",
  "Cello",
  "Flute",
  "Clarinet",
  "Harmonica",
  "DJ/Electronic",
  "Percussion",
  "Other",
] as const;

// Genres list
export const genres = [
  "Rock",
  "Pop",
  "Jazz",
  "Blues",
  "Metal",
  "Folk",
  "Country",
  "Classical",
  "Electronic",
  "Hip Hop",
  "R&B",
  "Indie",
  "Punk",
  "Reggae",
  "Soul",
  "Funk",
  "World",
  "Other",
] as const;

// Experience levels
export const experienceLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Professional",
] as const;

// Availability options
export const availabilityOptions = [
  "Available Now",
  "Weekends Only",
  "Evenings Only",
  "Flexible Schedule",
  "Looking for Gigs",
  "Studio Sessions Only",
  "Touring Available",
  "Limited Availability",
] as const;

// Marketplace categories
export const marketplaceCategories = [
  "Guitars",
  "Bass Guitars",
  "Drums & Percussion",
  "Keyboards & Pianos",
  "Amplifiers",
  "Effects Pedals",
  "Microphones",
  "Recording Equipment",
  "DJ Equipment",
  "Brass & Woodwind",
  "String Instruments",
  "Accessories",
  "Services",
  "Lessons",
  "Rehearsal Space",
  "Other",
] as const;

// Item conditions
export const itemConditions = [
  "New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "For Parts",
] as const;

// Messages table for direct user communication
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("messages_read", { for: "select", to: "authenticated", using: sql`auth.uid() = ${table.senderId} OR auth.uid() = ${table.receiverId}` }),
  pgPolicy("messages_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.senderId}` }),
  index("messages_sender_id_idx").on(table.senderId),
  index("messages_receiver_id_idx").on(table.receiverId),
]);

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Message with sender info for display
export interface MessageWithSender extends Message {
  sender?: User;
}

// Conversation represents messages between two users
export interface Conversation {
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
}

// Reviews table for musician profiles and marketplace listings
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: varchar("target_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("reviews_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("reviews_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.reviewerId}` }),
  pgPolicy("reviews_owner_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.reviewerId}`, withCheck: sql`auth.uid() = ${table.reviewerId}` }),
  pgPolicy("reviews_owner_delete", { for: "delete", to: "authenticated", using: sql`auth.uid() = ${table.reviewerId}` }),
  index("reviews_reviewer_id_idx").on(table.reviewerId),
]);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export interface ReviewWithReviewer extends Review {
  reviewer?: User;
}

// Bands table
export const bands = pgTable("bands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  genres: text("genres").array().notNull().default(sql`'{}'::text[]`),
  influences: text("influences").array().notNull().default(sql`'{}'::text[]`),
  location: varchar("location", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
  websiteUrl: varchar("website_url", { length: 255 }),
  socialLinks: jsonb("social_links").$type<{
    facebook?: string;
    instagram?: string;
    snapchat?: string;
    tiktok?: string;
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
    appleMusic?: string;
  }>().default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("bands_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("bands_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("bands_owner_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.userId}`, withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("bands_owner_delete", { for: "delete", to: "authenticated", using: sql`auth.uid() = ${table.userId}` }),
  index("bands_user_id_idx").on(table.userId),
]);

export const bandsRelations = relations(bands, ({ one }) => ({
  user: one(users, {
    fields: [bands.userId],
    references: [users.id],
  }),
}));

export const insertBandSchema = createInsertSchema(bands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBand = z.infer<typeof insertBandSchema>;
export type Band = typeof bands.$inferSelect;
// Rate Limiting table
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // e.g., 'upload', 'login_attempt'
  hits: integer("hits").notNull().default(1),
  windowStart: timestamp("window_start").defaultNow().notNull(),
}, (table) => [
  pgPolicy("rate_limits_service_all", { for: "all", to: "service_role", using: sql`true` }),
  index("rate_limits_user_id_idx").on(table.userId),
]);

export type RateLimit = typeof rateLimits.$inferSelect;

// Band Members table (for Admin/Member roles)
export const bandMembers = pgTable("band_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bandId: varchar("band_id").notNull().references(() => bands.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull().default("member"), // 'admin', 'member'
  instrument: varchar("instrument", { length: 100 }),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  pgPolicy("band_members_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("band_members_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("band_members_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.userId}`, withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("band_members_delete", { for: "delete", to: "authenticated", using: sql`auth.uid() = ${table.userId}` }),
  index("band_members_band_id_idx").on(table.bandId),
  index("band_members_user_id_idx").on(table.userId),
]);

export const bandMembersRelations = relations(bandMembers, ({ one }) => ({
  band: one(bands, {
    fields: [bandMembers.bandId],
    references: [bands.id],
  }),
  user: one(users, {
    fields: [bandMembers.userId],
    references: [users.id],
  }),
}));

export const insertBandMemberSchema = createInsertSchema(bandMembers).omit({
  id: true,
  joinedAt: true,
});

export type InsertBandMember = z.infer<typeof insertBandMemberSchema>;
export type BandMember = typeof bandMembers.$inferSelect;

export interface BandMemberWithUser extends BandMember {
  user: User;
}

// Gigs table
export const gigs = pgTable("gigs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  bandId: varchar("band_id").references(() => bands.id), // Nullable if solo musician
  musicianId: varchar("musician_id").references(() => musicianProfiles.id), // Nullable if band
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  price: integer("price"), // In cents? Or just text description? Let's assume text for MVP flexibility or integer for cents
  ticketUrl: varchar("ticket_url", { length: 500 }),
  imageUrl: varchar("image_url"),
  coverImageUrl: varchar("cover_image_url"),
  genre: varchar("genre", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("gigs_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("gigs_creator_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.creatorId}` }),
  pgPolicy("gigs_creator_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.creatorId}`, withCheck: sql`auth.uid() = ${table.creatorId}` }),
  pgPolicy("gigs_creator_delete", { for: "delete", to: "authenticated", using: sql`auth.uid() = ${table.creatorId}` }),
  index("gigs_creator_id_idx").on(table.creatorId),
  index("gigs_band_id_idx").on(table.bandId),
  index("gigs_musician_id_idx").on(table.musicianId),
]);

// Gig Managers table for collaborative editing
export const gigManagers = pgTable("gig_managers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gigId: varchar("gig_id").notNull().references(() => gigs.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("gig_managers_read", { for: "select", to: "authenticated", using: sql`true` }),
  pgPolicy("gig_managers_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("gig_managers_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.userId}`, withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("gig_managers_delete", { for: "delete", to: "authenticated", using: sql`auth.uid() = ${table.userId}` }),
  index("gig_managers_gig_id_idx").on(table.gigId),
  index("gig_managers_user_id_idx").on(table.userId),
]);

export const gigsRelations = relations(gigs, ({ one, many }) => ({
  creator: one(users, {
    fields: [gigs.creatorId],
    references: [users.id],
  }),
  band: one(bands, {
    fields: [gigs.bandId],
    references: [bands.id],
  }),
  musician: one(musicianProfiles, {
    fields: [gigs.musicianId],
    references: [musicianProfiles.id],
  }),
  managers: many(gigManagers),
}));

export const gigManagersRelations = relations(gigManagers, ({ one }) => ({
  gig: one(gigs, {
    fields: [gigManagers.gigId],
    references: [gigs.id],
  }),
  user: one(users, {
    fields: [gigManagers.userId],
    references: [users.id],
  }),
}));


export const insertGigSchema = createInsertSchema(gigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGig = z.infer<typeof insertGigSchema>;
export type Gig = typeof gigs.$inferSelect;
// Reports table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  targetType: varchar("target_type", { length: 50 }).notNull(), // 'user', 'band', 'gig', 'listing', 'message'
  targetId: varchar("target_id").notNull(),
  reason: varchar("reason", { length: 100 }).notNull(), // 'harassment', 'spam', 'inappropriate_content', 'other'
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'reviewed', 'resolved', 'dismissed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("reports_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.reporterId}` }),
  pgPolicy("reports_admin_read", { for: "select", to: "service_role", using: sql`true` }),
  index("reports_reporter_id_idx").on(table.reporterId),
]);

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
}));

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Classifieds table (Digital Auditions)
export const classifieds = pgTable("classifieds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'musician_wanted' (Band looking for X) or 'band_wanted' (Musician looking for Band)
  instrument: varchar("instrument", { length: 100 }), // The instrument needed or offered
  genre: varchar("genre", { length: 100 }),
  location: varchar("location", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("classifieds_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("classifieds_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("classifieds_owner_update", { for: "update", to: "authenticated", using: sql`auth.uid() = ${table.userId}`, withCheck: sql`auth.uid() = ${table.userId}` }),
  pgPolicy("classifieds_owner_delete", { for: "delete", to: "authenticated", using: sql`auth.uid() = ${table.userId}` }),
  index("classifieds_user_id_idx").on(table.userId),
  index("classifieds_type_idx").on(table.type),
  index("classifieds_location_idx").on(table.location),
]);

export const classifiedsRelations = relations(classifieds, ({ one }) => ({
  user: one(users, {
    fields: [classifieds.userId],
    references: [users.id],
  }),
}));

export const insertClassifiedSchema = createInsertSchema(classifieds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClassified = z.infer<typeof insertClassifiedSchema>;
export type Classified = typeof classifieds.$inferSelect;

