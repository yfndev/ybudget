import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function addProjectNames<T extends { projectId?: Id<"projects"> }>(
  ctx: QueryCtx,
  items: T[],
): Promise<(T & { projectName?: string })[]> {
  const uniqueProjectIds = [
    ...new Set(items.map((t) => t.projectId).filter(Boolean)),
  ];
  const projects = await Promise.all(
    uniqueProjectIds.map((id) => ctx.db.get(id!)),
  );
  const projectMap = new Map(
    projects.filter(Boolean).map((p) => [p!._id, p!.name]),
  );

  return items.map((t) => ({
    ...t,
    projectName: t.projectId ? projectMap.get(t.projectId) : undefined,
  }));
}
