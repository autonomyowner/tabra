import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Update user profile
export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.preferredLanguage !== undefined) updates.preferredLanguage = args.preferredLanguage;

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});

// Toggle favorite doctor
export const toggleFavorite = mutation({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify doctor exists
    const doctor = await ctx.db.get(args.doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const currentFavorites = user.favoriteDoctorIds || [];
    const isFavorite = currentFavorites.includes(args.doctorId);

    let newFavorites: typeof currentFavorites;
    if (isFavorite) {
      // Remove from favorites
      newFavorites = currentFavorites.filter((id) => id !== args.doctorId);
    } else {
      // Add to favorites
      newFavorites = [...currentFavorites, args.doctorId];
    }

    await ctx.db.patch(user._id, {
      favoriteDoctorIds: newFavorites,
      updatedAt: Date.now(),
    });

    return { isFavorite: !isFavorite };
  },
});

// Internal mutation to create user from webhook
export const createFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      preferredLanguage: "ar", // Default to Arabic
      favoriteDoctorIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Internal mutation to update user from webhook
export const updateFromWebhook = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return null;
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.email !== undefined) updates.email = args.email;
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;

    await ctx.db.patch(user._id, updates);

    return user._id;
  },
});

// Internal mutation to delete user from webhook
export const deleteFromWebhook = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
      return true;
    }

    return false;
  },
});
