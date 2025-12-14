import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const validateToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("volunteerAllowance")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!doc) return { valid: false, error: "Invalid link" } as const;
    if (doc.expiresAt && doc.expiresAt < Date.now())
      return { valid: false, error: "Link expired" } as const;
    if (doc.usedAt)
      return { valid: false, error: "Link already used" } as const;

    const [organization, project] = await Promise.all([
      ctx.db.get(doc.organizationId),
      ctx.db.get(doc.projectId),
    ]);

    return {
      valid: true,
      organizationName: organization?.name || "",
      projectName: project?.name || "",
      activityDescription: doc.activityDescription,
      startDate: doc.startDate,
      endDate: doc.endDate,
    } as const;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const isAdmin = user.role === "admin";

    const items = isAdmin
      ? await ctx.db
          .query("volunteerAllowance")
          .withIndex("by_organization", (q) =>
            q.eq("organizationId", user.organizationId),
          )
          .order("desc")
          .collect()
      : await ctx.db
          .query("volunteerAllowance")
          .withIndex("by_organization_and_createdBy", (q) =>
            q
              .eq("organizationId", user.organizationId)
              .eq("createdBy", user._id),
          )
          .order("desc")
          .collect();

    const completed = items.filter((i) => !i.token || i.usedAt);

    const organization = await ctx.db.get(user.organizationId);

    return Promise.all(
      completed.map(async (item) => {
        const [creator, project] = await Promise.all([
          ctx.db.get(item.createdBy),
          ctx.db.get(item.projectId),
        ]);
        return {
          ...item,
          creatorName: creator?.name || "Unknown",
          projectName: project?.name || "Unknown",
          organizationName: organization?.name || "",
        };
      }),
    );
  },
});

export const get = query({
  args: { id: v.id("volunteerAllowance") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const getSignatureUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return ctx.storage.getUrl(args.storageId);
  },
});

export const validateSignatureToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("signatureTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!doc) return { valid: false, error: "Invalid link" } as const;
    if (doc.expiresAt < Date.now())
      return { valid: false, error: "Link expired" } as const;
    if (doc.usedAt)
      return { valid: false, error: "Link already used" } as const;

    return { valid: true } as const;
  },
});

export const getSignatureToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("signatureTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!doc) return null;
    return {
      signatureStorageId: doc.signatureStorageId,
      usedAt: doc.usedAt,
    };
  },
});
