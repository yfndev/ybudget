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
  const transactions = await user.query(api.transactions.queries.getAllTransactions, {});
  expect(transactions).toHaveLength(1);
});

test("create expected transaction", async () => {
  const test = convexTest(schema, modules);
  const { userId, projectId, categoryId } = await setupTestData(test);

  const user = test.withIdentity({ subject: userId });
  const id = await user.mutation(api.transactions.functions.createExpectedTransaction, {
    projectId,
    date: Date.now(),
    amount: -500,
    description: "Description",
    counterparty: "Counterparty",
    categoryId,
    status: "expected",
  });

  const transaction = await test.run(async (ctx) => ctx.db.get(id));
  expect(transaction?.status).toBe("expected");
});

test("delete expected transaction", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId, projectId, categoryId } = await setupTestData(test);

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
    })
  );

  const user = test.withIdentity({ subject: userId });
  await user.mutation(api.transactions.functions.deleteExpectedTransaction, { transactionId: id });

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
    })
  );

  const user = test.withIdentity({ subject: userId });
  await user.mutation(api.transactions.functions.transferMoney, {
    amount: 500,
    sendingProjectId: projectId,
    receivingProjectId,
  });

  const transactions = await test.run(async (ctx) =>
    ctx.db.query("transactions").withIndex("by_organization", (q) => q.eq("organizationId", organizationId)).collect()
  );
  expect(transactions).toHaveLength(2);
});
