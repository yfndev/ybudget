import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("getOrganizationByDomain returns existing org", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const result = await t
    .withIdentity({ subject: userId })
    .query(api.organizations.queries.getOrganizationByDomain, {});

  expect(result.exists).toBe(true);
});

test("getOrganizationByDomain returns false when no email", async () => {
  const t = convexTest(schema, modules);
  const { organizationId } = await setupTestData(t);

  const userIdNoEmail = await t.run((ctx) =>
    ctx.db.insert("users", { organizationId }),
  );

  const result = await t
    .withIdentity({ subject: userIdNoEmail })
    .query(api.organizations.queries.getOrganizationByDomain, {});

  expect(result.exists).toBe(false);
});

test("getOrganizationByDomain returns false for unknown domain", async () => {
  const t = convexTest(schema, modules);
  const { organizationId } = await setupTestData(t);

  const userIdOtherDomain = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "user@otherdomain.com",
      organizationId,
    }),
  );

  const result = await t
    .withIdentity({ subject: userIdOtherDomain })
    .query(api.organizations.queries.getOrganizationByDomain, {});

  expect(result.exists).toBe(false);
});
