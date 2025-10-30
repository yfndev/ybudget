import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";

export const getDonors = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("donors"),
      name: v.string(),
      type: v.union(v.literal("donation"), v.literal("sponsoring")),
      totalAgreed: v.number(),
      totalPaid: v.number(),
      totalOpen: v.number(),
    })
  ),
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const donors = await ctx.db
      .query("donors")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) => q.and(q.gt(q.field("amount"), 0), q.neq(q.field("donorId"), "")))
      .collect();

    return donors.map((donor) => {
      const donorId = donor._id.toString();
      const donorTransactions = transactions.filter(
        (t) => t.donorId === donorId
      );

      const totalAgreed = donorTransactions.reduce(
        (sum, t) => sum + (typeof t.amount === "number" && !isNaN(t.amount) ? t.amount : 0),
        0
      );

      const totalPaid = donorTransactions
        .filter((t) => t.status === "processed")
        .reduce(
          (sum, t) => sum + (typeof t.amount === "number" && !isNaN(t.amount) ? t.amount : 0),
          0
        );

      const totalOpen = Math.max(0, totalAgreed - totalPaid);

      return {
        _id: donor._id,
        name: donor.name,
        type: donor.type,
        totalAgreed: isNaN(totalAgreed) ? 0 : totalAgreed,
        totalPaid: isNaN(totalPaid) ? 0 : totalPaid,
        totalOpen: isNaN(totalOpen) ? 0 : totalOpen,
      };
    });
  },
});

export const getDonorById = query({
  args: { donorId: v.id("donors") },
  returns: v.union(
    v.object({
      _id: v.id("donors"),
      name: v.string(),
      type: v.union(v.literal("donation"), v.literal("sponsoring")),
      totalAgreed: v.number(),
      totalPaid: v.number(),
      totalOpen: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return null;

    const donor = await ctx.db.get(args.donorId);
    if (!donor || donor.organizationId !== user.organizationId) {
      return null;
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) =>
        q.and(
          q.gt(q.field("amount"), 0),
          q.neq(q.field("donorId"), ""),
          q.eq(q.field("donorId"), args.donorId.toString())
        )
      )
      .collect();

    const totalAgreed = transactions.reduce(
      (sum, t) => sum + (typeof t.amount === "number" && !isNaN(t.amount) ? t.amount : 0),
      0
    );
    const totalPaid = transactions
      .filter((t) => t.status === "processed")
      .reduce(
        (sum, t) => sum + (typeof t.amount === "number" && !isNaN(t.amount) ? t.amount : 0),
        0
      );
    const totalOpen = Math.max(0, totalAgreed - totalPaid);

    return {
      _id: donor._id,
      name: donor.name,
      type: donor.type,
      totalAgreed: isNaN(totalAgreed) ? 0 : totalAgreed,
      totalPaid: isNaN(totalPaid) ? 0 : totalPaid,
      totalOpen: isNaN(totalOpen) ? 0 : totalOpen,
    };
  },
});

export const getDonorTransactions = query({
  args: { donorId: v.id("donors") },
  returns: v.array(
    v.object({
      _id: v.id("transactions"),
      projectId: v.string(),
      date: v.number(),
      amount: v.number(),
      description: v.string(),
      counterparty: v.string(),
      categoryId: v.string(),
      status: v.union(v.literal("expected"), v.literal("processed")),
    })
  ),
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("donorId"), args.donorId.toString()),
          q.gt(q.field("amount"), 0)
        )
      )
      .collect();

    return transactions.map((t) => ({
      _id: t._id,
      projectId: t.projectId,
      date: t.date,
      amount: t.amount,
      description: t.description,
      counterparty: t.counterparty,
      categoryId: t.categoryId,
      status: t.status,
    }));
  },
});