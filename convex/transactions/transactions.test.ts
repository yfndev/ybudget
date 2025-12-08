import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get all transactions", async () => {
  const test = convexTest(schema, modules);
  const { orgId, userId, projectId } = await setupTestData(test);

  await test.run(async (ctx) => {
    await ctx.db.insert("transactions", {
      organizationId: orgId,
      projectId,
      date: Date.now(),
      amount: 100,
      description: "Test transaction",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    });
  });

  const asUser = test.withIdentity({ subject: userId });
  const transactions = await asUser.query(api.transactions.queries.getAllTransactions, {});
  expect(transactions).toHaveLength(1);
  expect(transactions[0].description).toBe("Test transaction");
});


test("create expected transaction", async () => {
  const test = convexTest(schema, modules);
  const { userId, projectId, categoryId } = await setupTestData(test);
  const asUser = test.withIdentity({ subject: userId });

  const transactionId = await asUser.mutation(api.transactions.functions.createExpectedTransaction, {
    projectId,
    date: Date.now(),
    amount: -500,
    description: "Expected expense",
    counterparty: "Vendor",
    categoryId,
    status: "expected",
  });

  const transaction = await test.run(async (ctx) => ctx.db.get(transactionId));
  expect(transaction?.description).toBe("Expected expense");
  expect(transaction?.status).toBe("expected");
});

test("update transaction", async () => {
  const test = convexTest(schema, modules);
  const { orgId, userId, projectId, categoryId } = await setupTestData(test);

  const transactionId = await test.run(async (ctx) =>
    ctx.db.insert("transactions", {
      organizationId: orgId,
      projectId,
      date: Date.now(),
      amount: 100,
      description: "Original",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const asUser = test.withIdentity({ subject: userId });
  await asUser.mutation(api.transactions.functions.updateTransaction, {
    transactionId,
    description: "Updated",
    categoryId,
  });

  const updated = await test.run(async (ctx) => ctx.db.get(transactionId));
  expect(updated?.description).toBe("Updated");
  expect(updated?.categoryId).toBe(categoryId);
});

test("delete expected transaction", async () => {
  const test = convexTest(schema, modules);
  const { orgId, userId, projectId, categoryId } = await setupTestData(test);

  const transactionId = await test.run(async (ctx) =>
    ctx.db.insert("transactions", {
      organizationId: orgId,
      projectId,
      categoryId,
      date: Date.now(),
      amount: -100,
      description: "Expected",
      counterparty: "Test",
      status: "expected",
      importedBy: userId,
    }),
  );

  const asUser = test.withIdentity({ subject: userId });
  await asUser.mutation(api.transactions.functions.deleteExpectedTransaction, { transactionId });

  const deleted = await test.run(async (ctx) => ctx.db.get(transactionId));
  expect(deleted).toBeNull();
});

test("transfer money between projects and create debit and credit transactions", async () => {
  const test = convexTest(schema, modules);
  const { orgId, userId, projectId } = await setupTestData(test);

  const project2Id = await test.run(async (ctx) =>
    ctx.db.insert("projects", {
      name: "Project 2",
      organizationId: orgId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const asUser = test.withIdentity({ subject: userId });
  await asUser.mutation(api.transactions.functions.transferMoney, {
    amount: 500,
    sendingProjectId: projectId,
    receivingProjectId: project2Id,
  });

  const transactions = await test.run(async (ctx) =>
    ctx.db.query("transactions").withIndex("by_organization", (q) => q.eq("organizationId", orgId)).collect(),
  );

  expect(transactions).toHaveLength(2);
  expect(transactions.find((transaction) => transaction.amount === -500)).toBeDefined();
  expect(transactions.find((transaction) => transaction.amount === 500)).toBeDefined();
});
