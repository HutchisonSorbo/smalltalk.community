import {
  users,
  musicianProfiles,
  marketplaceListings,
  messages,
  reviews,
  bands,
  bandMembers,
  gigs,
  gigManagers,
  rateLimits,
  type User,
  type UpsertUser,
  // InsertUser removed
  type MusicianProfile,
  type InsertMusicianProfile,
  type MarketplaceListing,
  type InsertMarketplaceListing,
  type Message,
  type InsertMessage,
  type Conversation,
  // Room removed
  type Review,
  type InsertReview,
  type ReviewWithReviewer,
  type Band,
  type InsertBand,
  type BandMember,
  type InsertBandMember,
  type BandMemberWithUser,
  type Gig,
  type InsertGig,
  reports,
  type Report,
  type InsertReport,
  notifications,
  type Notification,
  type InsertNotification,
  contactRequests,
  type ContactRequest,
  type InsertContactRequest,
  classifieds,
  type Classified,
  type InsertClassified,
  professionalProfiles,
  type ProfessionalProfile,
  type InsertProfessionalProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql, ne, gte, lte, arrayOverlaps, ilike, lt, isNotNull } from "drizzle-orm";

export interface MusicianFilters {
  location?: string;
  instruments?: string[];
  genres?: string[];
  experienceLevel?: string;
  availability?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
  hasLocation?: boolean;
}

export interface MarketplaceFilters {
  location?: string;
  category?: string[];
  condition?: string[];
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface GigFilters {
  location?: string;
  date?: string; // 'upcoming', 'past', 'today'
  genre?: string;
  bandId?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface BandFilters extends Partial<Band> {
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface ClassifiedFilters {
  location?: string;
  instrument?: string;
  type?: string;
  genre?: string;
  limit?: number;
  offset?: number;
}

export interface ProfessionalFilters {
  location?: string;
  role?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
  hasLocation?: boolean;
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Musician profile operations
  getMusicianProfiles(filters?: MusicianFilters): Promise<MusicianProfile[]>;
  getMusicianLocations(filters?: MusicianFilters): Promise<Pick<MusicianProfile, 'id' | 'latitude' | 'longitude' | 'location' | 'instruments' | 'isLocationShared'>[]>;
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

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Contact Requests
  createContactRequest(request: InsertContactRequest): Promise<ContactRequest>;
  getContactRequest(requesterId: string, recipientId: string): Promise<ContactRequest | undefined>;
  getContactRequestById(id: string): Promise<ContactRequest | undefined>;
  updateContactRequestStatus(id: string, status: string): Promise<void>;
  updateMarketplaceListing(id: string, listing: Partial<InsertMarketplaceListing>): Promise<MarketplaceListing | undefined>;
  deleteMarketplaceListing(id: string): Promise<boolean>;

  // Message operations
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(userId: string, otherUserId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(userId: string, otherUserId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Review operations
  getReview(id: string): Promise<Review | undefined>;
  getReviewsForTarget(targetType: string, targetId: string): Promise<ReviewWithReviewer[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  getAverageRating(targetType: string, targetId: string): Promise<{ average: number; count: number }>;
  hasUserReviewed(userId: string, targetType: string, targetId: string): Promise<boolean>;

  // Classifieds operations
  getClassifieds(filters?: ClassifiedFilters): Promise<Classified[]>;
  getClassified(id: string): Promise<Classified | undefined>;
  createClassified(classified: InsertClassified): Promise<Classified>;
  deleteClassified(id: string): Promise<boolean>;

  // Professionals operations
  getProfessionalProfiles(filters?: ProfessionalFilters): Promise<ProfessionalProfile[]>;
  getProfessionalLocations(filters?: ProfessionalFilters): Promise<Pick<ProfessionalProfile, 'id' | 'latitude' | 'longitude' | 'location' | 'role' | 'isLocationShared'>[]>;
  getProfessionalProfile(id: string): Promise<ProfessionalProfile | undefined>;
  getProfessionalProfileByUserId(userId: string): Promise<ProfessionalProfile | undefined>;
  createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile>;
  updateProfessionalProfile(id: string, profile: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile | undefined>;
  deleteProfessionalProfile(id: string): Promise<boolean>;


  // Band operations
  createBand(band: InsertBand): Promise<Band>;
  getBand(id: string): Promise<Band | undefined>;
  getBands(filters?: BandFilters): Promise<Band[]>;
  getBandsByUser(userId: string): Promise<Band[]>;
  updateBand(id: string, band: Partial<InsertBand>): Promise<Band | undefined>;

  // Band Members
  addBandMember(member: InsertBandMember): Promise<BandMember>;
  removeBandMember(bandId: string, userId: string): Promise<boolean>;
  getBandMembers(bandId: string): Promise<BandMemberWithUser[]>;
  isBandAdmin(bandId: string, userId: string): Promise<boolean>;

  // Gigs
  createGig(gig: InsertGig): Promise<Gig>;
  getGigs(filters?: GigFilters): Promise<Gig[]>;
  getGigsByBand(bandId: string): Promise<Gig[]>;
  getGigsByMusician(musicianId: string): Promise<Gig[]>;

  // Security
  checkRateLimit(userId: string, type: string, limit: number, windowSeconds: number): Promise<boolean>;

  // Reports
  createReport(report: InsertReport): Promise<Report>;

  // Admin/System
  migrateUserId(oldId: string, newId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private _ratingCache = new Map<string, { data: { average: number; count: number }; timestamp: number }>();
  private _CACHE_TTL = 60 * 1000; // 1 minute

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }


  async upsertUser(userData: UpsertUser): Promise<User> {
    // Exclude createdAt from the update set to prevent overwriting on conflict
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, ...updateData } = userData;

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...updateData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }


  // Musician profile operations
  async getMusicianProfiles(filters?: MusicianFilters): Promise<MusicianProfile[]> {
    const conditions = this._buildMusicianFilters(filters);
    return db
      .select()
      .from(musicianProfiles)
      .where(and(...conditions))
      .orderBy(desc(musicianProfiles.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);
  }

  async getMusicianLocations(filters?: MusicianFilters): Promise<Pick<MusicianProfile, 'id' | 'latitude' | 'longitude' | 'location' | 'instruments' | 'isLocationShared'>[]> {
    const conditions = this._buildMusicianFilters(filters);
    return db
      .select({
        id: musicianProfiles.id,
        latitude: musicianProfiles.latitude,
        longitude: musicianProfiles.longitude,
        location: musicianProfiles.location,
        instruments: musicianProfiles.instruments,
        isLocationShared: musicianProfiles.isLocationShared
      })
      .from(musicianProfiles)
      .where(and(...conditions))
      .limit(filters?.limit || 2000);
  }

  private _buildMusicianFilters(filters?: MusicianFilters) {
    const conditions = [eq(musicianProfiles.isActive, true)];

    if (!filters) return conditions;

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
    if (filters.searchQuery) {
      const query = filters.searchQuery;
      // Optimization: Use prefix match for name (more efficient index usage)
      // Only use wildcard if the user intends it or for description fields
      const isPrefix = query.length >= 3;
      const nameCondition = isPrefix 
        ? ilike(musicianProfiles.name, `${query}%`) 
        : ilike(musicianProfiles.name, `%${query}%`);

      const searchCondition = or(
        nameCondition,
        ilike(musicianProfiles.bio, `%${query}%`),
        // Optimization: direct array overlap is faster than array_to_string if exact match
        // But for partial search, we still need generic check.
        // We keep the logic but rely on the fact that name is prioritized visually.
        sql`array_to_string(${musicianProfiles.instruments}, ',') ILIKE ${`%${query}%`}`,
        sql`array_to_string(${musicianProfiles.genres}, ',') ILIKE ${`%${query}%`}`
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (filters.hasLocation) {
      const locationCondition = and(
        isNotNull(musicianProfiles.latitude),
        isNotNull(musicianProfiles.longitude),
        eq(musicianProfiles.isLocationShared, true),
        ne(musicianProfiles.latitude, ""),
        ne(musicianProfiles.longitude, "")
      );
      if (locationCondition) {
        conditions.push(locationCondition);
      }
    }
    return conditions;
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

  // Classifieds operations
  async getClassifieds(filters?: ClassifiedFilters): Promise<Classified[]> {
    const conditions = [eq(classifieds.isActive, true)];

    if (filters) {
      if (filters.location) conditions.push(ilike(classifieds.location, `%${filters.location}%`));
      if (filters.instrument) conditions.push(eq(classifieds.instrument, filters.instrument));
      if (filters.type) conditions.push(eq(classifieds.type, filters.type));
      if (filters.genre) conditions.push(eq(classifieds.genre, filters.genre));
    }

    return db
      .select()
      .from(classifieds)
      .where(and(...conditions))
      .orderBy(desc(classifieds.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);
  }

  async getClassified(id: string): Promise<Classified | undefined> {
    const [item] = await db
      .select()
      .from(classifieds)
      .where(eq(classifieds.id, id));
    return item;
  }

  async createClassified(data: InsertClassified): Promise<Classified> {
    const [item] = await db
      .insert(classifieds)
      .values(data)
      .returning();
    return item;
  }

  async deleteClassified(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(classifieds)
      .where(eq(classifieds.id, id))
      .returning();
    return !!deleted;
  }

  // Professionals operations
  async getProfessionalProfiles(filters?: ProfessionalFilters): Promise<ProfessionalProfile[]> {
    const conditions = this._buildProfessionalFilters(filters);
    return db
      .select()
      .from(professionalProfiles)
      .where(and(...conditions))
      .orderBy(desc(professionalProfiles.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);
  }

  async getProfessionalLocations(filters?: ProfessionalFilters): Promise<Pick<ProfessionalProfile, 'id' | 'latitude' | 'longitude' | 'location' | 'role' | 'isLocationShared'>[]> {
    const conditions = this._buildProfessionalFilters(filters);
    return db
      .select({
        id: professionalProfiles.id,
        latitude: professionalProfiles.latitude,
        longitude: professionalProfiles.longitude,
        location: professionalProfiles.location,
        role: professionalProfiles.role,
        isLocationShared: professionalProfiles.isLocationShared
      })
      .from(professionalProfiles)
      .where(and(...conditions))
      .limit(filters?.limit || 2000);
  }

  private _buildProfessionalFilters(filters?: ProfessionalFilters) {
    const conditions = [eq(professionalProfiles.isActive, true)];
    if (!filters) return conditions;

    if (filters.location) conditions.push(ilike(professionalProfiles.location, `%${filters.location}%`));
    if (filters.role) conditions.push(eq(professionalProfiles.role, filters.role));
    if (filters.searchQuery) {
      const query = `%${filters.searchQuery}%`;
      conditions.push(or(
        ilike(professionalProfiles.businessName, query),
        ilike(professionalProfiles.bio, query),
        ilike(professionalProfiles.services, query)
      )!);
    }

    if (filters.hasLocation) {
      conditions.push(and(
        isNotNull(professionalProfiles.latitude),
        isNotNull(professionalProfiles.longitude),
        eq(professionalProfiles.isLocationShared, true),
        ne(professionalProfiles.latitude, ""),
        ne(professionalProfiles.longitude, "")
      )!);
    }
    return conditions;
  }

  async getProfessionalProfile(id: string): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.id, id));
    return profile;
  }

  async getProfessionalProfileByUserId(userId: string): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId));
    return profile;
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile> {
    const [created] = await db
      .insert(professionalProfiles)
      .values(profile)
      .returning();
    return created;
  }

  async updateProfessionalProfile(id: string, profile: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile | undefined> {
    const [updated] = await db
      .update(professionalProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(professionalProfiles.id, id))
      .returning();
    return updated;
  }

  async deleteProfessionalProfile(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(professionalProfiles)
      .where(eq(professionalProfiles.id, id))
      .returning();
    return !!deleted;
  }

  // Marketplace listing operations
  async getMarketplaceListings(filters?: MarketplaceFilters): Promise<MarketplaceListing[]> {
    const conditions = this._buildMarketplaceFilters(filters);
    return db
      .select()
      .from(marketplaceListings)
      .where(and(...conditions))
      .orderBy(desc(marketplaceListings.createdAt));
  }

  private _buildMarketplaceFilters(filters?: MarketplaceFilters) {
    const conditions = [eq(marketplaceListings.isActive, true)];

    if (!filters) return conditions;

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
    return conditions;
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

  // Review operations
  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async getReviewsForTarget(targetType: string, targetId: string): Promise<ReviewWithReviewer[]> {
    const reviewList = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.targetType, targetType), eq(reviews.targetId, targetId)))
      .orderBy(desc(reviews.createdAt));

    const reviewsWithReviewers: ReviewWithReviewer[] = [];
    for (const review of reviewList) {
      const reviewer = await this.getUser(review.reviewerId);
      reviewsWithReviewers.push({ ...review, reviewer });
    }
    return reviewsWithReviewers;
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewerId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Bands
  async createBand(band: InsertBand): Promise<Band> {
    const [newBand] = await db.insert(bands).values(band).returning();
    return newBand;
  }

  async getBand(id: string): Promise<Band | undefined> {
    const [band] = await db.select().from(bands).where(eq(bands.id, id));
    return band;
  }

  async getBands(filters?: Partial<Band> & { searchQuery?: string }): Promise<Band[]> {
    const conditions = this._buildBandFilters(filters);
    return await db.select().from(bands).where(and(...conditions));
  }

  private _buildBandFilters(filters?: Partial<Band> & { searchQuery?: string }) {
    const conditions = [eq(bands.isActive, true)];

    if (!filters) return conditions;

    if (filters.location) {
      conditions.push(ilike(bands.location, `%${filters.location}%`));
    }
    if (filters.searchQuery) {
      const query = `%${filters.searchQuery}%`;
      const searchCondition = or(
        ilike(bands.name, query),
        ilike(bands.bio, query),
        ilike(bands.location, query),
        sql`array_to_string(${bands.genres}, ',') ILIKE ${query}`
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }
    return conditions;
  }

  async getBandsByUser(userId: string): Promise<Band[]> {
    return await db.select().from(bands).where(eq(bands.userId, userId));
  }

  async updateBand(id: string, band: Partial<InsertBand>): Promise<Band | undefined> {
    const [updated] = await db
      .update(bands)
      .set({ ...band, updatedAt: new Date() })
      .where(eq(bands.id, id))
      .returning();
    return updated;
  }

  // Band Members
  async addBandMember(member: InsertBandMember): Promise<BandMember> {
    const [newMember] = await db.insert(bandMembers).values(member).returning();
    return newMember;
  }

  async removeBandMember(bandId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(bandMembers)
      .where(and(eq(bandMembers.bandId, bandId), eq(bandMembers.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getBandMembers(bandId: string): Promise<BandMemberWithUser[]> {
    const members = await db
      .select()
      .from(bandMembers)
      .where(eq(bandMembers.bandId, bandId));

    const membersWithUsers: BandMemberWithUser[] = [];
    for (const member of members) {
      const user = await this.getUser(member.userId);
      if (user) {
        membersWithUsers.push({ ...member, user });
      }
    }
    return membersWithUsers;
  }

  async isBandAdmin(bandId: string, userId: string): Promise<boolean> {
    // Check if owner
    const band = await this.getBand(bandId);
    if (band && band.userId === userId) return true;

    // Check if admin member
    const [member] = await db
      .select()
      .from(bandMembers)
      .where(
        and(
          eq(bandMembers.bandId, bandId),
          eq(bandMembers.userId, userId),
          eq(bandMembers.role, 'admin')
        )
      );
    return !!member;
  }

  // Gigs
  async createGig(gig: InsertGig): Promise<Gig> {
    const [newGig] = await db.insert(gigs).values(gig).returning();
    return newGig;
  }

  async getGigs(filters?: GigFilters): Promise<Gig[]> {
    const conditions = this._buildGigFilters(filters);
    return await db.select().from(gigs)
      .where(and(...conditions))
      .orderBy(gigs.date)
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);
  }

  private _buildGigFilters(filters?: GigFilters) {
    const conditions: any[] = [];
    if (!filters) return conditions;

    if (filters.location) {
      conditions.push(ilike(gigs.location, `%${filters.location}%`));
    }
    if (filters.genre) {
      conditions.push(ilike(gigs.genre, `%${filters.genre}%`));
    }
    if (filters.bandId) {
      conditions.push(eq(gigs.bandId, filters.bandId));
    }
    if (filters.date === 'upcoming') {
      conditions.push(gte(gigs.date, new Date()));
    } else if (filters.date === 'past') {
      conditions.push(lt(gigs.date, new Date()));
    }
    if (filters.searchQuery) {
      const query = `%${filters.searchQuery}%`;
      conditions.push(
        or(
          ilike(gigs.title, query),
          ilike(gigs.description, query),
          ilike(gigs.genre, query),
          ilike(gigs.location, query)
        )
      );
    }
    return conditions;
  }

  async getGigsByBand(bandId: string): Promise<Gig[]> {
    return await db.select().from(gigs)
      .where(and(eq(gigs.bandId, bandId), gte(gigs.date, new Date())))
      .orderBy(gigs.date);
  }

  async getGigsByMusician(musicianId: string): Promise<Gig[]> {
    return await db.select().from(gigs)
      .where(and(eq(gigs.musicianId, musicianId), gte(gigs.date, new Date())))
      .orderBy(gigs.date);
  }

  async updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined> {
    const [updated] = await db
      .update(reviews)
      .set({ ...review, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  async getAverageRating(targetType: string, targetId: string): Promise<{ average: number; count: number }> {
    const cacheKey = `${targetType}:${targetId}`;
    const cached = this._ratingCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < this._CACHE_TTL)) {
      return cached.data;
    }

    const result = await db
      .select({
        average: sql<number>`COALESCE(AVG(${reviews.rating}), 0)::float`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(and(eq(reviews.targetType, targetType), eq(reviews.targetId, targetId)));
    
    const data = {
      average: result[0]?.average || 0,
      count: result[0]?.count || 0,
    };

    this._ratingCache.set(cacheKey, { data, timestamp: now });
    return data;
  }

  async hasUserReviewed(userId: string, targetType: string, targetId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.reviewerId, userId),
          eq(reviews.targetType, targetType),
          eq(reviews.targetId, targetId)
        )
      );
    return result.length > 0;
  }

  async checkRateLimit(userId: string, type: string, limit: number, windowSeconds: number): Promise<boolean> {
    const now = new Date();
    const windowStartThreshold = new Date(now.getTime() - windowSeconds * 1000);

    const [record] = await db
      .select()
      .from(rateLimits)
      .where(and(eq(rateLimits.userId, userId), eq(rateLimits.type, type)));

    if (!record) {
      // First time action
      await db.insert(rateLimits).values({
        userId,
        type,
        hits: 1,
        windowStart: now,
      });
      return true;
    }

    if (record.windowStart < windowStartThreshold) {
      // Window expired, reset
      await db
        .update(rateLimits)
        .set({ hits: 1, windowStart: now })
        .where(eq(rateLimits.id, record.id));
      return true;
    }

    if (record.hits >= limit) {
      // Limit exceeded
      return false;
    }

    // Increment
    await db
      .update(rateLimits)
      .set({ hits: record.hits + 1 })
      .where(eq(rateLimits.id, record.id));

    return true;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result[0]?.count || 0;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Contact Requests
  async createContactRequest(request: InsertContactRequest): Promise<ContactRequest> {
    const [created] = await db.insert(contactRequests).values(request).returning();
    return created;
  }

  async getContactRequest(requesterId: string, recipientId: string): Promise<ContactRequest | undefined> {
    const [request] = await db
      .select()
      .from(contactRequests)
      .where(
        and(
          eq(contactRequests.requesterId, requesterId),
          eq(contactRequests.recipientId, recipientId)
        )
      );
    return request;
  }

  async getContactRequestById(id: string): Promise<ContactRequest | undefined> {
    const [request] = await db
      .select()
      .from(contactRequests)
      .where(eq(contactRequests.id, id));
    return request;
  }

  async updateContactRequestStatus(id: string, status: string): Promise<void> {
    await db
      .update(contactRequests)
      .set({ status })
      .where(eq(contactRequests.id, id));
  }

  // Reports
  async createReport(report: InsertReport): Promise<Report> {
    const [created] = await db.insert(reports).values(report).returning();
    return created;
  }

  async migrateUserId(oldId: string, newId: string): Promise<void> {
    const oldUser = await this.getUser(oldId);
    if (!oldUser) {
      throw new Error(`User ${oldId} not found`);
    }

    await db.transaction(async (tx) => {
      // 1. Create new user with temp email
      const tempEmail = `migrated_${Date.now()}_${oldUser.email}`;
      await tx.insert(users).values({
        ...oldUser,
        id: newId,
        email: tempEmail,
        updatedAt: new Date(),
      });

      // 2. Update all references
      // Musician Profiles
      await tx
        .update(musicianProfiles)
        .set({ userId: newId })
        .where(eq(musicianProfiles.userId, oldId));

      // Marketplace Listings
      await tx
        .update(marketplaceListings)
        .set({ userId: newId })
        .where(eq(marketplaceListings.userId, oldId));

      // Notifications
      await tx
        .update(notifications)
        .set({ userId: newId })
        .where(eq(notifications.userId, oldId));

      // Contact Requests
      await tx
        .update(contactRequests)
        .set({ requesterId: newId })
        .where(eq(contactRequests.requesterId, oldId));
      await tx
        .update(contactRequests)
        .set({ recipientId: newId })
        .where(eq(contactRequests.recipientId, oldId));

      // Messages
      await tx
        .update(messages)
        .set({ senderId: newId })
        .where(eq(messages.senderId, oldId));
      await tx
        .update(messages)
        .set({ receiverId: newId })
        .where(eq(messages.receiverId, oldId));

      // Reviews
      await tx
        .update(reviews)
        .set({ reviewerId: newId })
        .where(eq(reviews.reviewerId, oldId));

      // Bands
      await tx
        .update(bands)
        .set({ userId: newId })
        .where(eq(bands.userId, oldId));

      // Band Members
      await tx
        .update(bandMembers)
        .set({ userId: newId })
        .where(eq(bandMembers.userId, oldId));

      // Rate Limits
      await tx
        .update(rateLimits)
        .set({ userId: newId })
        .where(eq(rateLimits.userId, oldId));

      // Gigs
      await tx
        .update(gigs)
        .set({ creatorId: newId })
        .where(eq(gigs.creatorId, oldId));

      // Gig Managers
      await tx
        .update(gigManagers)
        .set({ userId: newId })
        .where(eq(gigManagers.userId, oldId));

      // Reports
      await tx
        .update(reports)
        .set({ reporterId: newId })
        .where(eq(reports.reporterId, oldId));

      // 3. Delete old user
      await tx.delete(users).where(eq(users.id, oldId));

      // 4. Update email on new user
      await tx
        .update(users)
        .set({ email: oldUser.email })
        .where(eq(users.id, newId));
    });
  }
}


export const storage = new DatabaseStorage();
