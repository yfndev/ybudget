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

    const creatorIds = [...new Set(completed.map((i) => i.createdBy))];
    const projectIds = [...new Set(completed.map((i) => i.projectId))];

    const [organization, creators, projects] = await Promise.all([
      ctx.db.get(user.organizationId),
      Promise.all(creatorIds.map((id) => ctx.db.get(id))),
      Promise.all(projectIds.map((id) => ctx.db.get(id))),
    ]);

    const creatorMap = new Map(
      creators.filter(Boolean).map((c) => [c!._id, c!.name]),
    );
    const projectMap = new Map(
      projects.filter(Boolean).map((p) => [p!._id, p!.name]),
    );

    return completed.map((item) => ({
      ...item,
      creatorName: creatorMap.get(item.createdBy) || "Unknown",
      projectName: projectMap.get(item.projectId) || "Unknown",
      organizationName: organization?.name || "",
    }));
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
