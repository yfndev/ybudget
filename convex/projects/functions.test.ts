import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("create project", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const projectId = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, { name: "New Project" });

  const project = await t.run((ctx) => ctx.db.get(projectId));
  expect(project?.name).toBe("New Project");
});

test("rename project", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.renameProject, {
      projectId,
      name: "Renamed",
    });

  const project = await t.run((ctx) => ctx.db.get(projectId));
  expect(project?.name).toBe("Renamed");
});

test("archive project", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.archiveProject, { projectId });

  const project = await t.run((ctx) => ctx.db.get(projectId));
  expect(project?.isArchived).toBe(true);
});

test("create project throws error if free tier limit is reached", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  for (let i = 0; i < 9; i++) {
    await t.run((ctx) =>
      ctx.db.insert("projects", {
        name: `Project ${i}`,
        organizationId,
        isArchived: false,
        createdBy: userId,
      }),
    );
  }

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.createProject, { name: "Eleventh" }),
  ).rejects.toThrow("Limit");
});

test("create project goes over limit if user has premium", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  for (let i = 0; i < 9; i++) {
    await t.run((ctx) =>
      ctx.db.insert("projects", {
        name: `Project ${i}`,
        organizationId,
        isArchived: false,
        createdBy: userId,
      }),
    );
  }

  await t.run((ctx) =>
    ctx.db.insert("payments", {
      organizationId,
      status: "completed",
      tier: "yearly",
      stripeSubscriptionId: "sub_123",
    }),
  );

  const projectId = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, { name: "Eleventh" });

  expect(projectId).toBeDefined();
});

test("rename project throws error if project is not found", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await t.run((ctx) => ctx.db.delete(projectId));

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.renameProject, {
        projectId,
        name: "New",
      }),
  ).rejects.toThrow("not found");
});

test("rename project throws for wrong organization", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const otherProjectId = await t.run(async (ctx) => {
    const otherUserId = await ctx.db.insert("users", {
      email: "other@other.com",
    });
    const otherOrgId = await ctx.db.insert("organizations", {
      name: "Other",
      domain: "other.com",
      createdBy: otherUserId,
    });
    return ctx.db.insert("projects", {
      name: "Other",
      organizationId: otherOrgId,
      isArchived: false,
      createdBy: otherUserId,
    });
  });

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.renameProject, {
        projectId: otherProjectId,
        name: "New",
      }),
  ).rejects.toThrow("denied");
});

test("cannot nest projects more than one level deep", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const childId = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, {
      name: "Child",
      parentId: projectId,
    });

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.createProject, {
        name: "Grandchild",
        parentId: childId,
      }),
  ).rejects.toThrow("nested one level deep");
});

test("cannot archive reserves project", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const ruecklagenId = await t.run((ctx) =>
    ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId),
      )
      .filter((q) => q.eq(q.field("name"), "Rücklagen"))
      .first()
      .then((p) => p!._id),
  );

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.archiveProject, {
        projectId: ruecklagenId,
      }),
  ).rejects.toThrow("Rücklagen");
});

test("move project to parent", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const childId = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, { name: "Child" });

  await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.moveProject, {
      projectId: childId,
      newParentId: projectId,
    });

  const child = await t.run((ctx) => ctx.db.get(childId));
  expect(child?.parentId).toBe(projectId);
});

test("move project to root", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const childId = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, {
      name: "Child",
      parentId: projectId,
    });

  await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.moveProject, {
      projectId: childId,
      newParentId: null,
    });

  const child = await t.run((ctx) => ctx.db.get(childId));
  expect(child?.parentId).toBeUndefined();
});

test("move project throws if project not found", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await t.run((ctx) => ctx.db.delete(projectId));

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.moveProject, {
        projectId,
        newParentId: null,
      }),
  ).rejects.toThrow("not found");
});

test("move project throws for wrong organization", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const otherProjectId = await t.run(async (ctx) => {
    const otherUserId = await ctx.db.insert("users", { email: "other@other.com" });
    const otherOrgId = await ctx.db.insert("organizations", {
      name: "Other",
      domain: "other.com",
      createdBy: otherUserId,
    });
    return ctx.db.insert("projects", {
      name: "Other",
      organizationId: otherOrgId,
      isArchived: false,
      createdBy: otherUserId,
    });
  });

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.moveProject, {
        projectId: otherProjectId,
        newParentId: null,
      }),
  ).rejects.toThrow("denied");
});

test("move project throws if parent not found", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const fakeParentId = await t.run(async (ctx) => {
    const tempId = await ctx.db.insert("projects", {
      name: "Temp",
      organizationId: (await ctx.db.get(projectId))!.organizationId,
      isArchived: false,
      createdBy: userId,
    });
    await ctx.db.delete(tempId);
    return tempId;
  });

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.moveProject, {
        projectId,
        newParentId: fakeParentId,
      }),
  ).rejects.toThrow("Parent not found");
});

test("move project throws if target is nested", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const childId = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, {
      name: "Child",
      parentId: projectId,
    });

  const anotherProject = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, { name: "Another" });

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.moveProject, {
        projectId: anotherProject,
        newParentId: childId,
      }),
  ).rejects.toThrow("nested project");
});

test("move project throws if moving to itself", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.moveProject, {
        projectId,
        newParentId: projectId,
      }),
  ).rejects.toThrow("itself");
});

test("move project throws if moving to Rücklagen", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const ruecklagenId = await t.run((ctx) =>
    ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .filter((q) => q.eq(q.field("name"), "Rücklagen"))
      .first()
      .then((p) => p!._id),
  );

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.moveProject, {
        projectId,
        newParentId: ruecklagenId,
      }),
  ).rejects.toThrow("Rücklagen");
});

test("move project throws if department has children", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, {
      name: "Child",
      parentId: projectId,
    });

  const anotherProject = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, { name: "Another" });

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.moveProject, {
        projectId,
        newParentId: anotherProject,
      }),
  ).rejects.toThrow("children");
});

test("move project handles deleted parent gracefully", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const parentId = await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Parent",
      organizationId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const childId = await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Child",
      organizationId,
      parentId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  await t.run((ctx) => ctx.db.delete(parentId));

  await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.moveProject, {
      projectId: childId,
      newParentId: null,
    });

  const child = await t.run((ctx) => ctx.db.get(childId));
  expect(child?.parentId).toBeUndefined();
});

test("unarchive project", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const archivedId = await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Archived",
      organizationId,
      isArchived: true,
      createdBy: userId,
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.unarchiveProject, { projectId: archivedId });

  const project = await t.run((ctx) => ctx.db.get(archivedId));
  expect(project?.isArchived).toBe(false);
});

test("unarchive project throws if project not found", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await t.run((ctx) => ctx.db.delete(projectId));

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.unarchiveProject, { projectId }),
  ).rejects.toThrow("not found");
});

test("unarchive project throws for wrong organization", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const otherProjectId = await t.run(async (ctx) => {
    const otherUserId = await ctx.db.insert("users", { email: "other@other.com" });
    const otherOrgId = await ctx.db.insert("organizations", {
      name: "Other",
      domain: "other.com",
      createdBy: otherUserId,
    });
    return ctx.db.insert("projects", {
      name: "Other",
      organizationId: otherOrgId,
      isArchived: true,
      createdBy: otherUserId,
    });
  });

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.unarchiveProject, { projectId: otherProjectId }),
  ).rejects.toThrow("denied");
});
