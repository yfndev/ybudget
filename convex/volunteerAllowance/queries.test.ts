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

test("getAll filters out unsigned allowances", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createLink, { projectId });

  const results = await t
    .withIdentity({ subject: userId })
    .query(api.volunteerAllowance.queries.getAll, {});
  expect(results.every((r) => r.signatureStorageId)).toBe(true);
});

test("validateLink returns valid for unsigned allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const id = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createLink, { projectId });

  const result = await t.query(api.volunteerAllowance.queries.validateLink, {
    id,
  });
  expect(result.valid).toBe(true);
});

test("validateLink returns invalid for signed allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  const id = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createLink, { projectId });

  await t.mutation(api.volunteerAllowance.functions.submitExternal, {
    id,
    amount: 400,
    iban: "DE12345678900000000000",
    bic: "TESTBIC",
    accountHolder: "Test User",
    activityDescription: "Test",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    volunteerName: "Max Mustermann",
    volunteerStreet: "Teststr. 1",
    volunteerPlz: "12345",
    volunteerCity: "Berlin",
    signatureStorageId: storageId,
  });

  const result = await t.query(api.volunteerAllowance.queries.validateLink, {
    id,
  });
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Bereits ausgefüllt");
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


test("getAll returns allowances for non-admin user", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("volunteerAllowance", {
      ...baseAllowance(organizationId, projectId, memberUserId, storageId),
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("volunteerAllowance", {
      ...baseAllowance(organizationId, projectId, userId, storageId),
    }),
  );

  const results = await t
    .withIdentity({ subject: memberUserId })
    .query(api.volunteerAllowance.queries.getAll, {});

  expect(results.every((r) => r.createdBy === memberUserId)).toBe(true);
});

test("validateSignatureToken returns expired for expired token", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("signatureTokens", {
      token: "expired-sig-token",
      organizationId,
      createdBy: userId,
      expiresAt: Date.now() - 1000,
    }),
  );

  const result = await t.query(
    api.volunteerAllowance.queries.validateSignatureToken,
    { token: "expired-sig-token" },
  );
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Link expired");
});

test("validateSignatureToken returns used for already used token", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("signatureTokens", {
      token: "used-sig-token",
      organizationId,
      createdBy: userId,
      expiresAt: Date.now() + 1000000,
      usedAt: Date.now() - 1000,
    }),
  );

  const result = await t.query(
    api.volunteerAllowance.queries.validateSignatureToken,
    { token: "used-sig-token" },
  );
  expect(result.valid).toBe(false);
  expect(result.error).toBe("Link already used");
});
