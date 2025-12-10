import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("create team", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const teamId = await t
    .withIdentity({ subject: userId })
    .mutation(api.teams.functions.createTeam, { name: "New Team" });

  const team = await t.run((ctx) => ctx.db.get(teamId));
  expect(team?.name).toBe("New Team");
});

test("rename team", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const teamId = await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "Old Name",
      organizationId,
      memberIds: [],
      projectIds: [],
      createdBy: userId,
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.teams.functions.renameTeam, { teamId, name: "New Name" });

  const team = await t.run((ctx) => ctx.db.get(teamId));
  expect(team?.name).toBe("New Name");
});

test("add team member", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const teamId = await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "Team",
      organizationId,
      memberIds: [],
      projectIds: [],
      createdBy: userId,
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.teams.functions.addTeamMember, { teamId, userId });

  const team = await t.run((ctx) => ctx.db.get(teamId));
  expect(team?.memberIds).toContain(userId);
});

test("remove team member", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  const teamId = await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "Team",
      organizationId,
      memberIds: [memberUserId],
      projectIds: [],
      createdBy: userId,
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.teams.functions.removeTeamMember, {
      teamId,
      userId: memberUserId,
    });

  const team = await t.run((ctx) => ctx.db.get(teamId));
  expect(team?.memberIds).not.toContain(memberUserId);
});

test("assign project to team", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const teamId = await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "Team",
      organizationId,
      memberIds: [],
      projectIds: [],
      createdBy: userId,
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.teams.functions.assignProjectToTeam, { teamId, projectId });

  const team = await t.run((ctx) => ctx.db.get(teamId));
  expect(team?.projectIds).toContain(projectId);
});

test("remove project from team", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const teamId = await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "Team",
      organizationId,
      memberIds: [],
      projectIds: [projectId],
      createdBy: userId,
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.teams.functions.removeProjectFromTeam, { teamId, projectId });

  const team = await t.run((ctx) => ctx.db.get(teamId));
  expect(team?.projectIds).not.toContain(projectId);
});

test("rename team from other organization throws access denied", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const otherTeamId = await t.run(async (ctx) => {
    const otherUserId = await ctx.db.insert("users", {
      email: "other@other.com",
    });
    const otherOrgId = await ctx.db.insert("organizations", {
      name: "Other Org",
      domain: "other.com",
      createdBy: otherUserId,
    });
    return ctx.db.insert("teams", {
      name: "Other Team",
      organizationId: otherOrgId,
      memberIds: [],
      projectIds: [],
      createdBy: otherUserId,
    });
  });

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.teams.functions.renameTeam, {
        teamId: otherTeamId,
        name: "Hacked Name",
      }),
  ).rejects.toThrow("Access denied");
});
