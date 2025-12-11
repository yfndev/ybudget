import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get all transactions", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: Date.now(),
      amount: 100,
      description: "Test",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const transactions = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getAllTransactions, {});

  expect(transactions).toHaveLength(1);
});

test("get all transactions of project (using filter)", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: Date.now(),
      amount: 100,
      description: "Test",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const transactions = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getAllTransactions, { projectId });

  expect(transactions).toHaveLength(1);
});

test("get unassigned transactions for admin", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      date: Date.now(),
      amount: 100,
      description: "Unassigned",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const transactions = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getUnassignedProcessedTransactions, {});

  expect(transactions.length).toBeGreaterThanOrEqual(1);
});

test("return empty object if non admin tries to get unassigned transactions", async () => {
  const t = convexTest(schema, modules);
  const { organizationId } = await setupTestData(t);

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  const transactions = await t
    .withIdentity({ subject: memberUserId })
    .query(api.transactions.queries.getUnassignedProcessedTransactions, {});

  expect(transactions).toHaveLength(0);
});

test("get oldest transaction date (for range calendar)", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const oldDate = Date.now() - 1000000;
  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: oldDate,
      amount: 100,
      description: "Old",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const oldest = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getOldestTransactionDate, {});

  expect(oldest).toBe(oldDate);
});

test("get transaction recommendations for import", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: Date.now(),
      amount: -100,
      description: "Expected",
      counterparty: "Test",
      status: "expected",
      importedBy: userId,
    }),
  );

  const recommendations = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getMatchingRecommendations, {});

  expect(recommendations.length).toBeGreaterThanOrEqual(1);
});

test("get paginated transactions", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: Date.now(),
      amount: 100,
      description: "Test",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const result = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getPaginatedTransactions, {
      paginationOpts: { numItems: 10, cursor: null },
    });

  expect(result.page.length).toBeGreaterThanOrEqual(1);
});

test("get paginated transactions with date range", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const now = Date.now();
  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: now,
      amount: 100,
      description: "Test",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const result = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getPaginatedTransactions, {
      startDate: now - 1000,
      endDate: now + 1000,
      paginationOpts: { numItems: 10, cursor: null },
    });

  expect(result.page.length).toBeGreaterThanOrEqual(1);
});

test("get paginated transactions with project filter", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: Date.now(),
      amount: 100,
      description: "Test",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const result = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getPaginatedTransactions, {
      projectId,
      paginationOpts: { numItems: 10, cursor: null },
    });

  expect(result.page.length).toBeGreaterThanOrEqual(1);
});

test("get paginated transactions with donor filter", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId, donorId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      donorId,
      date: Date.now(),
      amount: 100,
      description: "Donor",
      counterparty: "Donor",
      status: "processed",
      importedBy: userId,
    }),
  );

  const result = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getPaginatedTransactions, {
      donorId,
      paginationOpts: { numItems: 10, cursor: null },
    });

  expect(result.page.length).toBeGreaterThanOrEqual(1);
});

test("get paginated transactions with date range and project", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const now = Date.now();
  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: now,
      amount: 100,
      description: "Test",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const result = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getPaginatedTransactions, {
      projectId,
      startDate: now - 1000,
      endDate: now + 1000,
      paginationOpts: { numItems: 10, cursor: null },
    });

  expect(result.page.length).toBeGreaterThanOrEqual(1);
});

test("get paginated transactions with date range and donor", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId, donorId } = await setupTestData(t);

  const now = Date.now();
  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      donorId,
      date: now,
      amount: 100,
      description: "Donor",
      counterparty: "Donor",
      status: "processed",
      importedBy: userId,
    }),
  );

  const result = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getPaginatedTransactions, {
      donorId,
      startDate: now - 1000,
      endDate: now + 1000,
      paginationOpts: { numItems: 10, cursor: null },
    });

  expect(result.page.length).toBeGreaterThanOrEqual(1);
});

test("get matching recommendations for import when project is set (filter)", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: Date.now(),
      amount: -100,
      description: "Expected",
      counterparty: "Test",
      status: "expected",
      importedBy: userId,
    }),
  );

  const recommendations = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getMatchingRecommendations, { projectId });

  expect(recommendations.length).toBeGreaterThanOrEqual(1);
});

test("filter out archived and split transactions when using unassigned processed transactions", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      date: Date.now(),
      amount: 100,
      description: "Archived",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
      isArchived: true,
    }),
  );

  const originalId = await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      date: Date.now(),
      amount: 100,
      description: "Original",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      date: Date.now(),
      amount: 50,
      description: "Split",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
      splitFromTransactionId: originalId,
    }),
  );

  const transactions = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getUnassignedProcessedTransactions, {});

  expect(transactions.some((tx) => tx.description === "Archived")).toBe(false);
  expect(transactions.some((tx) => tx.description === "Split")).toBe(false);
});

test("unassigned transactions include missing project, category, or donor", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId, categoryId } =
    await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      date: Date.now(),
      amount: -100,
      description: "Missing project",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
      categoryId,
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: Date.now(),
      amount: -100,
      description: "Missing category",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      categoryId,
      date: Date.now(),
      amount: 100,
      description: "Positive missing donor",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const transactions = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getUnassignedProcessedTransactions, {});

  expect(
    transactions.some((tx) => tx.description === "Missing project"),
  ).toBe(true);
  expect(
    transactions.some((tx) => tx.description === "Missing category"),
  ).toBe(true);
  expect(
    transactions.some((tx) => tx.description === "Positive missing donor"),
  ).toBe(true);
});

test("oldest transaction date returns Date.now when there are no transactions", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const before = Date.now();
  const oldest = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getOldestTransactionDate, {});
  const after = Date.now();

  expect(oldest).toBeGreaterThanOrEqual(before);
  expect(oldest).toBeLessThanOrEqual(after);
});
