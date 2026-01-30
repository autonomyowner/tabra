import { query } from "../_generated/server";
import { v } from "convex/values";

// Get user's symptom analysis history
export const getMyAnalyses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const analyses = await ctx.db
      .query("symptomAnalyses")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    if (args.limit) {
      return analyses.slice(0, args.limit);
    }

    return analyses;
  },
});

// Get a single analysis by ID
export const getAnalysis = query({
  args: { analysisId: v.id("symptomAnalyses") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      return null;
    }

    // Check if user has access
    const identity = await ctx.auth.getUserIdentity();

    if (analysis.userId) {
      // If analysis has a userId, verify ownership
      if (!identity) {
        return null;
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!user || analysis.userId !== user._id) {
        return null;
      }
    }

    return analysis;
  },
});
