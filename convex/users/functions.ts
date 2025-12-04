import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { addLog } from "../logs/functions";
import { getCurrentUser } from "./getCurrentUser";
import { requireRole } from "./permissions";

export const addUserToOrganization = mutation({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("lead"), v.literal("member")),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      organizationId: args.organizationId,
      role: args.role ?? "lead",
    });
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("lead"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    const currentUser = await getCurrentUser(ctx);
    const targetUser = await ctx.db.get(args.userId);

    if (!targetUser) throw new Error("User not found");
    if (targetUser.organizationId !== currentUser.organizationId)
      throw new Error("Access denied");

    if (targetUser.role === "admin" && args.role !== "admin") {
      let adminCount = 0;
      const users = ctx.db
        .query("users")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", currentUser.organizationId),
        );
      for await (const user of users) {
        if (user.role === "admin") adminCount++;
        if (adminCount > 1) break;
      }
      if (adminCount <= 1)
        throw new Error(
          "Der letzte Admin kann nicht entfernt werden. Mindestens ein Admin ist erforderlich.",
        );
    }

    const oldRole = targetUser.role ?? "member";
    await ctx.db.patch(args.userId, { role: args.role });
    await addLog(
      ctx,
      currentUser.organizationId,
      currentUser._id,
      "user.role_change",
      args.userId,
      `${targetUser.name ?? targetUser.email}: ${oldRole} → ${args.role}`,
    );
  },
});

export const updateBankDetails = mutation({
  args: {
    iban: v.string(),
    bic: v.string(),
    accountHolder: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await ctx.db.patch(user._id, args);
  },
});
