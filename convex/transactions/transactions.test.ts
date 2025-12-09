import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get all transactions", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(test);

  await test.run(async (ctx) => {
    await ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: Date.now(),
      amount: 100,
      description: "Description",
      counterparty: "Counterparty",
      status: "processed",
      importedBy: userId,
    });
  });

  const user = test.withIdentity({ subject: userId });
  const transactions = await user.query(
    api.transactions.queries.getAllTransactions,
    {},
  );
  expect(transactions).toHaveLength(1);
});

test("create expected transaction", async () => {
  const test = convexTest(schema, modules);
  const { userId, projectId, categoryId } = await setupTestData(test);

  const user = test.withIdentity({ subject: userId });
  const id = await user.mutation(
    api.transactions.functions.createExpectedTransaction,
    {
      projectId,
      date: Date.now(),
      amount: -500,
      description: "Description",
      counterparty: "Counterparty",
      categoryId,
      status: "expected",
    },
  );

  const transaction = await test.run(async (ctx) => ctx.db.get(id));
  expect(transaction?.status).toBe("expected");
});

test("delete expected transaction", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId, projectId, categoryId } =
    await setupTestData(test);

  const id = await test.run(async (ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      categoryId,
      date: Date.now(),
      amount: -100,
      description: "Description",
      counterparty: "Counterparty",
      status: "expected",
      importedBy: userId,
    }),
  );

  const user = test.withIdentity({ subject: userId });
  await user.mutation(api.transactions.functions.deleteExpectedTransaction, {
    transactionId: id,
  });

  const deleted = await test.run(async (ctx) => ctx.db.get(id));
  expect(deleted).toBeNull();
});

test("transfer money between projects", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(test);

  const receivingProjectId = await test.run(async (ctx) =>
    ctx.db.insert("projects", {
      name: "Receiver",
      organizationId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const user = test.withIdentity({ subject: userId });
  await user.mutation(api.transactions.functions.transferMoney, {
    amount: 500,
    sendingProjectId: projectId,
    receivingProjectId,
  });

  const transactions = await test.run(async (ctx) =>
    ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId),
      )
      .collect(),
  );
  expect(transactions).toHaveLength(2);
});

test("split transaction creates multiple transactions and archives original", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(test);

  const project2Id = await test.run(async (ctx) =>
    ctx.db.insert("projects", {
      name: "Project 2",
      organizationId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const originalId = await test.run(async (ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      date: Date.now(),
      amount: 1000,
      description: "Original",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const user = test.withIdentity({ subject: userId });
  await user.mutation(api.transactions.functions.splitTransaction, {
    transactionId: originalId,
    splits: [
      { projectId, amount: 400 },
      { projectId: project2Id, amount: 600 },
    ],
  });

  const original = await test.run(async (ctx) => ctx.db.get(originalId));
  expect(original?.isArchived).toBe(true);

  const splits = await test.run(async (ctx) =>
    ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("splitFromTransactionId"), originalId))
      .collect(),
  );
  expect(splits).toHaveLength(2);
  expect(splits.map((s) => s.amount).sort()).toEqual([400, 600]);
});

test("create imported transaction skips duplicates", async () => {
  const test = convexTest(schema, modules);
  const { userId } = await setupTestData(test);

  const user = test.withIdentity({ subject: userId });

  const result1 = await user.mutation(
    api.transactions.functions.createImportedTransaction,
    {
      date: Date.now(),
      importedTransactionId: "transaction123",
      importSource: "sparkasse",
      amount: 100,
      description: "Test",
      counterparty: "Test",
    },
  );
  expect(result1).toEqual({ inserted: true });

  const result2 = await user.mutation(
    api.transactions.functions.createImportedTransaction,
    {
      date: Date.now(),
      importedTransactionId: "transaction123",
      importSource: "sparkasse",
      amount: 100,
      description: "Test",
      counterparty: "Test",
    },
  );
  expect(result2).toEqual({ skipped: true });
});
