import { v } from "convex/values";
import { query } from "../_generated/server";
import { getProjectName } from "../helpers/getProjectName";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllTransactions = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const transactions = await (args.projectId
      ? ctx.db
          .query("transactions")
          .withIndex("by_organization_project", (q) =>
            q.eq("organizationId", user.organizationId).eq("projectId", args.projectId)
          )
      : ctx.db
          .query("transactions")
          .withIndex("by_organization", (q) =>
            q.eq("organizationId", user.organizationId)
          )
    ).collect();

    return Promise.all(
      transactions.map(async (t) => ({
        ...t,
        projectName: t.projectId ? await getProjectName(ctx, t.projectId) : undefined,
      }))
    );
  },
});

export const getUnassignedProcessedTransactions = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization_project", (q) =>
        q.eq("organizationId", user.organizationId).eq("projectId", undefined)
      )
      .filter((q) => q.eq(q.field("status"), "processed"))
      .collect();

    return transactions;
  },
});

export const getTransactionRecommendations = query({
  args: {
    amount: v.number(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const transactions = (await ctx.db
      .query("transactions")
      .withIndex("by_organization_project", (q) =>
        q.eq("organizationId", user.organizationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "expected"),
          q.neq(q.field("projectId"), undefined),
          q.lt(q.field("amount"), 0)
        )
      )
      .collect()).filter(
        (t) => !t.matchedTransactionId || t.matchedTransactionId === ""
      );

    return Promise.all(
      transactions.map(async (t) => ({
        ...t,
        projectName: t.projectId ? await getProjectName(ctx, t.projectId) : undefined,
      }))
    );
  },
});

export const getPaginatedTransactions = query({
  args: {
    projectId: v.optional(v.id("projects")),
    donorId: v.optional(v.id("donors")),
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
      id: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    let dbQuery = ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId)
      );

    if (args.projectId) {
      dbQuery = dbQuery.filter((q) => q.eq(q.field("projectId"), args.projectId));
    }

    if (args.donorId) {
      dbQuery = dbQuery.filter((q) => q.eq(q.field("donorId"), args.donorId));
    }

    const result = await dbQuery
      .order("desc")
      .paginate({
        numItems: args.paginationOpts.numItems,
        cursor: args.paginationOpts.cursor,
      });

    const page = await Promise.all(
      result.page.map(async (t) => ({
        ...t,
        projectName: t.projectId ? await getProjectName(ctx, t.projectId) : undefined,
      }))
    );

    return { ...result, page };
  },
});