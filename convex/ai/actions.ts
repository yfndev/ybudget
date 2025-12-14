"use node";

import { createThread } from "@convex-dev/agent";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { components } from "../_generated/api";
import { action } from "../_generated/server";
import { budgetAgent } from "./agent";

export const sendMessage = action({
  args: {
    threadId: v.optional(v.string()),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const resolvedThreadId =
      args.threadId ?? (await createThread(ctx, components.agent, { userId }));

    await budgetAgent.streamText(
      ctx,
      { threadId: resolvedThreadId },
      { prompt: args.prompt },
      { saveStreamDeltas: true },
    );

    return resolvedThreadId;
  },
});
