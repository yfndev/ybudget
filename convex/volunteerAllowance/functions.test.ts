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

test("createLink returns id", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const id = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createLink, { projectId });

  expect(typeof id).toBe("string");
});

test("generatePublicUploadUrl with valid id returns url", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const id = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createLink, { projectId });
  const url = await t.mutation(
    api.volunteerAllowance.functions.generatePublicUploadUrl,
    { id },
  );

  expect(typeof url).toBe("string");
});

test("generatePublicUploadUrl fails with invalid id throws error", async () => {
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
  await t.run((ctx) => ctx.db.delete(id));

  await expect(
    t.mutation(api.volunteerAllowance.functions.generatePublicUploadUrl, {
      id,
    }),
  ).rejects.toThrow("Ungültiger Link");
});

test("submitExternal completes allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const id = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createLink, { projectId });
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await t.mutation(api.volunteerAllowance.functions.submitExternal, {
    id,
    ...formData(storageId, 400),
  });

  const doc = await t.run((ctx) => ctx.db.get(id));
  expect(doc?.amount).toBe(400);
  expect(doc?.signatureStorageId).toBe(storageId);
});

test("submitExternal fails if amount exceeds 840€", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const id = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createLink, { projectId });
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await expect(
    t.mutation(api.volunteerAllowance.functions.submitExternal, {
      id,
      ...formData(storageId, 900),
    }),
  ).rejects.toThrow("Maximal 840€ erlaubt");
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

test("generatePublicUploadUrl fails with already signed allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  const id = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createLink, { projectId });

  await t.mutation(api.volunteerAllowance.functions.submitExternal, {
    id,
    ...formData(storageId, 400),
  });

  await expect(
    t.mutation(api.volunteerAllowance.functions.generatePublicUploadUrl, {
      id,
    }),
  ).rejects.toThrow("Bereits ausgefüllt");
});

test("submitExternal fails with already signed allowance", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  const id = await t
    .withIdentity({ subject: userId })
    .mutation(api.volunteerAllowance.functions.createLink, { projectId });

  await t.mutation(api.volunteerAllowance.functions.submitExternal, {
    id,
    ...formData(storageId, 400),
  });

  await expect(
    t.mutation(api.volunteerAllowance.functions.submitExternal, {
      id,
      ...formData(storageId, 400),
    }),
  ).rejects.toThrow("Bereits ausgefüllt");
});

test("generateSignatureUploadUrl fails with expired token", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("signatureTokens", {
      token: "expired-sig-upload",
      organizationId,
      createdBy: userId,
      expiresAt: Date.now() - 1000,
    }),
  );

  await expect(
    t.mutation(api.volunteerAllowance.functions.generateSignatureUploadUrl, {
      token: "expired-sig-upload",
    }),
  ).rejects.toThrow("Link expired");
});

test("generateSignatureUploadUrl fails with used token", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("signatureTokens", {
      token: "used-sig-upload",
      organizationId,
      createdBy: userId,
      expiresAt: Date.now() + 1000000,
      usedAt: Date.now() - 1000,
    }),
  );

  await expect(
    t.mutation(api.volunteerAllowance.functions.generateSignatureUploadUrl, {
      token: "used-sig-upload",
    }),
  ).rejects.toThrow("Link already used");
});

test("generateSignatureUploadUrl fails with invalid token", async () => {
  const t = convexTest(schema, modules);
  await setupTestData(t);

  await expect(
    t.mutation(api.volunteerAllowance.functions.generateSignatureUploadUrl, {
      token: "invalid",
    }),
  ).rejects.toThrow("Invalid link");
});

test("submitSignature fails with expired token", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await t.run((ctx) =>
    ctx.db.insert("signatureTokens", {
      token: "expired-submit-sig",
      organizationId,
      createdBy: userId,
      expiresAt: Date.now() - 1000,
    }),
  );

  await expect(
    t.mutation(api.volunteerAllowance.functions.submitSignature, {
      token: "expired-submit-sig",
      signatureStorageId: storageId,
    }),
  ).rejects.toThrow("Link expired");
});

test("submitSignature fails with used token", async () => {
  const t = convexTest(schema, modules);
  const { userId, organizationId } = await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await t.run((ctx) =>
    ctx.db.insert("signatureTokens", {
      token: "used-submit-sig",
      organizationId,
      createdBy: userId,
      expiresAt: Date.now() + 1000000,
      usedAt: Date.now() - 1000,
    }),
  );

  await expect(
    t.mutation(api.volunteerAllowance.functions.submitSignature, {
      token: "used-submit-sig",
      signatureStorageId: storageId,
    }),
  ).rejects.toThrow("Link already used");
});

test("submitSignature fails with invalid token", async () => {
  const t = convexTest(schema, modules);
  await setupTestData(t);
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sig"])));

  await expect(
    t.mutation(api.volunteerAllowance.functions.submitSignature, {
      token: "invalid",
      signatureStorageId: storageId,
    }),
  ).rejects.toThrow("Invalid link");
});

test("approve fails for non-existent allowance", async () => {
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

  await t.run((ctx) => ctx.db.delete(id));

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.volunteerAllowance.functions.approve, { id }),
  ).rejects.toThrow("Not found");
});

test("remove fails for non-existent allowance", async () => {
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

  await t.run((ctx) => ctx.db.delete(id));

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.volunteerAllowance.functions.remove, { id }),
  ).rejects.toThrow("Not found");
});
