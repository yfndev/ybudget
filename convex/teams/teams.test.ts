import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("create team", async () => {
  const test = convexTest(schema, modules);
  const { userId } = await setupTestData(test);

  const user = test.withIdentity({ subject: userId });
  const teamId = await user.mutation(api.teams.functions.createTeam, {
    name: "New Team",
  });

  const team = await test.run(async (ctx) => ctx.db.get(teamId));
  expect(team?.name).toBe("New Team");
  expect(team?.memberIds).toEqual([]);
});

test("add team member", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(test);

  const teamId = await test.run(async (ctx) =>
    ctx.db.insert("teams", {
      name: "Team",
      organizationId,
      memberIds: [],
      projectIds: [],
      createdBy: userId,
    }),
  );

  const user = test.withIdentity({ subject: userId });
  await user.mutation(api.teams.functions.addTeamMember, { teamId, userId });

  const team = await test.run(async (ctx) => ctx.db.get(teamId));
  expect(team?.memberIds).toContain(userId);
});
