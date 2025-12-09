import type { convexTest } from "convex-test";

export const modules = import.meta.glob("./**/*.ts");

export async function setupTestData(test: ReturnType<typeof convexTest>) {
  // convex insert returns the id of the inserted document
  return await test.run(async (ctx) => {
    const organizationId = await ctx.db.insert("organizations", {
      name: "Test Organization",
      domain: "test.com",
      createdBy: "system",
    });

    const userId = await ctx.db.insert("users", {
      email: "test@test.com",
      organizationId,
      role: "admin",
    });

    const projectId = await ctx.db.insert("projects", {
      name: "Test Project",
      organizationId,
      isArchived: false,
      createdBy: userId,
    });

    const categoryId = await ctx.db.insert("categories", {
      name: "Test Category",
      taxsphere: "non-profit",
      approved: true,
    });

    return { organizationId, userId, projectId, categoryId };
  });
}
