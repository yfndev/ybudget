import { createThread, saveMessage } from "@convex-dev/agent";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { components, internal } from "../_generated/api";
import { mutation } from "../_generated/server";

export const sendMessage = mutation({
  args: {
    threadId: v.optional(v.string()),
    prompt: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) throw new Error("No organization");

    const threadId =
      args.threadId ?? (await createThread(ctx, components.agent, { userId }));

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      userId,
      message: { role: "user", content: args.prompt },
    });

    await ctx.scheduler.runAfter(0, internal.ai.actions.generate, {
      threadId,
      promptMessageId: messageId,
      userId,
      organizationId: user.organizationId,
    });

    return threadId;
  },
});
