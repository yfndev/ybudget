import { CATEGORY_GROUPS } from "../../app/lib/mockData/mockCategories";
import { internalMutation } from "../_generated/server";

export const seedCategories = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").first();
    if (existing) {
      return { seeded: false, categoriesCreated: 0 };
    }

    let count = 0;

    for (const group of CATEGORY_GROUPS) {
      const type = group.type === "income" ? "Einnahmen" : "Ausgaben";
      const parentId = await ctx.db.insert("categories", {
        name: group.group,
        description: `${type}: ${group.group}`,
        taxsphere: group.items[0].taxsphere,
        approved: true,
      });
      count++;

      for (const item of group.items) {
        await ctx.db.insert("categories", {
          name: item.label,
          description: item.description,
          taxsphere: item.taxsphere,
          approved: true,
          parentId,
        });
        count++;
      }
    }

    return { seeded: true, categoriesCreated: count };
  },
});
