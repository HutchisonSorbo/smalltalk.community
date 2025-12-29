"use server";

import { db } from "@/server/db";
import { users, musicianProfiles, bands, gigs } from "@shared/schema";
import { eq, sql, and, gt, gte, lt } from "drizzle-orm";
import { createClient } from "@/lib/supabase-server";

export async function updateLastActive() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // We primarily link by email since IDs might differ if not synced perfectly, 
    // currently schema uses varchar id which should match Supabase ID if setup correctly.
    // Assuming 'users.id' matches Supabase Auth ID.

    await db.update(users)
        .set({ lastActiveAt: new Date() })
        .where(eq(users.id, user.id));

    // Also check if user exists, if not maybe insert? 
    // For now assuming user exists in public.users table.
}

export async function getFeaturedContent() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const thirtyDaysFuture = new Date();
    thirtyDaysFuture.setDate(thirtyDaysFuture.getDate() + 30);
    const now = new Date();

    // 1. Random Active Musician (logged in last 30 days)
    // We join query users and musicianProfiles to get profile data
    const activeMusicians = await db.select({
        id: musicianProfiles.id,
        name: musicianProfiles.name,
        profileImageUrl: musicianProfiles.profileImageUrl,
        instruments: musicianProfiles.instruments,
        genres: musicianProfiles.genres,
        userId: musicianProfiles.userId
    })
        .from(musicianProfiles)
        .innerJoin(users, eq(musicianProfiles.userId, users.id))
        .where(
            and(
                gt(users.lastActiveAt, thirtyDaysAgo),
                eq(musicianProfiles.isActive, true)
            )
        )
        .orderBy(sql`RANDOM()`)
        .limit(1);

    // 2. Random Band
    const randomBand = await db.select({
        id: bands.id,
        name: bands.name,
        profileImageUrl: bands.profileImageUrl,
        genres: bands.genres,
        location: bands.location
    })
        .from(bands)
        .where(eq(bands.isActive, true))
        .orderBy(sql`RANDOM()`)
        .limit(1);

    // 3. Random Upcoming Gig (next 30 days)
    const randomGig = await db.select({
        id: gigs.id,
        title: gigs.title,
        date: gigs.date,
        location: gigs.location,
        imageUrl: gigs.imageUrl,
        bandId: gigs.bandId,
        musicianId: gigs.musicianId
    })
        .from(gigs)
        .where(
            and(
                gte(gigs.date, now),
                lt(gigs.date, thirtyDaysFuture)
            )
        )
        .orderBy(sql`RANDOM()`)
        .limit(1);

    return {
        featuredMusician: activeMusicians[0] || null,
        featuredBand: randomBand[0] || null,
        featuredGig: randomGig[0] || null
    };
}

// CodeRabbit Audit Trigger
