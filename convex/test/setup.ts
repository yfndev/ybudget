import type { convexTest } from "convex-test";


export async function setupTestData(test: ReturnType<typeof convexTest>) {
  return await test.run(async (ctx) => {
    const orgId = await ctx.db.insert("organizations", {
      name: "Test Organization",
      domain: "test.com",
      createdBy: "system",
    });
    
    const userId = await ctx.db.insert("users", {
      email: "test@test.com",
      organizationId: orgId,
      role: "admin",
    });
    
    const projectId = await ctx.db.insert("projects", {
      name: "Test Project",
      organizationId: orgId,
      isArchived: false,
      createdBy: userId,
    });
    
    const categoryId = await ctx.db.insert("categories", {
      name: "Test Category",
      description: "Test",
      taxsphere: "non-profit",
      approved: true,
    });
    
    return { orgId, userId, projectId, categoryId };
  });
}

