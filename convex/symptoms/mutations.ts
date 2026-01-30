import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Store a symptom analysis
export const storeAnalysis = mutation({
  args: {
    userId: v.optional(v.id("users")),
    sessionId: v.optional(v.string()),
    symptoms: v.string(),
    language: v.string(),
    analysis: v.object({
      possibleConditions: v.array(
        v.object({
          name: v.string(),
          name_ar: v.optional(v.string()),
          probability: v.string(),
          description: v.optional(v.string()),
        })
      ),
      recommendedSpecialty: v.string(),
      recommendedSpecialty_ar: v.optional(v.string()),
      urgencyLevel: v.string(),
      generalAdvice: v.optional(v.string()),
      generalAdvice_ar: v.optional(v.string()),
      disclaimer: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const analysisId = await ctx.db.insert("symptomAnalyses", {
      userId: args.userId,
      sessionId: args.sessionId,
      symptoms: args.symptoms,
      language: args.language,
      analysis: args.analysis,
      createdAt: Date.now(),
    });

    return analysisId;
  },
});

// Get user's symptom analysis history
export const getMyAnalyses = mutation({
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
