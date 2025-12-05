import {
  users,
  musicianProfiles,
  marketplaceListings,
  messages,
  type User,
  type UpsertUser,
  type MusicianProfile,
  type InsertMusicianProfile,
  type MarketplaceListing,
  type InsertMarketplaceListing,
  type Message,
  type InsertMessage,
  type Conversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql, ne, gte, lte, arrayOverlaps } from "drizzle-orm";

export interface MusicianFilters {
  location?: string;
  instruments?: string[];
  genres?: string[];
  experienceLevel?: string;
  availability?: string;
}

export interface MarketplaceFilters {
  location?: string;
  category?: string[];
  condition?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Musician profile operations
  getMusicianProfiles(filters?: MusicianFilters): Promise<MusicianProfile[]>;
  getMusicianProfile(id: string): Promise<MusicianProfile | undefined>;
  getMusicianProfilesByUser(userId: string): Promise<MusicianProfile[]>;
  createMusicianProfile(profile: InsertMusicianProfile): Promise<MusicianProfile>;
  updateMusicianProfile(id: string, profile: Partial<InsertMusicianProfile>): Promise<MusicianProfile | undefined>;
  deleteMusicianProfile(id: string): Promise<boolean>;

  // Marketplace listing operations
  getMarketplaceListings(filters?: MarketplaceFilters): Promise<MarketplaceListing[]>;
  getMarketplaceListing(id: string): Promise<MarketplaceListing | undefined>;
  getMarketplaceListingsByUser(userId: string): Promise<MarketplaceListing[]>;
  createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing>;
  updateMarketplaceListing(id: string, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined>;
  deleteMarketplaceListing(id: string): Promise<boolean>;

  // Message operations
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(userId: string, otherUserId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(userId: string, otherUserId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Musician profile operations
  async getMusicianProfiles(filters?: MusicianFilters): Promise<MusicianProfile[]> {
    const conditions = [eq(musicianProfiles.isActive, true)];

    if (filters) {
      if (filters.location) {
        conditions.push(eq(musicianProfiles.location, filters.location));
      }
      if (filters.experienceLevel) {
        conditions.push(eq(musicianProfiles.experienceLevel, filters.experienceLevel));
      }
      if (filters.availability) {
        conditions.push(eq(musicianProfiles.availability, filters.availability));
      }
      if (filters.instruments && filters.instruments.length > 0) {
        conditions.push(arrayOverlaps(musicianProfiles.instruments, filters.instruments));
      }
      if (filters.genres && filters.genres.length > 0) {
        conditions.push(arrayOverlaps(musicianProfiles.genres, filters.genres));
      }
    }

    return db
      .select()
      .from(musicianProfiles)
      .where(and(...conditions))
      .orderBy(desc(musicianProfiles.createdAt));
  }

  async getMusicianProfile(id: string): Promise<MusicianProfile | undefined> {
    const [profile] = await db
      .select()
      .from(musicianProfiles)
      .where(eq(musicianProfiles.id, id));
    return profile;
  }

  async getMusicianProfilesByUser(userId: string): Promise<MusicianProfile[]> {
    return db
      .select()
      .from(musicianProfiles)
      .where(eq(musicianProfiles.userId, userId))
      .orderBy(desc(musicianProfiles.createdAt));
  }

  async createMusicianProfile(profile: InsertMusicianProfile): Promise<MusicianProfile> {
    const [created] = await db
      .insert(musicianProfiles)
      .values(profile)
      .returning();
    return created;
  }

  async updateMusicianProfile(id: string, profile: Partial<InsertMusicianProfile>): Promise<MusicianProfile | undefined> {
    const [updated] = await db
      .update(musicianProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(musicianProfiles.id, id))
      .returning();
    return updated;
  }

  async deleteMusicianProfile(id: string): Promise<boolean> {
    const result = await db
      .delete(musicianProfiles)
      .where(eq(musicianProfiles.id, id))
      .returning();
    return result.length > 0;
  }

  // Marketplace listing operations
  async getMarketplaceListings(filters?: MarketplaceFilters): Promise<MarketplaceListing[]> {
    const conditions = [eq(marketplaceListings.isActive, true)];

    if (filters) {
      if (filters.location) {
        conditions.push(eq(marketplaceListings.location, filters.location));
      }
      if (filters.category && filters.category.length > 0) {
        if (filters.category.length === 1) {
          conditions.push(eq(marketplaceListings.category, filters.category[0]));
        } else {
          const categoryConditions = filters.category.map(cat => 
            eq(marketplaceListings.category, cat)
          );
          conditions.push(or(...categoryConditions)!);
        }
      }
      if (filters.condition && filters.condition.length > 0) {
        if (filters.condition.length === 1) {
          conditions.push(eq(marketplaceListings.condition, filters.condition[0]));
        } else {
          const conditionConditions = filters.condition.map(cond => 
            eq(marketplaceListings.condition, cond)
          );
          conditions.push(or(...conditionConditions)!);
        }
      }
      if (filters.minPrice !== undefined) {
        conditions.push(gte(marketplaceListings.price, filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        conditions.push(lte(marketplaceListings.price, filters.maxPrice));
      }
    }

    return db
      .select()
      .from(marketplaceListings)
      .where(and(...conditions))
      .orderBy(desc(marketplaceListings.createdAt));
  }

  async getMarketplaceListing(id: string): Promise<MarketplaceListing | undefined> {
    const [listing] = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, id));
    return listing;
  }

  async getMarketplaceListingsByUser(userId: string): Promise<MarketplaceListing[]> {
    return db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.userId, userId))
      .orderBy(desc(marketplaceListings.createdAt));
  }

  async createMarketplaceListing(listing: InsertMarketplaceListing): Promise<MarketplaceListing> {
    const [created] = await db
      .insert(marketplaceListings)
      .values(listing)
      .returning();
    return created;
  }

  async updateMarketplaceListing(id: string, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined> {
    const [updated] = await db
      .update(marketplaceListings)
      .set({ ...listing, updatedAt: new Date() })
      .where(eq(marketplaceListings.id, id))
      .returning();
    return updated;
  }

  async deleteMarketplaceListing(id: string): Promise<boolean> {
    const result = await db
      .delete(marketplaceListings)
      .where(eq(marketplaceListings.id, id))
      .returning();
    return result.length > 0;
  }

  // Message operations
  async getConversations(userId: string): Promise<Conversation[]> {
    const allMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    const conversationMap = new Map<string, { messages: Message[]; unreadCount: number }>();

    for (const message of allMessages) {
      const otherUserId =
        message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, { messages: [], unreadCount: 0 });
      }
      
      const conv = conversationMap.get(otherUserId)!;
      conv.messages.push(message);
      
      if (message.receiverId === userId && !message.isRead) {
        conv.unreadCount++;
      }
    }

    const conversations: Conversation[] = [];
    const entries = Array.from(conversationMap.entries());
    for (const [otherUserId, data] of entries) {
      const otherUser = await this.getUser(otherUserId);
      if (otherUser) {
        conversations.push({
          otherUser,
          lastMessage: data.messages[0],
          unreadCount: data.unreadCount,
        });
      }
    }

    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt!).getTime() -
        new Date(a.lastMessage.createdAt!).getTime()
    );

    return conversations;
  }

  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
        )
      )
      .orderBy(messages.createdAt);
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markMessagesAsRead(userId: string, otherUserId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, otherUserId),
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();
