import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get all categories", async () => {
  const test = convexTest(schema, modules);
  const { categoryId } = await setupTestData(test);

  const categories = await test.query(
    api.categories.functions.getAllCategories,
    {},
  );
  expect(categories).toHaveLength(1);
  expect(categories[0]._id).toBe(categoryId);
});

test("create category", async () => {
  const test = convexTest(schema, modules);
  const { userId } = await setupTestData(test);
  const user = test.withIdentity({ subject: userId });

  const categoryId = await user.mutation(
    api.categories.functions.createCategory,
    {
      name: "New Category",
      taxsphere: "non-profit",
    },
  );

  const category = await test.run(async (ctx) => ctx.db.get(categoryId));
  expect(category?.name).toBe("New Category");
  expect(category?.approved).toBe(false);
});
