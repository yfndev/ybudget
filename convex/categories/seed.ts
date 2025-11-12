import { v } from "convex/values";
import { CATEGORY_GROUPS } from "../../app/components/data/mockCategories";
import { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";

export const seedCategories = internalMutation({
  args: {},
  returns: v.object({
    seeded: v.boolean(),
    categoriesCreated: v.number(),
  }),
  handler: async (ctx, args) => {
    const existingCategories = await ctx.db.query("categories").first();

    if (existingCategories) {
      return { seeded: false, categoriesCreated: 0 };
    }

    const parentIdMap: Record<string, Id<"categories">> = {};
    let categoriesCreated = 0;

    for (const categoryGroup of CATEGORY_GROUPS) {
      const parentId = await ctx.db.insert("categories", {
        name: categoryGroup.group,
        description: `${categoryGroup.type === "income" ? "Einnahmen" : "Ausgaben"}: ${categoryGroup.group}`,
        taxsphere: categoryGroup.items[0].taxsphere,
        approved: true,
      });

      parentIdMap[categoryGroup.group] = parentId;
      categoriesCreated++;

      for (const item of categoryGroup.items) {
        await ctx.db.insert("categories", {
          name: item.label,
          description: item.description,
          taxsphere: item.taxsphere,
          approved: true,
          parentId: parentId,
        });
        categoriesCreated++;
      }
    }

    return { seeded: true, categoriesCreated };
  },
});
