import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("create (standard) reimbursement", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const reimbursementId = await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.createReimbursement, {
      amount: 100,
      projectId,
      iban: "DE12345678900000000000",
      bic: "TESTBIC",
      accountHolder: "Test User",
      receipts: [],
    });

  const reimbursement = await t.run((ctx) => ctx.db.get(reimbursementId));
  expect(reimbursement?.type).toBe("expense");
  expect(reimbursement?.isApproved).toBe(false);
});

test("create travel reimbursement", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const reimbursementId = await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.createTravelReimbursement, {
      amount: 200,
      projectId,
      iban: "DE12345678900000000000",
      bic: "TESTBIC",
      accountHolder: "Test User",
      startDate: "2024-01-01",
      endDate: "2024-01-02",
      destination: "Berlin",
      purpose: "Conference",
      isInternational: false,
      receipts: [],
    });

  const reimbursement = await t.run((ctx) => ctx.db.get(reimbursementId));
  expect(reimbursement?.type).toBe("travel");

  const travelDetails = await t.run((ctx) =>
    ctx.db
      .query("travelDetails")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", reimbursementId),
      )
      .first(),
  );
  expect(travelDetails?.destination).toBe("Berlin");
});

test("delete reimbursement", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.deleteReimbursement, {
      reimbursementId,
    });

  const deleted = await t.run((ctx) => ctx.db.get(reimbursementId));
  expect(deleted).toBeNull();
});

test("mark reimbursement as paid", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.markAsPaid, { reimbursementId });

  const reimbursement = await t.run((ctx) => ctx.db.get(reimbursementId));
  expect(reimbursement?.isApproved).toBe(true);
});

test("reject reimbursement", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.rejectReimbursement, {
      reimbursementId,
      rejectionNote: "Missing receipt",
    });

  const reimbursement = await t.run((ctx) => ctx.db.get(reimbursementId));
  expect(reimbursement?.rejectionNote).toBe("Missing receipt");
});

test("generate upload url", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const url = await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.generateUploadUrl, {});

  expect(typeof url).toBe("string");
});

test("throw error if trying to delete non existent reimbursement", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  await t.run((ctx) => ctx.db.delete(reimbursementId));

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.reimbursements.functions.deleteReimbursement, {
        reimbursementId,
      }),
  ).rejects.toThrow("Reimbursement not found");
});

test("throw error if trying to mark non existent reimbursement as paid", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  await t.run((ctx) => ctx.db.delete(reimbursementId));

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.reimbursements.functions.markAsPaid, { reimbursementId }),
  ).rejects.toThrow("Reimbursement not found");
});

test("throw error if trying to reject non existent reimbursement", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  await t.run((ctx) => ctx.db.delete(reimbursementId));

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.reimbursements.functions.rejectReimbursement, {
        reimbursementId,
        rejectionNote: "Test",
      }),
  ).rejects.toThrow("Reimbursement not found");
});

test("delete travel reimbursement deletes travel details", async () => {
  const t = convexTest(schema, modules);
  const { userId, travelReimbursementId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.deleteReimbursement, {
      reimbursementId: travelReimbursementId,
    });

  const details = await t.run((ctx) =>
    ctx.db
      .query("travelDetails")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", travelReimbursementId),
      )
      .first(),
  );
  expect(details).toBeNull();
});

test("create reimbursement with receipts", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["test"])));

  const reimbursementId = await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.createReimbursement, {
      amount: 150,
      projectId,
      iban: "DE12345678900000000000",
      bic: "TESTBIC",
      accountHolder: "Test User",
      receipts: [
        {
          receiptNumber: "R001",
          receiptDate: "2024-01-15",
          companyName: "Test Company",
          description: "Office supplies",
          netAmount: 100,
          taxRate: 19,
          grossAmount: 119,
          fileStorageId: storageId,
        },
      ],
    });

  const receipts = await t.run((ctx) =>
    ctx.db
      .query("receipts")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", reimbursementId),
      )
      .collect(),
  );
  expect(receipts).toHaveLength(1);
  expect(receipts[0].receiptNumber).toBe("R001");
});

test("create travel reimbursement with meal allowance and receipts", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["test"])));

  const reimbursementId = await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.createTravelReimbursement, {
      amount: 500,
      projectId,
      iban: "DE12345678900000000000",
      bic: "TESTBIC",
      accountHolder: "Test User",
      startDate: "2024-01-01",
      endDate: "2024-01-03",
      destination: "Munich",
      purpose: "Business Meeting",
      isInternational: true,
      mealAllowanceDays: 3,
      mealAllowanceDailyBudget: 28,
      receipts: [
        {
          receiptNumber: "T001",
          receiptDate: "2024-01-01",
          companyName: "Deutsche Bahn",
          description: "Train ticket",
          netAmount: 80,
          taxRate: 7,
          grossAmount: 85.6,
          fileStorageId: storageId,
          costType: "train",
        },
      ],
    });

  const travelDetails = await t.run((ctx) =>
    ctx.db
      .query("travelDetails")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", reimbursementId),
      )
      .first(),
  );
  expect(travelDetails?.mealAllowanceDays).toBe(3);
  expect(travelDetails?.mealAllowanceDailyBudget).toBe(28);
  expect(travelDetails?.isInternational).toBe(true);

  const receipts = await t.run((ctx) =>
    ctx.db
      .query("receipts")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", reimbursementId),
      )
      .collect(),
  );
  expect(receipts).toHaveLength(1);
  expect(receipts[0].costType).toBe("train");
});

test("delete reimbursement with receipts deletes receipt records", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["test"])));

  const reimbursementId = await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.createReimbursement, {
      amount: 100,
      projectId,
      iban: "DE12345678900000000000",
      bic: "TESTBIC",
      accountHolder: "Test User",
      receipts: [
        {
          receiptNumber: "R001",
          receiptDate: "2024-01-15",
          companyName: "Test",
          description: "Test",
          netAmount: 100,
          taxRate: 19,
          grossAmount: 119,
          fileStorageId: storageId,
        },
      ],
    });

  await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.deleteReimbursement, {
      reimbursementId,
    });

  const receipts = await t.run((ctx) =>
    ctx.db
      .query("receipts")
      .withIndex("by_reimbursement", (q) =>
        q.eq("reimbursementId", reimbursementId),
      )
      .collect(),
  );
  expect(receipts).toHaveLength(0);
});
