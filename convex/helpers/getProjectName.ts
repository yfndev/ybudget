import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

export async function getProjectName(
  ctx: QueryCtx,
  projectId: string
): Promise<string | undefined> {
  const project = await ctx.db.get(projectId as Id<"projects">);
  return project?.name;
}
