import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

const formData = (storageId: any, amount = 500) => ({
  amount,
  iban: "DE12345678900000000000",
  bic: "TESTBIC",
  accountHolder: "Test User",
  activityDescription: "Test Beschreibung",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  volunteerName: "Max Mustermann",
  volunteerStreet: "Teststr. 1",
  volunteerPlz: "12345",
  volunteerCity: "Berlin",
  signatureStorageId: storageId,
});

test("create volunteer allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.create, {
      projectId,
      ...formData(storageId),
    });

  const all = await t.run((ctx) =>
    ctx.db.query("volunteerAllowance").collect(),
  );
  expect(all).toHaveLength(1);
  expect(all[0].amount).toBe(500);
});

test("creating fails if amount exceeds 840€", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.volunteerAllowance.functions.create, {
        projectId,
        ...formData(storageId, 900),
      }),
  ).rejects.toThrow("Volunteer allowance cannot exceed 840€");
});

test("approve volunteer allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  const id = await t.run((ctx) =>
    ctx.db.insert("volunteerAllowance", {
      organizationId,
      projectId,
      createdBy: userId,
      isApproved: false,
      ...formData(storageId),
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.approve, { id });

  const doc = await t.run((ctx) => ctx.db.get(id));
  expect(doc?.isApproved).toBe(true);
});

test("reject volunteer allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  const id = await t.run((ctx) =>
    ctx.db.insert("volunteerAllowance", {
      organizationId,
      projectId,
      createdBy: userId,
      isApproved: false,
      ...formData(storageId),
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.reject, {
      id,
      rejectionNote: "Missing docs",
    });

  const doc = await t.run((ctx) => ctx.db.get(id));
  expect(doc?.rejectionNote).toBe("Missing docs");
});

test("remove volunteer allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  const id = await t.run((ctx) =>
    ctx.db.insert("volunteerAllowance", {
      organizationId,
      projectId,
      createdBy: userId,
      isApproved: false,
      ...formData(storageId),
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.remove, { id });

  const doc = await t.run((ctx) => ctx.db.get(id));
  expect(doc).toBeNull();
});

test("createToken returns token", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const token = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createToken, { projectId });

  expect(typeof token).toBe("string");
});

test("generatePublicUploadUrl with valid token returns url", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const token = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createToken, { projectId });
  const url = await t.mutation(
    api.volunteerAllowance.functions.generatePublicUploadUrl,
    { token },
  );

  expect(typeof url).toBe("string");
});

test("generatePublicUploadUrl fails with invalid token throws error invalid link", async () => {
  const t = convexTest(schema, modules);
  await setupTestData(t);

  await expect(
    t.mutation(api.volunteerAllowance.functions.generatePublicUploadUrl, {
      token: "invalid",
    }),
  ).rejects.toThrow("Invalid link");
});

test("submitExternal completes allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const token = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createToken, { projectId });
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await t.mutation(api.volunteerAllowance.functions.submitExternal, {
    token,
    ...formData(storageId, 400),
  });

  const doc = await t.run((ctx) =>
    ctx.db
      .query("volunteerAllowance")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first(),
  );
  expect(doc?.amount).toBe(400);
  expect(doc?.usedAt).toBeDefined();
});

test("submitExternal fails if amount exceeds 840€", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const token = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createToken, { projectId });
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await expect(
    t.mutation(api.volunteerAllowance.functions.submitExternal, {
      token,
      ...formData(storageId, 900),
    }),
  ).rejects.toThrow("Volunteer allowance cannot exceed 840€");
});

test("createSignatureToken returns token", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const token = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createSignatureToken, {});

  expect(typeof token).toBe("string");
});

test("generateSignatureUploadUrl with valid token returns url", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const token = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createSignatureToken, {});
  const url = await t.mutation(
    api.volunteerAllowance.functions.generateSignatureUploadUrl,
    { token },
  );

  expect(typeof url).toBe("string");
});

test("submitSignature stores signature", async () => {
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

  const doc = await t.run((ctx) =>
    ctx.db
      .query("signatureTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first(),
  );
  expect(doc?.signatureStorageId).toBe(storageId);
});
