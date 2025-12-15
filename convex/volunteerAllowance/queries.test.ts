import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

const baseAllowance = (
  organizationId: any,
  projectId: any,
  userId: any,
  storageId: any,
) => ({
  organizationId,
  projectId,
  amount: 500,
  isApproved: false,
  iban: "DE123",
  bic: "BIC",
  accountHolder: "Test",
  createdBy: userId,
  activityDescription: "Jugendarbeit",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  volunteerName: "Test",
  volunteerStreet: "Test",
  volunteerPlz: "12345",
  volunteerCity: "Berlin",
  signatureStorageId: storageId,
});

test("return allowance by id", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  const id = await t.run((ctx) =>
    ctx.db.insert(
      "volunteerAllowance",
      baseAllowance(organizationId, projectId, userId, storageId),
    ),
  );

  const result = await t
    .withIdentity({ subject: userId })
    .query(api.volunteerAllowance.queries.get, { id });
  expect(result?.amount).toBe(500);
});

test("return all completed allowances", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await t.run((ctx) =>
    ctx.db.insert(
      "volunteerAllowance",
      baseAllowance(organizationId, projectId, userId, storageId),
    ),
  );

  const results = await t
    .withIdentity({ subject: userId })
    .query(api.volunteerAllowance.queries.getAll, {});
  expect(results.length).toBeGreaterThanOrEqual(1);
});

test("getAll filters out incomplete allowances", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await t.run((ctx) =>
    ctx.db.insert("volunteerAllowance", {
      ...baseAllowance(organizationId, projectId, userId, storageId),
      token: "test-token",
      expiresAt: Date.now() + 1000000,
    }),
  );

  const results = await t
    .withIdentity({ subject: userId })
    .query(api.volunteerAllowance.queries.getAll, {});
  expect(results.some((r) => r.token === "test-token" && !r.usedAt)).toBe(
    false,
  );
});

test("validateToken return valid token", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await t.run((ctx) =>
    ctx.db.insert("volunteerAllowance", {
      ...baseAllowance(organizationId, projectId, userId, storageId),
      token: "valid-token",
      expiresAt: Date.now() + 1000000,
    }),
  );

  const result = await t.query(api.volunteerAllowance.queries.validateToken, {
    token: "valid-token",
  });
  expect(result.valid).toBe(true);
});

test("validateToken returns invalid token", async () => {
  const t = convexTest(schema, modules);
  await setupTestData(t);

  const result = await t.query(api.volunteerAllowance.queries.validateToken, {
    token: "invalid",
  });
  expect(result.valid).toBe(false);
});

test("validateToken using expired token returns invalid", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await t.run((ctx) =>
    ctx.db.insert("volunteerAllowance", {
      ...baseAllowance(organizationId, projectId, userId, storageId),
      token: "expired-token",
      expiresAt: Date.now() - 1000,
    }),
  );

  const result = await t.query(api.volunteerAllowance.queries.validateToken, {
    token: "expired-token",
  });
  expect(result.valid).toBe(false);
});

test("getSignatureUrl returns url", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["test"])));
  const url = await t
    .withIdentity({ subject: userId })
    .query(api.volunteerAllowance.queries.getSignatureUrl, { storageId });

  expect(typeof url).toBe("string");
});

test("validateSignatureToken with valid token returns valid result", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const token = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createSignatureToken, {});
  const result = await t.query(
    api.volunteerAllowance.queries.validateSignatureToken,
    { token },
  );

  expect(result.valid).toBe(true);
});

test("validateSignatureToken with valid token returns invalid result", async () => {
  const t = convexTest(schema, modules);
  await setupTestData(t);

  const result = await t.query(
    api.volunteerAllowance.queries.validateSignatureToken,
    { token: "invalid" },
  );
  expect(result.valid).toBe(false);
});

test("getSignatureToken returns data", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const token = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createSignatureToken, {});
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));
  await t.mutation(api.volunteerAllowance.functions.submitSignature, {
    token,
    signatureStorageId: storageId,
  });

  const result = await t.query(
    api.volunteerAllowance.queries.getSignatureToken,
    { token },
  );
  expect(result?.signatureStorageId).toBe(storageId);
});

test("getSignatureToken returns null for using it with invalid token", async () => {
  const t = convexTest(schema, modules);
  await setupTestData(t);

  const result = await t.query(
    api.volunteerAllowance.queries.getSignatureToken,
    { token: "invalid" },
  );
  expect(result).toBeNull();
});
