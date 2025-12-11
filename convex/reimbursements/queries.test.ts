import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get user bank details", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.patch(userId, {
      iban: "DE12345678900000000000",
      bic: "TESTBIC",
      accountHolder: "Test User",
    }),
  );

  const details = await t
    .withIdentity({ subject: userId })
    .query(api.reimbursements.queries.getUserBankDetails, {});

  expect(details.iban).toBe("DE12345678900000000000");
});

test("get user bank details returns empty when not set", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const details = await t
    .withIdentity({ subject: userId })
    .query(api.reimbursements.queries.getUserBankDetails, {});

  expect(details.iban).toBe("");
});

test("get expense reimbursement", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  const reimbursement = await t
    .withIdentity({ subject: userId })
    .query(api.reimbursements.queries.getReimbursement, { reimbursementId });

  expect(reimbursement?.type).toBe("expense");
});

test("get travel reimbursement with details", async () => {
  const t = convexTest(schema, modules);
  const { userId, travelReimbursementId } = await setupTestData(t);

  const reimbursement = await t
    .withIdentity({ subject: userId })
    .query(api.reimbursements.queries.getReimbursement, {
      reimbursementId: travelReimbursementId,
    });

  expect(reimbursement?.type).toBe("travel");
});

test("get reimbursement returns null when not found", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  await t.run((ctx) => ctx.db.delete(reimbursementId));

  const reimbursement = await t
    .withIdentity({ subject: userId })
    .query(api.reimbursements.queries.getReimbursement, { reimbursementId });

  expect(reimbursement).toBeNull();
});

test("get receipts returns empty", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  const receipts = await t
    .withIdentity({ subject: userId })
    .query(api.reimbursements.queries.getReceipts, { reimbursementId });

  expect(receipts).toHaveLength(0);
});

test("admin sees all reimbursements", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const otherUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "other@test.com",
      organizationId,
      role: "member",
    }),
  );

  await t.run(async (ctx) => {
    await ctx.db.insert("reimbursements", {
      organizationId,
      projectId,
      amount: 100,
      type: "expense",
      status: "pending",
      iban: "DE12340000000000000000",
      bic: "BIC",
      accountHolder: "Admin",
      createdBy: userId,
    });
    await ctx.db.insert("reimbursements", {
      organizationId,
      projectId,
      amount: 200,
      type: "expense",
      status: "pending",
      iban: "DE12340000000000000000",
      bic: "BIC",
      accountHolder: "Other",
      createdBy: otherUserId,
    });
  });

  const reimbursements = await t
    .withIdentity({ subject: userId })
    .query(api.reimbursements.queries.getAllReimbursements, {});

  expect(reimbursements.length).toBeGreaterThanOrEqual(2);
});

test("non-admin sees own only", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  await t.run(async (ctx) => {
    await ctx.db.insert("reimbursements", {
      organizationId,
      projectId,
      amount: 100,
      type: "expense",
      status: "pending",
      iban: "DE12340000000000000000",
      bic: "BIC",
      accountHolder: "Admin",
      createdBy: userId,
    });
    await ctx.db.insert("reimbursements", {
      organizationId,
      projectId,
      amount: 200,
      type: "expense",
      status: "pending",
      iban: "DE12340000000000000000",
      bic: "BIC",
      accountHolder: "Member",
      createdBy: memberUserId,
    });
  });

  const reimbursements = await t
    .withIdentity({ subject: memberUserId })
    .query(api.reimbursements.queries.getAllReimbursements, {});

  expect(reimbursements).toHaveLength(1);
});

test("getAllReimbursements includes travel details", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const reimbursements = await t
    .withIdentity({ subject: userId })
    .query(api.reimbursements.queries.getAllReimbursements, {});

  const travelReimbursement = reimbursements.find((r) => r.type === "travel");
  expect(travelReimbursement?.travelDetails?.destination).toBe("Berlin");
});

test("getFileUrl returns url", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["test"])));

  const url = await t
    .withIdentity({ subject: userId })
    .query(api.reimbursements.queries.getFileUrl, { storageId });

  expect(typeof url).toBe("string");
});
