import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { createTravelReimbursement, modules, setupTestData } from "../test.setup";

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
  expect(reimbursement?.status).toBe("pending");
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
      .withIndex("by_reimbursement", (q) => q.eq("reimbursementId", reimbursementId))
      .first(),
  );
  expect(travelDetails?.destination).toBe("Berlin");
});

test("delete reimbursement", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.deleteReimbursement, { reimbursementId });

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
  expect(reimbursement?.status).toBe("paid");
});

test("reject reimbursement", async () => {
  const t = convexTest(schema, modules);
  const { userId, reimbursementId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.rejectReimbursement, {
      reimbursementId,
      adminNote: "Missing receipt",
    });

  const reimbursement = await t.run((ctx) => ctx.db.get(reimbursementId));
  expect(reimbursement?.status).toBe("rejected");
});

test("generate upload url", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const url = await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.generateUploadUrl, {});

  expect(typeof url).toBe("string");
});

test("delete travel reimbursement deletes travel details", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const reimbursementId = await t.run((ctx) =>
    createTravelReimbursement(ctx, organizationId, projectId, userId),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.reimbursements.functions.deleteReimbursement, { reimbursementId });

  const details = await t.run((ctx) =>
    ctx.db
      .query("travelDetails")
      .withIndex("by_reimbursement", (q) => q.eq("reimbursementId", reimbursementId))
      .first(),
  );
  expect(details).toBeNull();
});
