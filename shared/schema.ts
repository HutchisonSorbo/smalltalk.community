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
  uniqueIndex,
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
  userType: varchar("user_type", { length: 50 }).default("individual"), // 'individual' | 'organisation'
  accountType: varchar("account_type", { length: 100 }).default("Individual"), // 'Individual', 'Business', 'Government Organisation', 'Charity', 'Other'
  accountTypeSpecification: varchar("account_type_specification", { length: 255 }), // For 'Other' type details
  onboardingCompleted: boolean("onboarding_completed").default(false),
  organisationName: varchar("organisation_name", { length: 255 }),
  isAdmin: boolean("is_admin").default(false),
  isMinor: boolean("is_minor").default(false),
  isSuspended: boolean("is_suspended").default(false),
  messagePrivacy: varchar("message_privacy", { length: 20 }).default("everyone"), // 'everyone' | 'verified_only' | 'nobody'
  lastActiveAt: timestamp("last_active_at"),
  onboardingStep: integer("onboarding_step").default(0),
  profileCompletionPercentage: integer("profile_completion_percentage").default(0),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Users can read their own profile
  pgPolicy("users_self_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.id}` }),
  // Users can update their own profile (if not suspended)
  pgPolicy("users_self_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.id} AND ${table.isSuspended} IS NOT TRUE`, withCheck: sql`( (select auth.uid()) )::text = ${table.id} AND ${table.isSuspended} IS NOT TRUE` }),
  // Service role can read all users (for server-side admin checks, middleware, etc.)
  pgPolicy("users_service_read", { for: "select", to: "service_role", using: sql`true` }),
  index("users_created_at_idx").on(table.createdAt),
  index("users_onboarding_completed_idx").on(table.onboardingCompleted),
]);

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Musician profiles table
export const musicianProfiles = pgTable("musician_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  pgPolicy("musicians_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("musicians_owner_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("musicians_owner_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
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
}) as any;

export type InsertMusicianProfile = z.infer<typeof insertMusicianProfileSchema>;
export type MusicianProfile = typeof musicianProfiles.$inferSelect;

// Marketplace listings table
export const marketplaceListings = pgTable("marketplace_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  pgPolicy("marketplace_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("marketplace_owner_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("marketplace_owner_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
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
}) as any;

export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'message', 'invite', 'system'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 255 }),
  metadata: jsonb("metadata"), // For storing extra data like requestId
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("notifications_self_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("notifications_self_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("notifications_self_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("notifications_self_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
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
}) as any;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Contact Requests table
export const contactRequests = pgTable("contact_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recipientId: varchar("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Linking to User ID for easier notification routing
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("contact_requests_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.requesterId} OR ( (select auth.uid()) )::text = ${table.recipientId}` }),
  pgPolicy("contact_requests_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.requesterId}` }),
  pgPolicy("contact_requests_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.recipientId} OR ( (select auth.uid()) )::text = ${table.requesterId}` }),
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
}) as any;

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
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("messages_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.senderId} OR ( (select auth.uid()) )::text = ${table.receiverId}` }),
  pgPolicy("messages_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.senderId}` }),
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
}) as any;

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
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: varchar("target_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("reviews_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("reviews_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.reviewerId}` }),
  pgPolicy("reviews_owner_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.reviewerId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.reviewerId}` }),
  pgPolicy("reviews_owner_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.reviewerId}` }),
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
}) as any;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export interface ReviewWithReviewer extends Review {
  reviewer?: User;
}

// Bands table
export const bands = pgTable("bands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  pgPolicy("bands_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("bands_owner_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("bands_owner_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
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
}) as any;

export type InsertBand = z.infer<typeof insertBandSchema>;
export type Band = typeof bands.$inferSelect;
// Rate Limiting table
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // e.g., 'upload', 'login_attempt'
  identifier: varchar("identifier", { length: 255 }), // IP address or other identifier for anonymous limits
  hits: integer("hits").notNull().default(1),
  windowStart: timestamp("window_start").defaultNow().notNull(),
}, (table) => [
  pgPolicy("rate_limits_service_all", { for: "all", to: "service_role", using: sql`true` }),
  index("rate_limits_user_id_idx").on(table.userId),
  index("rate_limits_identifier_v2_idx").on(table.identifier),
  // Partial unique indexes for atomic upsert in rate limiter
  // These enable ON CONFLICT to work correctly for both userId and identifier cases
  uniqueIndex("rate_limits_user_type_uniq").on(table.userId, table.type).where(sql`user_id IS NOT NULL`),
  uniqueIndex("rate_limits_identifier_type_uniq").on(table.identifier, table.type).where(sql`identifier IS NOT NULL`),
]);

export type RateLimit = typeof rateLimits.$inferSelect;

// Band Members table (for Admin/Member roles)
export const bandMembers = pgTable("band_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bandId: varchar("band_id").notNull().references(() => bands.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull().default("member"), // 'admin', 'member'
  instrument: varchar("instrument", { length: 100 }),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  pgPolicy("band_members_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("band_members_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("band_members_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("band_members_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
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
}) as any;

export type InsertBandMember = z.infer<typeof insertBandMemberSchema>;
export type BandMember = typeof bandMembers.$inferSelect;

export interface BandMemberWithUser extends BandMember {
  user: User;
}

// Gigs table
export const gigs = pgTable("gigs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bandId: varchar("band_id").references(() => bands.id, { onDelete: "cascade" }), // Nullable if solo musician. If band deleted, gig should go? Probably.
  musicianId: varchar("musician_id").references(() => musicianProfiles.id, { onDelete: "cascade" }), // Nullable if band. If profile deleted...
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  price: integer("price"), // In cents, or use text description for flexibility
  ticketUrl: varchar("ticket_url", { length: 500 }),
  imageUrl: varchar("image_url"),
  coverImageUrl: varchar("cover_image_url"),
  genre: varchar("genre", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("gigs_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("gigs_creator_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.creatorId}` }),
  pgPolicy("gigs_creator_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.creatorId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.creatorId}` }),
  pgPolicy("gigs_creator_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.creatorId}` }),
  index("gigs_creator_id_idx").on(table.creatorId),
  index("gigs_band_id_idx").on(table.bandId),
  index("gigs_musician_id_idx").on(table.musicianId),
]);

// Gig Managers table for collaborative editing
export const gigManagers = pgTable("gig_managers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gigId: varchar("gig_id").notNull().references(() => gigs.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("gig_managers_read", { for: "select", to: "authenticated", using: sql`true` }),
  pgPolicy("gig_managers_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("gig_managers_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("gig_managers_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
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

// CommunityOS Shared Types
export type CommunityOsRole = "admin" | "board" | "member";

export interface TenantWithMembership {
  tenant: {
    id: string;
    code: string;
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
    description: string | null;
  };
  role: CommunityOsRole;
  joinedAt: string;
}

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
}) as any;

export type InsertGig = z.infer<typeof insertGigSchema>;
export type Gig = typeof gigs.$inferSelect;
// Reports table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: varchar("target_type", { length: 50 }).notNull(), // 'user', 'band', 'gig', 'listing', 'message'
  targetId: varchar("target_id").notNull(),
  reason: varchar("reason", { length: 100 }).notNull(), // 'harassment', 'spam', 'inappropriate_content', 'other'
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'reviewed', 'resolved', 'dismissed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("reports_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.reporterId}` }),
  pgPolicy("reports_admin_read", { for: "select", to: "service_role", using: sql`true` }),
  index("reports_reporter_id_idx").on(table.reporterId),
  index("reports_status_idx").on(table.status),
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
}) as any;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Classifieds table (Digital Auditions)
export const classifieds = pgTable("classifieds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  pgPolicy("classifieds_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("classifieds_owner_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("classifieds_owner_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
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
}) as any;

export type InsertClassified = z.infer<typeof insertClassifiedSchema>;
export type Classified = typeof classifieds.$inferSelect;

export const professionalRoles = [
  "Producer",
  "Audio Engineer",
  "Photographer",
  "Videographer",
  "Graphic Designer",
  "Manager",
  "Teacher",
  "Luthier/Tech",
  "Venue Booker",
  "Other"
] as const;

export const professionalProfiles = pgTable("professional_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(),
  businessName: varchar("business_name", { length: 100 }),
  bio: text("bio").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  services: text("services"), // Detailed description of services
  rates: varchar("rates", { length: 255 }), // e.g. "$50/hr" or "Contact for quote"
  portfolioUrl: varchar("portfolio_url", { length: 255 }),
  website: varchar("website", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  instagramUrl: varchar("instagram_url", { length: 255 }),
  facebookUrl: varchar("facebook_url", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  twitterUrl: varchar("twitter_url", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
  verified: boolean("verified").default(false),
  wwccNumber: varchar("wwcc_number", { length: 50 }),
  wwccSurname: varchar("wwcc_surname", { length: 100 }),
  wwccExpiry: timestamp("wwcc_expiry"),
  wwccStatus: varchar("wwcc_status", { length: 20 }).default("pending"), // 'pending' | 'verified' | 'rejected' | 'expired'
  wwccValidatedAt: timestamp("wwcc_validated_at"),
  isContactInfoPublic: boolean("is_contact_info_public").default(false),
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  isLocationShared: boolean("is_location_shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("pro_profiles_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("pro_profiles_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("pro_profiles_owner_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("pro_profiles_owner_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  index("pro_role_idx").on(table.role),
  index("pro_location_idx").on(table.location),
]);

export const professionalProfilesRelations = relations(professionalProfiles, ({ one }) => ({
  user: one(users, {
    fields: [professionalProfiles.userId],
    references: [users.id],
  }),
}));

export const insertProfessionalProfileSchema = createInsertSchema(professionalProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verified: true
}) as any;

export type InsertProfessionalProfile = z.infer<typeof insertProfessionalProfileSchema>;
export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;


// Announcements table
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }), // Internal reference
  message: text("message").notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull().default("all"), // 'public', 'private', 'all'
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("announcements_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("announcements_admin_all", {
    for: "all",
    to: "authenticated",
    using: sql`exists (
      select 1 from sys_user_roles ur 
      join sys_roles r on ur.role_id = r.id 
      where ur.user_id = ( (select auth.uid()) )::text
      and r.name in ('super_admin', 'admin')
    )`,
    withCheck: sql`exists (
      select 1 from sys_user_roles ur 
      join sys_roles r on ur.role_id = r.id 
      where ur.user_id = ( (select auth.uid()) )::text
      and r.name in ('super_admin', 'admin')
    )`
  }),
  index("announcements_is_active_idx").on(table.isActive),
]);

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}) as any;

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
// ------------------------------------------------------------------
// SYSTEM / RBAC TABLES (Namespaced with sys_)
// ------------------------------------------------------------------

// System Roles (e.g., 'super_admin', 'hub_manager', 'moderator')
export const sysRoles = pgTable("sys_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(), // e.g. 'super_admin'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("sys_roles_read", { for: "select", to: "authenticated", using: sql`true` }),
  pgPolicy("sys_roles_admin_write", { for: "all", to: "service_role", using: sql`true` }), // Only service role (server) can modify roles for now
]);

// Join table: Users <-> Roles
export const sysUserRoles = pgTable("sys_user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: varchar("role_id").notNull().references(() => sysRoles.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("sys_user_roles_read", { for: "select", to: "authenticated", using: sql`true` }),
  pgPolicy("sys_user_roles_admin_write", { for: "all", to: "service_role", using: sql`true` }),
  index("sys_user_roles_user_idx").on(table.userId),
  index("sys_user_roles_role_idx").on(table.roleId),
]);

// ------------------------------------------------------------------
// ONBOARDING TABLES
// ------------------------------------------------------------------

export const userOnboardingResponses = pgTable("user_onboarding_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionKey: text("question_key").notNull(),
  response: jsonb("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("onboarding_responses_self_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("onboarding_responses_self_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("onboarding_responses_self_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  index("idx_onboarding_user_id").on(table.userId),
]);

export const userPrivacySettings = pgTable("user_privacy_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileVisibility: text("profile_visibility").default("community_members"),
  showRealName: boolean("show_real_name").default(false),
  showLocation: boolean("show_location").default(true),
  showAge: boolean("show_age").default(true),
  allowEmailLookup: boolean("allow_email_lookup").default(false),
  defaultPostVisibility: text("default_post_visibility").default("community"),
  settingsUpdatedAt: timestamp("settings_updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("privacy_settings_self_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("privacy_settings_self_modify", { for: "all", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  uniqueIndex("uidx_privacy_settings_user").on(table.userId),
]);

export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emailWeeklyDigest: boolean("email_weekly_digest").default(true),
  emailEventReminders: boolean("email_event_reminders").default(true),
  emailMessages: boolean("email_messages").default(true),
  emailRecommendations: boolean("email_recommendations").default(true),
  emailNewsletter: boolean("email_newsletter").default(true),
  pushEnabled: boolean("push_enabled").default(false),
  soundEnabled: boolean("sound_enabled").default(true),
  preferencesUpdatedAt: timestamp("preferences_updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("notification_prefs_self_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("notification_prefs_self_modify", { for: "all", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  uniqueIndex("uidx_notification_prefs_user").on(table.userId),
]);

export const userRecommendedApps = pgTable("user_recommended_apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appId: varchar("app_id").notNull().references(() => apps.id),
  recommendationScore: integer("recommendation_score"),
  shownAt: timestamp("shown_at").defaultNow(),
  accepted: boolean("accepted").default(false),
  acceptedAt: timestamp("accepted_at"),
}, (table) => [
  pgPolicy("recommended_apps_self_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("recommended_apps_self_modify", { for: "all", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  index("idx_recommended_apps_user_id").on(table.userId),
  index("idx_recommended_apps_app_id").on(table.appId),
]);

export const onboardingMetrics = pgTable("onboarding_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricDate: text("metric_date").notNull(), // storing as text YYYY-MM-DD for simplicity in aggregation
  metricName: text("metric_name").notNull(),
  accountType: text("account_type"),
  ageGroup: text("age_group"),
  metricValue: integer("metric_value"), // using integer for counts/percentages (scaled)
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("metrics_service_all", { for: "all", to: "service_role", using: sql`true` }),
  index("idx_metrics_date").on(table.metricDate),
]);

// Relations for new tables
export const userOnboardingResponsesRelations = relations(userOnboardingResponses, ({ one }) => ({
  user: one(users, {
    fields: [userOnboardingResponses.userId],
    references: [users.id],
  }),
}));

export const userPrivacySettingsRelations = relations(userPrivacySettings, ({ one }) => ({
  user: one(users, {
    fields: [userPrivacySettings.userId],
    references: [users.id],
  }),
}));

export const userNotificationPreferencesRelations = relations(userNotificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userNotificationPreferences.userId],
    references: [users.id],
  }),
}));

export const userRecommendedAppsRelations = relations(userRecommendedApps, ({ one }) => ({
  user: one(users, {
    fields: [userRecommendedApps.userId],
    references: [users.id],
  }),
  app: one(apps, {
    fields: [userRecommendedApps.appId],
    references: [apps.id],
  }),
}));

export const sysRolesRelations = relations(sysRoles, ({ many }) => ({
  userRoles: many(sysUserRoles),
}));

export const sysUserRolesRelations = relations(sysUserRoles, ({ one }) => ({
  user: one(users, {
    fields: [sysUserRoles.userId],
    references: [users.id],
  }),
  role: one(sysRoles, {
    fields: [sysUserRoles.roleId],
    references: [sysRoles.id],
  }),
}));


// ------------------------------------------------------------------
// VOLUNTEER PASSPORT TABLES
// ------------------------------------------------------------------

// Volunteer Profiles
export const volunteerProfiles = pgTable("volunteer_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  headline: varchar("headline", { length: 255 }),
  bio: text("bio"),
  locationSuburb: varchar("location_suburb", { length: 100 }),
  locationPostcode: varchar("location_postcode", { length: 20 }),
  privacySettings: jsonb("privacy_settings").default({ profile_visibility: "public", show_email: false, show_phone: false }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("volunteer_profiles_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("volunteer_profiles_owner_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("volunteer_profiles_owner_update", { for: "update", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}`, withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("volunteer_profiles_owner_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  index("volunteer_profiles_user_id_idx").on(table.userId),
]);

export const volunteerProfilesRelations = relations(volunteerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [volunteerProfiles.userId],
    references: [users.id],
  }),
  skills: many(profileSkills),
  credentials: many(credentials),
  applications: many(volunteerApplications),
}));

export const insertVolunteerProfileSchema = createInsertSchema(volunteerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true
}) as any;

export type InsertVolunteerProfile = z.infer<typeof insertVolunteerProfileSchema>;
export type VolunteerProfile = typeof volunteerProfiles.$inferSelect;

// Organisations
export const organisations = pgTable("organisations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  abn: varchar("abn", { length: 50 }),
  website: varchar("website", { length: 255 }),
  logoUrl: varchar("logo_url"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("organisations_public_read", { for: "select", to: "public", using: sql`true` }),
  // Write policies are complex and handled via organisationMembers usually, or initially by creator
]);

export const organisationsRelations = relations(organisations, ({ many }) => ({
  members: many(organisationMembers),
  roles: many(volunteerRoles),
}));

export const insertOrganisationSchema = createInsertSchema(organisations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
}) as any;

export type InsertOrganisation = z.infer<typeof insertOrganisationSchema>;
export type Organisation = typeof organisations.$inferSelect;

// Organisation Members
export const orgRoleEnum = pgTable("organisation_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organisationId: varchar("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).default("viewer"), // 'admin', 'coordinator', 'viewer'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("org_members_read", { for: "select", to: "authenticated", using: sql`true` }), // Simplification: authenticated users can see membership? Or restrict to org members? Sticking to simpler for now.
  index("org_members_org_idx").on(table.organisationId),
  index("org_members_user_idx").on(table.userId),
]);
// Alias for cleaner export
export const organisationMembers = orgRoleEnum;

export const organisationMembersRelations = relations(organisationMembers, ({ one }) => ({
  organisation: one(organisations, {
    fields: [organisationMembers.organisationId],
    references: [organisations.id],
  }),
  user: one(users, {
    fields: [organisationMembers.userId],
    references: [users.id],
  }),
}));

export const insertOrganisationMemberSchema = createInsertSchema(organisationMembers).omit({
  id: true,
  createdAt: true,
}) as any;

export type InsertOrganisationMember = z.infer<typeof insertOrganisationMemberSchema>;
export type OrganisationMember = typeof organisationMembers.$inferSelect;

// Skills
export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).unique().notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("skills_public_read", { for: "select", to: "public", using: sql`true` }),
]);

export const skillsRelations = relations(skills, ({ many }) => ({
  profiles: many(profileSkills),
}));

export type Skill = typeof skills.$inferSelect;

// Profile Skills (Junction)
export const profileSkills = pgTable("profile_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => volunteerProfiles.id, { onDelete: "cascade" }),
  skillId: varchar("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  proficiencyLevel: varchar("proficiency_level", { length: 50 }), // 'beginner', 'intermediate', 'expert'
  endorsementCount: integer("endorsement_count").default(0),
}, (table) => [
  pgPolicy("profile_skills_public_read", { for: "select", to: "public", using: sql`true` }),
  index("profile_skills_profile_idx").on(table.profileId),
  index("profile_skills_skill_idx").on(table.skillId),
]);

export const profileSkillsRelations = relations(profileSkills, ({ one }) => ({
  profile: one(volunteerProfiles, {
    fields: [profileSkills.profileId],
    references: [volunteerProfiles.id],
  }),
  skill: one(skills, {
    fields: [profileSkills.skillId],
    references: [skills.id],
  }),
}));

export type ProfileSkill = typeof profileSkills.$inferSelect;

// Credentials
export const credentials = pgTable("credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => volunteerProfiles.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(), // 'WWCC', 'Police Check'
  identifier: varchar("identifier", { length: 255 }),
  issuingAuthority: varchar("issuing_authority", { length: 255 }),
  issuedDate: timestamp("issued_date"),
  expiryDate: timestamp("expiry_date"),
  documentUrl: varchar("document_url"),
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'verified', 'rejected', 'expired'
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("credentials_owner_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = (select user_id from volunteer_profiles where id = ${table.profileId})` }),
  index("credentials_profile_idx").on(table.profileId),
]);

export const credentialsRelations = relations(credentials, ({ one }) => ({
  profile: one(volunteerProfiles, {
    fields: [credentials.profileId],
    references: [volunteerProfiles.id],
  }),
}));

export const insertCredentialSchema = createInsertSchema(credentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  verifiedAt: true,
}) as any;

export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type Credential = typeof credentials.$inferSelect;

// Volunteer Roles (Opportunities)
export const volunteerRoles = pgTable("volunteer_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organisationId: varchar("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  roleType: varchar("role_type", { length: 50 }).default("ongoing"), // 'ongoing', 'one_off', 'event_based'
  locationType: varchar("location_type", { length: 50 }).default("on_site"), // 'on_site', 'remote', 'hybrid'
  address: text("address"),
  status: varchar("status", { length: 50 }).default("draft"), // 'draft', 'published', 'closed', 'archived'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("volunteer_roles_public_read", { for: "select", to: "public", using: sql`status = 'published'` }),
  index("volunteer_roles_org_idx").on(table.organisationId),
]);

export const volunteerRolesRelations = relations(volunteerRoles, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [volunteerRoles.organisationId],
    references: [organisations.id],
  }),
  applications: many(volunteerApplications),
}));

export const insertVolunteerRoleSchema = createInsertSchema(volunteerRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}) as any;

export type InsertVolunteerRole = z.infer<typeof insertVolunteerRoleSchema>;
export type VolunteerRole = typeof volunteerRoles.$inferSelect;

// Applications
export const volunteerApplications = pgTable("volunteer_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").notNull().references(() => volunteerRoles.id, { onDelete: "cascade" }),
  applicantId: varchar("applicant_id").notNull().references(() => volunteerProfiles.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("submitted"), // 'submitted', 'under_review', 'shortlisted', 'accepted', 'declined'
  coverMessage: text("cover_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("applications_applicant_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = (select user_id from volunteer_profiles where id = ${table.applicantId})` }),
  index("applications_role_idx").on(table.roleId),
  index("applications_applicant_idx").on(table.applicantId),
]);

export const volunteerApplicationsRelations = relations(volunteerApplications, ({ one }) => ({
  role: one(volunteerRoles, {
    fields: [volunteerApplications.roleId],
    references: [volunteerRoles.id],
  }),
  applicant: one(volunteerProfiles, {
    fields: [volunteerApplications.applicantId],
    references: [volunteerProfiles.id],
  }),
}));

export const insertVolunteerApplicationSchema = createInsertSchema(volunteerApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}) as any;

export type InsertVolunteerApplication = z.infer<typeof insertVolunteerApplicationSchema>;
export type VolunteerApplication = typeof volunteerApplications.$inferSelect;


// ------------------------------------------------------------------
// APP REGISTRY & MANAGEMENT
// ------------------------------------------------------------------

// Apps Registry
export const apps = pgTable("apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  iconUrl: varchar("icon_url", { length: 255 }).notNull(),
  route: varchar("route", { length: 100 }), // e.g., '/local-music-network', nullable for recommended apps
  category: varchar("category", { length: 50 }), // e.g., 'Music', 'Community', 'Utility'
  ageRestriction: text("age_restriction"), // 'all_ages', 'teens_and_up', 'adults_only'
  suitableForAccountTypes: text("suitable_for_account_types").array(),
  relevantInterests: text("relevant_interests").array(),
  relevantIntents: text("relevant_intents").array(),
  isBeta: boolean("is_beta").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("apps_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("apps_admin_write", { for: "all", to: "service_role", using: sql`true` }),
  // Indexes for common query patterns
  index("apps_is_active_idx").on(table.isActive),
]);

// User <-> Apps Join Table
export const userApps = pgTable("user_apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appId: varchar("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  position: integer("position"),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("user_apps_self_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("user_apps_self_insert", { for: "insert", to: "authenticated", withCheck: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("user_apps_self_delete", { for: "delete", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  index("user_apps_user_idx").on(table.userId),
  index("user_apps_app_idx").on(table.appId),
  uniqueIndex("user_apps_user_app_unique").on(table.userId, table.appId),
]);

export const appsRelations = relations(apps, ({ many }) => ({
  users: many(userApps),
}));

export const userAppsRelations = relations(userApps, ({ one }) => ({
  user: one(users, {
    fields: [userApps.userId],
    references: [users.id],
  }),
  app: one(apps, {
    fields: [userApps.appId],
    references: [apps.id],
  }),
}));

export const insertAppSchema = createInsertSchema(apps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}) as any;

export type App = typeof apps.$inferSelect;
export type InsertApp = z.infer<typeof insertAppSchema>;

export const insertUserAppSchema = createInsertSchema(userApps).omit({
  id: true,
  createdAt: true,
}) as any;

export type UserApp = typeof userApps.$inferSelect;
export type InsertUserApp = z.infer<typeof insertUserAppSchema>;

// ------------------------------------------------------------------
// ADMIN INFRASTRUCTURE TABLES
// ------------------------------------------------------------------

// Admin Activity Log - Audit trail for all admin actions
// SECURITY: Immutable logs - FK prevents deletion of users with audit history
export const adminActivityLog = pgTable("admin_activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  action: varchar("action", { length: 100 }).notNull(), // 'user.update', 'user.suspend', 'content.delete', etc.
  targetType: varchar("target_type", { length: 50 }).notNull(), // 'user', 'app', 'report', 'announcement', etc.
  targetId: varchar("target_id").notNull(),
  details: jsonb("details"), // Additional context about the action
  ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  // SECURITY: Service role has full access for server-side operations
  pgPolicy("admin_log_service_read", { for: "select", to: "service_role", using: sql`true` }),
  pgPolicy("admin_log_service_write", { for: "insert", to: "service_role", withCheck: sql`true` }),
  // SECURITY: Authenticated admin users can read the audit log
  pgPolicy("admin_log_authenticated_read", {
    for: "select",
    to: "authenticated",
    using: sql`(auth.uid())::text IN (SELECT id FROM users WHERE is_admin = true)`
  }),
  // No update/delete policies - logs are immutable
  index("admin_log_admin_idx").on(table.adminId),
  index("admin_log_target_idx").on(table.targetType, table.targetId),
]);

export const adminActivityLogRelations = relations(adminActivityLog, ({ one }) => ({
  admin: one(users, {
    fields: [adminActivityLog.adminId],
    references: [users.id],
  }),
}));

export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLog).omit({
  id: true,
  createdAt: true,
}) as any;

export type AdminActivityLog = typeof adminActivityLog.$inferSelect;
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;

// Site Settings - Key-value store for platform configuration
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
}, (table) => [
  pgPolicy("site_settings_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("site_settings_service_write", { for: "all", to: "service_role", using: sql`true` }),
  uniqueIndex("site_settings_key_idx").on(table.key),
  index("site_settings_updated_by_idx").on(table.updatedBy),
]);

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
  updater: one(users, {
    fields: [siteSettings.updatedBy],
    references: [users.id],
  }),
}));

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
}) as any;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

// Feature Flags - Toggle features on/off platform-wide
export const featureFlags = pgTable("feature_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  enabledForRoles: text("enabled_for_roles").array().default(sql`'{}'::text[]`), // Empty = all, or specific role names
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  pgPolicy("feature_flags_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("feature_flags_service_write", { for: "all", to: "service_role", using: sql`true` }),
  uniqueIndex("feature_flags_key_idx").on(table.key),
]);

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}) as any;

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

// ------------------------------------------------------------------
// COMMUNITYOS MULTI-TENANCY TABLES
// ------------------------------------------------------------------

// Tenants table: organisations using CommunityOS
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 50 }).notNull().unique(), // URL slug, e.g. 'stc'
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  primaryColor: varchar("primary_color", { length: 7 }).default("#4F46E5"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#818CF8"),
  description: text("description"),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  pgPolicy("tenants_public_read", { for: "select", to: "public", using: sql`true` }),
  pgPolicy("tenants_service_write", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
]);

export const tenantsRelations = relations(tenants, ({ many }) => ({
  members: many(tenantMembers),
  invites: many(tenantInvites),
}));

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// Tenant members: users who belong to a tenant with role-based access
export const tenantMembers = pgTable("tenant_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("member"), // 'admin', 'board', 'member'
  invitedBy: varchar("invited_by").references(() => users.id, { onDelete: "set null" }),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  pgPolicy("tenant_members_self_read", { for: "select", to: "authenticated", using: sql`( (select auth.uid()) )::text = ${table.userId}` }),
  pgPolicy("tenant_members_admin_read", {
    for: "select",
    to: "authenticated",
    using: sql`EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = ${table.tenantId}
        AND tm.user_id = ( (select auth.uid()) )::text
        AND tm.role = 'admin'
    )`
  }),
  pgPolicy("tenant_members_service_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  uniqueIndex("tenant_members_tenant_user_idx").on(table.tenantId, table.userId),
  index("tenant_members_tenant_id_idx").on(table.tenantId),
  index("tenant_members_user_id_idx").on(table.userId),
  index("tenant_members_invited_by_idx").on(table.invitedBy),
]);

export const tenantMembersRelations = relations(tenantMembers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantMembers.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantMembers.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [tenantMembers.invitedBy],
    references: [users.id],
    relationName: "inviter",
  }),
}));

export type TenantMember = typeof tenantMembers.$inferSelect;
export type InsertTenantMember = typeof tenantMembers.$inferInsert;

// Tenant member roles
export const tenantRoles = ["admin", "board", "member"] as const;
export type TenantRole = (typeof tenantRoles)[number];

// Tenant invites: pending invitations to join a tenant
export const tenantInvites = pgTable("tenant_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  token: varchar("token", { length: 64 }).notNull().unique(),
  invitedBy: varchar("invited_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull().default(sql`NOW() + INTERVAL '7 days'`),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  pgPolicy("tenant_invites_admin_all", {
    for: "all",
    to: "authenticated",
    using: sql`EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = ${table.tenantId}
        AND tm.user_id = ( (select auth.uid()) )::text
        AND tm.role = 'admin'
    )`,
    withCheck: sql`EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = ${table.tenantId}
        AND tm.user_id = ( (select auth.uid()) )::text
        AND tm.role = 'admin'
    )`
  }),
  pgPolicy("tenant_invites_service_all", { for: "all", to: "service_role", using: sql`true`, withCheck: sql`true` }),
  index("tenant_invites_email_idx").on(table.email),
  index("tenant_invites_tenant_id_idx").on(table.tenantId),
  index("tenant_invites_invited_by_idx").on(table.invitedBy),
]);

export const tenantInvitesRelations = relations(tenantInvites, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantInvites.tenantId],
    references: [tenants.id],
  }),
  inviter: one(users, {
    fields: [tenantInvites.invitedBy],
    references: [users.id],
  }),
}));

export type TenantInvite = typeof tenantInvites.$inferSelect;
export type InsertTenantInvite = typeof tenantInvites.$inferInsert;

