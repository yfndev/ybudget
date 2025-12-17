import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules } from "../test.setup";

async function setupAITestData(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      email: "test@test.com",
      role: "admin",
    });

    const organizationId = await ctx.db.insert("organizations", {
      name: "Test Organization",
      domain: "test.com",
      createdBy: userId,
    });

    await ctx.db.patch(userId, { organizationId });

    const projectId = await ctx.db.insert("projects", {
      name: "Test Project",
      organizationId,
      isArchived: false,
      createdBy: userId,
    });

    const categoryId = await ctx.db.insert("categories", {
      name: "Mitgliedsbeiträge",
      taxsphere: "non-profit",
      approved: true,
    });

    const donorId = await ctx.db.insert("donors", {
      name: "Test Donor",
      type: "donation",
      allowedTaxSpheres: ["non-profit"],
      organizationId,
      createdBy: userId,
    });

    await ctx.db.insert("transactions", {
      organizationId,
      projectId,
      categoryId,
      amount: 10000,
      date: Date.now(),
      description: "Test income",
      counterparty: "Test Counterparty",
      status: "processed",
      importedBy: userId,
    });

    await ctx.db.insert("transactions", {
      organizationId,
      projectId,
      categoryId,
      amount: -5000,
      date: Date.now(),
      description: "Test expense",
      counterparty: "Supplier",
      status: "processed",
      importedBy: userId,
    });

    await ctx.db.insert("transactions", {
      organizationId,
      projectId,
      categoryId,
      amount: 2000,
      date: Date.now(),
      description: "Expected income",
      counterparty: "Future Donor",
      status: "expected",
      importedBy: userId,
    });

    return { organizationId, userId, projectId, categoryId, donorId };
  });
}

test("getAllTransactions returns transactions", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupAITestData(t);

  const transactions = await t
    .withIdentity({ subject: userId })
    .query(api.transactions.queries.getAllTransactions, {});

  expect(transactions).toHaveLength(3);
});

test("getAllProjects returns projects", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupAITestData(t);

  const projects = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getAllProjects, {});

  expect(projects.length).toBeGreaterThanOrEqual(1);
  expect(projects.some((project) => project.name === "Test Project")).toBe(
    true,
  );
});

test("getAllCategories returns categories", async () => {
  const t = convexTest(schema, modules);
  await setupAITestData(t);

  const categories = await t.query(
    api.categories.functions.getAllCategories,
    {},
  );

  expect(categories.length).toBeGreaterThanOrEqual(1);
  expect(
    categories.some((category) => category.name === "Mitgliedsbeiträge"),
  ).toBe(true);
});

test("getAllDonors returns donors", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupAITestData(t);

  const donors = await t
    .withIdentity({ subject: userId })
    .query(api.donors.queries.getAllDonors, {});

  expect(donors).toHaveLength(1);
  expect(donors[0].name).toBe("Test Donor");
});
