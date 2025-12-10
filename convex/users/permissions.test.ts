import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("admin can call admin function", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const teamId = await t
    .withIdentity({ subject: userId })
    .mutation(api.teams.functions.createTeam, { name: "Test Team" });

  expect(teamId).toBeDefined();
});

test("member cannot call admin function", async () => {
  const t = convexTest(schema, modules);
  const { organizationId } = await setupTestData(t);

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  await expect(
    t
      .withIdentity({ subject: memberUserId })
      .mutation(api.teams.functions.createTeam, { name: "Test Team" }),
  ).rejects.toThrow("Insufficient permissions");
});

test("lead cannot call admin function", async () => {
  const t = convexTest(schema, modules);
  const { organizationId } = await setupTestData(t);

  const leadUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "lead@test.com",
      organizationId,
      role: "lead",
    }),
  );

  await expect(
    t
      .withIdentity({ subject: leadUserId })
      .mutation(api.teams.functions.createTeam, { name: "Test Team" }),
  ).rejects.toThrow("Insufficient permissions");
});
