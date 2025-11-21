import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

async function isOrgAdmin(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

export async function getUserAccessibleProjectIds(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  organizationId: Id<"organizations">,
): Promise<Id<"projects">[]> {
  if (await isOrgAdmin(ctx, userId)) {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId),
      )
      .collect();
    return projects.map((p) => p._id);
  }

  const teams = await ctx.db
    .query("teams")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();

  const projectIds = new Set<Id<"projects">>();
  for (const team of teams) {
    if (team.memberIds.includes(userId)) {
      team.projectIds.forEach((pid) => projectIds.add(pid));
    }
  }
  return Array.from(projectIds);
}

export async function canAccessProject(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  projectId: Id<"projects">,
): Promise<boolean> {
  if (await isOrgAdmin(ctx, userId)) return true;

  const project = await ctx.db.get(projectId);
  if (!project) return false;

  const teams = await ctx.db
    .query("teams")
    .withIndex("by_organization", (q) =>
      q.eq("organizationId", project.organizationId),
    )
    .collect();

  return teams.some(
    (team) =>
      team.memberIds.includes(userId) && team.projectIds.includes(projectId),
  );
}

export async function filterByProjectAccess<
  T extends { projectId?: Id<"projects"> },
>(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  organizationId: Id<"organizations">,
  items: T[],
): Promise<T[]> {
  const accessibleIds = await getUserAccessibleProjectIds(
    ctx,
    userId,
    organizationId,
  );
  return items.filter(
    (item) => item.projectId && accessibleIds.includes(item.projectId),
  );
}
