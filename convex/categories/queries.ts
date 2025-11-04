import { query } from "../_generated/server";

export const getAllCategories = query({
  handler: async (ctx) => {
    return ctx.db.query("categories").collect();
  },
});
