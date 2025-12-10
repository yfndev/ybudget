import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("return all teams of an organization", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const teams = await t
    .withIdentity({ subject: userId })
    .query(api.teams.queries.getAllTeams, {});

  expect(teams.length).toBeGreaterThanOrEqual(1);
});

test("return team by id", async () => {
  const t = convexTest(schema, modules);
  const { userId, teamId } = await setupTestData(t);

  const team = await t
    .withIdentity({ subject: userId })
    .query(api.teams.queries.getTeam, { teamId });

  expect(team?.name).toBe("Test Team");
});

test("return all teams user belongs to", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const teams = await t
    .withIdentity({ subject: userId })
    .query(api.teams.queries.getUserTeams, { userId });

  expect(teams.length).toBeGreaterThanOrEqual(1);
  expect(teams[0].teamName).toBe("Test Team");
  expect(teams[0].projectCount).toBe(1);
});

test("return empty if user not in any team", async () => {
  const t = convexTest(schema, modules);
  const { organizationId } = await setupTestData(t);

  const otherUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "other@test.com",
      organizationId,
      role: "member",
    }),
  );

  const teams = await t
    .withIdentity({ subject: otherUserId })
    .query(api.teams.queries.getUserTeams, { userId: otherUserId });

  expect(teams).toHaveLength(0);
});
