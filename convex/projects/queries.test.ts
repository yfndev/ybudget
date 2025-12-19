import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get all projects", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const projects = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getAllProjects, {});

  expect(projects.find((project) => project._id === projectId)).toBeDefined();
});

test("get all projects returns empty for unauthenticated user", async () => {
  const t = convexTest(schema, modules);
  await setupTestData(t);

  const projects = await t.query(api.projects.queries.getAllProjects, {});
  expect(projects).toHaveLength(0);
});

test("get all projects returns empty for user without organization", async () => {
  const t = convexTest(schema, modules);
  const userWithoutOrg = await t.run((ctx) =>
    ctx.db.insert("users", { email: "noorg@test.com" }),
  );

  const projects = await t
    .withIdentity({ subject: userWithoutOrg })
    .query(api.projects.queries.getAllProjects, {});

  expect(projects).toHaveLength(0);
});

test("get all projects excludes archived", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Archived Project",
      organizationId,
      isArchived: true,
      createdBy: userId,
    }),
  );

  const projects = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getAllProjects, {});

  expect(projects.some((project) => project.name === "Archived Project")).toBe(
    false,
  );
});

test("get project by id", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const project = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getProjectById, { projectId });

  expect(project?._id).toBe(projectId);
});

test("get project by id returns null for unauthenticated user", async () => {
  const t = convexTest(schema, modules);
  const { projectId } = await setupTestData(t);

  const project = await t.query(api.projects.queries.getProjectById, {
    projectId,
  });
  expect(project).toBeNull();
});

test("get project by id throws when no access", async () => {
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
      .query(api.projects.queries.getProjectById, {
        projectId: otherProjectId,
      }),
  ).rejects.toThrow("access");
});

test("get departments excludes child projects", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Child",
      organizationId,
      parentId: projectId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const departments = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getDepartments, {});

  expect(departments.some((dept) => dept.name === "Child")).toBe(false);
});

test("get bookable projects returns empty for unauthenticated user", async () => {
  const t = convexTest(schema, modules);
  await setupTestData(t);

  const projects = await t.query(api.projects.queries.getBookableProjects, {});
  expect(projects).toHaveLength(0);
});

test("get bookable projects returns empty for user without organization", async () => {
  const t = convexTest(schema, modules);
  const userWithoutOrg = await t.run((ctx) =>
    ctx.db.insert("users", { email: "noorg@test.com" }),
  );

  const projects = await t
    .withIdentity({ subject: userWithoutOrg })
    .query(api.projects.queries.getBookableProjects, {});

  expect(projects).toHaveLength(0);
});

test("get bookable projects excludes departments with children", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const childId = await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Child Project",
      organizationId,
      parentId: projectId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const bookable = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getBookableProjects, {});

  expect(bookable.some((project) => project._id === projectId)).toBe(false);
  expect(bookable.some((project) => project._id === childId)).toBe(true);
});

test("get bookable projects excludes Rücklagen for expenses", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Rücklagen",
      organizationId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const withoutRuecklagen = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getBookableProjects, {});

  const withRuecklagen = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getBookableProjects, { showRuecklagen: true });

  expect(withoutRuecklagen.some((project) => project.name === "Rücklagen")).toBe(
    false,
  );
  expect(withRuecklagen.some((project) => project.name === "Rücklagen")).toBe(
    true,
  );
});

test("get child project ids returns all descendants", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const childId = await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Child",
      organizationId,
      parentId: projectId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const grandchildId = await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Grandchild",
      organizationId,
      parentId: childId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const childIds = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getChildProjectIds, { projectId });

  expect(childIds).toContain(childId);
  expect(childIds).toContain(grandchildId);
  expect(childIds).not.toContain(projectId);
});

test("get child project ids returns empty for leaf project", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const childIds = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getChildProjectIds, { projectId });

  expect(childIds).toHaveLength(0);
});
