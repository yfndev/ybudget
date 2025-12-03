import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function addLog(
  ctx: MutationCtx,
  organizationId: Id<"organizations">,
  userId: Id<"users">,
  action: string,
  entityId: string,
  details?: string,
) {
  await ctx.db.insert("logs", {
    organizationId,
    userId,
    action,
    entityId,
    details,
  });
}
