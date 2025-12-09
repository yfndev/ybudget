import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("update user role successfully", async () => {
  const ctx = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(ctx);

  const targetUserId = await ctx.run(async (db) =>
    db.db.insert("users", { email: "lead@test.com", organizationId, role: "lead" })
  );

  await ctx.withIdentity({ subject: userId }).mutation(api.users.functions.updateUserRole, {
    userId: targetUserId,
    role: "admin",
  });

  const updated = await ctx.run(async (db) => db.db.get(targetUserId));
  expect(updated?.role).toBe("admin");
});



test("cannot remove an admin if there is no other admin left", async () => {
  const ctx = convexTest(schema, modules);
  const { userId } = await setupTestData(ctx);

  await expect(
    ctx.withIdentity({ subject: userId }).mutation(api.users.functions.updateUserRole, {
      userId,
      role: "lead",
    })
  ).rejects.toThrow();
});



test("member/lead can't update roles", async () => {
  const ctx = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(ctx);

  const leadUserId = await ctx.run(async (db) =>
    db.db.insert("users", { email: "lead@test.com", organizationId, role: "lead" })
  );

  await expect(
    ctx.withIdentity({ subject: leadUserId }).mutation(api.users.functions.updateUserRole, {
      userId,
      role: "member",
    })
  ).rejects.toThrow();
});