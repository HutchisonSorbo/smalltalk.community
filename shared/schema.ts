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
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
});

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
});

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
