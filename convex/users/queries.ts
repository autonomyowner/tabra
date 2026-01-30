import { query } from "../_generated/server";
import { v } from "convex/values";

// Get the current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// Get user by Clerk ID (internal use)
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Get user's favorite doctors
export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !user.favoriteDoctorIds || user.favoriteDoctorIds.length === 0) {
      return [];
    }

    // Fetch all favorite doctors
    const doctors = await Promise.all(
      user.favoriteDoctorIds.map((id) => ctx.db.get(id))
    );

    return doctors.filter(Boolean);
  },
});

// Check if a doctor is in favorites
export const isFavorite = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !user.favoriteDoctorIds) {
      return false;
    }

    return user.favoriteDoctorIds.includes(args.doctorId);
  },
});
