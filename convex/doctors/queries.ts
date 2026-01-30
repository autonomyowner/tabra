import { query } from "../_generated/server";
import { v } from "convex/values";

// List all doctors with optional filters
export const listDoctors = query({
  args: {
    type: v.optional(v.string()),
    specialty: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("doctors");

    // Apply filters based on available indexes
    if (args.wilaya && args.specialty) {
      q = q.withIndex("by_wilaya_and_specialty", (q) =>
        q.eq("wilaya", args.wilaya!).eq("specialty", args.specialty!)
      );
    } else if (args.type && args.specialty) {
      q = q.withIndex("by_type_and_specialty", (q) =>
        q.eq("type", args.type!).eq("specialty", args.specialty!)
      );
    } else if (args.type) {
      q = q.withIndex("by_type", (q) => q.eq("type", args.type!));
    } else if (args.specialty) {
      q = q.withIndex("by_specialty", (q) => q.eq("specialty", args.specialty!));
    } else if (args.wilaya) {
      q = q.withIndex("by_wilaya", (q) => q.eq("wilaya", args.wilaya!));
    }

    const doctors = await q.collect();

    // Filter for active doctors and apply limit
    const activeDoctors = doctors.filter((d) => d.isActive !== false);

    if (args.limit) {
      return activeDoctors.slice(0, args.limit);
    }

    return activeDoctors;
  },
});

// Search doctors by name
export const searchDoctors = query({
  args: {
    searchQuery: v.string(),
    type: v.optional(v.string()),
    specialty: v.optional(v.string()),
    wilaya: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let searchBuilder = ctx.db
      .query("doctors")
      .withSearchIndex("search_doctors", (q) => {
        let search = q.search("name_en", args.searchQuery);
        if (args.type) search = search.eq("type", args.type);
        if (args.specialty) search = search.eq("specialty", args.specialty);
        if (args.wilaya) search = search.eq("wilaya", args.wilaya);
        return search;
      });

    const results = await searchBuilder.collect();

    // Filter for active doctors
    const activeDoctors = results.filter((d) => d.isActive !== false);

    if (args.limit) {
      return activeDoctors.slice(0, args.limit);
    }

    return activeDoctors;
  },
});

// Get a single doctor by ID
export const getDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.doctorId);
  },
});

// Get all unique specialties
export const getSpecialties = query({
  args: {},
  handler: async (ctx) => {
    const doctors = await ctx.db.query("doctors").collect();

    const specialtyMap = new Map<string, { specialty: string; specialty_ar?: string; count: number }>();

    for (const doctor of doctors) {
      if (doctor.isActive === false) continue;

      const existing = specialtyMap.get(doctor.specialty);
      if (existing) {
        existing.count += 1;
      } else {
        specialtyMap.set(doctor.specialty, {
          specialty: doctor.specialty,
          specialty_ar: doctor.specialty_ar,
          count: 1,
        });
      }
    }

    return Array.from(specialtyMap.values()).sort((a, b) => b.count - a.count);
  },
});

// Get all unique wilayas
export const getWilayas = query({
  args: {},
  handler: async (ctx) => {
    const doctors = await ctx.db.query("doctors").collect();

    const wilayaMap = new Map<string, number>();

    for (const doctor of doctors) {
      if (doctor.isActive === false) continue;

      const count = wilayaMap.get(doctor.wilaya) || 0;
      wilayaMap.set(doctor.wilaya, count + 1);
    }

    return Array.from(wilayaMap.entries())
      .map(([wilaya, count]) => ({ wilaya, count }))
      .sort((a, b) => a.wilaya.localeCompare(b.wilaya));
  },
});

// Get doctors near a location
export const getDoctorsNearLocation = query({
  args: {
    lat: v.number(),
    lng: v.number(),
    radiusKm: v.optional(v.number()), // Default 10km
    specialty: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radiusKm = args.radiusKm || 10;

    let doctors = await ctx.db.query("doctors").collect();

    // Filter for active doctors
    doctors = doctors.filter((d) => d.isActive !== false);

    // Filter by specialty if provided
    if (args.specialty) {
      doctors = doctors.filter((d) => d.specialty === args.specialty);
    }

    // Calculate distance and filter
    const doctorsWithDistance = doctors
      .map((doctor) => {
        const distance = calculateDistance(
          args.lat,
          args.lng,
          doctor.coordinates.lat,
          doctor.coordinates.lng
        );
        return { ...doctor, distance };
      })
      .filter((d) => d.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    if (args.limit) {
      return doctorsWithDistance.slice(0, args.limit);
    }

    return doctorsWithDistance;
  },
});

// Get doctor reviews
export const getDoctorReviews = query({
  args: {
    doctorId: v.id("doctors"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_doctorId", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();

    // Get user info for non-anonymous reviews
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        if (review.isAnonymous) {
          return { ...review, user: null };
        }
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          user: user
            ? { firstName: user.firstName, lastName: user.lastName }
            : null,
        };
      })
    );

    if (args.limit) {
      return reviewsWithUsers.slice(0, args.limit);
    }

    return reviewsWithUsers;
  },
});

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
