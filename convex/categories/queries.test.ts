import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("create category", async () => {
    const t = convexTest(schema, modules);
    const { userId } = await setupTestData(t);
  
    const categoryId = await t
      .withIdentity({ subject: userId })
      .mutation(api.categories.functions.createCategory, {
        name: "New Category",
        taxsphere: "non-profit",
      });
  
    const category = await t.run((ctx) => ctx.db.get(categoryId));
    expect(category?.name).toBe("New Category");
  });
  