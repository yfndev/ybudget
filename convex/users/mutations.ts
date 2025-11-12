import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireRole } from "./permissions";
import { getCurrentUser } from "./getCurrentUser";

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    const currentUser = await getCurrentUser(ctx);

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    if (targetUser.role === "admin" && args.role !== "admin") {
      const allUsers = await ctx.db
        .query("users")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", currentUser.organizationId),
        )
        .collect();

      const adminCount = allUsers.filter((u) => u.role === "admin").length;

      if (adminCount <= 1) {
        throw new Error(
          "Der letzte Admin kann nicht entfernt werden. Mindestens ein Admin ist erforderlich.",
        );
      }
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return null;
  },
});
