import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get logs", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("logs", {
      organizationId,
      userId,
      action: "testAction",
      entityId: "testEntityId",
    }),
  );

  const logs = await t
    .withIdentity({ subject: userId })
    .query(api.logs.queries.getLogs, {});

  expect(logs).toHaveLength(1);
});
