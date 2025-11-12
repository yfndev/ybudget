import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { addProjectAndCategoryNames } from "../helpers/addProjectNames";
import { filterByProjectAccess } from "../teams/permissions";
import { getCurrentUser } from "../users/getCurrentUser";

type EnrichedTransaction = Doc<"transactions"> & {
  projectName?: string;
  categoryName?: string;
};

export const getAllTransactions = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getCurrentUser(ctx);

    const transactions = await (
      args.projectId
        ? ctx.db
            .query("transactions")
            .withIndex("by_organization_project", (q) =>
              q
                .eq("organizationId", user.organizationId)
                .eq("projectId", args.projectId),
            )
        : ctx.db
            .query("transactions")
            .withIndex("by_organization", (q) =>
              q.eq("organizationId", user.organizationId),
            )
    ).collect();

    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      user.organizationId,
      transactions,
    );

    return addProjectAndCategoryNames(ctx, filtered);
  },
});

export const getUnassignedProcessedTransactions = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getCurrentUser(ctx);

    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    const unassigned = allTransactions.filter(
      (t) =>
        t.status === "processed" &&
        (!t.projectId || !t.categoryId || !t.donorId || t.donorId === ""),
    );

    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      user.organizationId,
      unassigned,
    );

    return filtered.sort((a, b) => b.date - a.date);
  },
});

export const getTransactionRecommendations = query({
  args: {
    amount: v.number(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getCurrentUser(ctx);

    const transactions = (
      await ctx.db
        .query("transactions")
        .withIndex("by_organization_project", (q) =>
          q.eq("organizationId", user.organizationId),
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "expected"),
            q.neq(q.field("projectId"), undefined),
            q.lt(q.field("amount"), 0),
          ),
        )
        .collect()
    ).filter((t) => !t.matchedTransactionId || t.matchedTransactionId === "");

    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      user.organizationId,
      transactions,
    );

    return addProjectAndCategoryNames(ctx, filtered);
  },
});

export const getPaginatedTransactions = query({
  args: {
    projectId: v.optional(v.id("projects")),
    donorId: v.optional(v.id("donors")),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(v.any()),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    continueCursor: string;
    isDone: boolean;
    splitCursor?: string;
    page: EnrichedTransaction[];
  }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        isDone: true,
        continueCursor: "",
        page: [],
      };
    }

    const user = await getCurrentUser(ctx);

    let dbQuery;
    if (args.projectId && args.donorId) {
      dbQuery = ctx.db
        .query("transactions")
        .withIndex("by_organization_project", (q) =>
          q
            .eq("organizationId", user.organizationId)
            .eq("projectId", args.projectId),
        )
        .filter((q) => q.eq(q.field("donorId"), args.donorId));
    } else if (args.projectId) {
      dbQuery = ctx.db
        .query("transactions")
        .withIndex("by_organization_project", (q) =>
          q
            .eq("organizationId", user.organizationId)
            .eq("projectId", args.projectId),
        );
    } else if (args.donorId) {
      dbQuery = ctx.db
        .query("transactions")
        .withIndex("by_organization_donor", (q) =>
          q
            .eq("organizationId", user.organizationId)
            .eq("donorId", args.donorId),
        );
    } else {
      dbQuery = ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId),
        );
    }

    const result = await dbQuery.order("desc").paginate({
      numItems: args.paginationOpts.numItems,
      cursor: args.paginationOpts.cursor,
    });

    const filtered = await filterByProjectAccess(
      ctx,
      user._id,
      user.organizationId,
      result.page,
    );

    const page = await addProjectAndCategoryNames(ctx, filtered);

    return {
      isDone: result.isDone,
      continueCursor: result.continueCursor as string,
      page,
    };
  },
});
