import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get all reimbursements", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(test);

  await test.run(async (ctx) => {
    await ctx.db.insert("reimbursements", {
      organizationId,
      projectId,
      amount: 100,
      type: "expense",
      status: "pending",
      iban: "DE12340000000000000000",
      bic: "BIC",
      accountHolder: "Account Holder",
      createdBy: userId,
    });
  });

  const user = test.withIdentity({ subject: userId });
  const reimbursements = await user.query(
    api.reimbursements.queries.getAllReimbursements,
    {},
  );
  expect(reimbursements).toHaveLength(1);
});

test("delete reimbursement", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(test);

  const reimbursementId = await test.run(async (ctx) =>
    ctx.db.insert("reimbursements", {
      organizationId,
      projectId,
      amount: 100,
      type: "expense",
      status: "pending",
      iban: "DE12340000000000000000",
      bic: "BIC",
      accountHolder: "Account Holder",
      createdBy: userId,
    }),
  );

  const user = test.withIdentity({ subject: userId });
  await user.mutation(api.reimbursements.functions.deleteReimbursement, {
    reimbursementId,
  });

  const deleted = await test.run(async (ctx) => ctx.db.get(reimbursementId));
  expect(deleted).toBeNull();
});
