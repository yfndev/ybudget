"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { budgetAgent } from "./agent";

export const generate = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
    userId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    await budgetAgent.streamText(
      { ...ctx, userId: args.userId, organizationId: args.organizationId },
      { threadId: args.threadId },
      { promptMessageId: args.promptMessageId },
      { saveStreamDeltas: true },
    );
  },
});
