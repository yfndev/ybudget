import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get logs", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(test);

  await test.run(async (ctx) => {
    await ctx.db.insert("logs", {
      organizationId,
      userId,
      action: "testAction",
      entityId: "testEntityId",
    });
  });

  const user = test.withIdentity({ subject: userId });
  const logs = await user.query(api.logs.queries.getLogs, {});
  expect(logs).toHaveLength(1);
  expect(logs[0].action).toBe("testAction");
});
