import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type TeamRole = "viewer" | "editor" | "admin";

const roleHierarchy = { viewer: 1, editor: 2, admin: 3 } as const;

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

  const memberships = await ctx.db
    .query("teamMemberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const projectIds = new Set<Id<"projects">>();
  for (const { teamId } of memberships) {
    const teamProjects = await ctx.db
      .query("teamProjects")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();
    teamProjects.forEach((tp) => projectIds.add(tp.projectId));
  }

  return Array.from(projectIds);
}

export async function canAccessProject(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  projectId: Id<"projects">,
  requiredRole: TeamRole = "viewer",
): Promise<boolean> {
  if (await isOrgAdmin(ctx, userId)) return true;

  const userTeams = await ctx.db
    .query("teamMemberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const projectTeams = await ctx.db
    .query("teamProjects")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();

  const projectTeamIds = new Set(projectTeams.map((pt) => pt.teamId));
  const relevantMemberships = userTeams.filter((m) =>
    projectTeamIds.has(m.teamId),
  );

  if (relevantMemberships.length === 0) return false;

  const highestRole = Math.max(
    ...relevantMemberships.map((m) => roleHierarchy[m.role]),
  );

  return highestRole >= roleHierarchy[requiredRole];
}

export async function isTeamAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  teamId: Id<"teams">,
): Promise<boolean> {
  if (await isOrgAdmin(ctx, userId)) return true;

  const membership = await ctx.db
    .query("teamMemberships")
    .withIndex("by_user_team", (q) =>
      q.eq("userId", userId).eq("teamId", teamId),
    )
    .first();

  return membership?.role === "admin";
}

export async function filterByProjectAccess<T extends { projectId?: Id<"projects"> }>(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  organizationId: Id<"organizations">,
  items: T[],
): Promise<T[]> {
  const accessibleIds = await getUserAccessibleProjectIds(ctx, userId, organizationId);
  return items.filter((item) => item.projectId && accessibleIds.includes(item.projectId));
}

