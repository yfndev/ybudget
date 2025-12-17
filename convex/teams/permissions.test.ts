import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("admin gets all projects", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const projects = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getAllProjects, {});

  expect(projects.find((p) => p._id === projectId)).toBeDefined();
});

test("member only gets team projects", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  const otherProjectId = await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Other Project",
      organizationId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "Team",
      organizationId,
      memberIds: [memberUserId],
      projectIds: [projectId],
      createdBy: userId,
    }),
  );

  const projects = await t
    .withIdentity({ subject: memberUserId })
    .query(api.projects.queries.getAllProjects, {});

  expect(projects.find((p) => p._id === projectId)).toBeDefined();
  expect(projects.find((p) => p._id === otherProjectId)).toBeUndefined();
});

test("member with no team gets no projects", async () => {
  const t = convexTest(schema, modules);
  const { organizationId } = await setupTestData(t);

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  const projects = await t
    .withIdentity({ subject: memberUserId })
    .query(api.projects.queries.getAllProjects, {});

  expect(projects).toHaveLength(0);
});

test("filters transactions by project access", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "Team",
      organizationId,
      memberIds: [memberUserId],
      projectIds: [projectId],
      createdBy: userId,
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId,
      date: Date.now(),
      amount: 100,
      description: "Test",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const transactions = await t
    .withIdentity({ subject: memberUserId })
    .query(api.transactions.queries.getAllTransactions, {});

  expect(transactions).toHaveLength(1);
});

test("non-admin cannot access project not in their team", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  const unassignedProjectId = await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Unassigned Project",
      organizationId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("transactions", {
      organizationId,
      projectId: unassignedProjectId,
      date: Date.now(),
      amount: 100,
      description: "Test",
      counterparty: "Test",
      status: "processed",
      importedBy: userId,
    }),
  );

  const transactions = await t
    .withIdentity({ subject: memberUserId })
    .query(api.transactions.queries.getAllTransactions, {});

  expect(transactions).toHaveLength(0);
});
