import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get all projects", async () => {
  const test = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(test);

  const user = test.withIdentity({ subject: userId });
  const projects = await user.query(api.projects.queries.getAllProjects, {});
  expect(projects.find((p) => p._id === projectId)).toBeDefined();
});

test("create project", async () => {
  const test = convexTest(schema, modules);
  const { userId } = await setupTestData(test);

  const user = test.withIdentity({ subject: userId });
  const projectId = await user.mutation(api.projects.functions.createProject, {
    name: "New Project",
  });

  const project = await test.run(async (ctx) => ctx.db.get(projectId));
  expect(project?.name).toBe("New Project");
  expect(project?.isArchived).toBe(false);
});

test("rename project", async () => {
  const test = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(test);

  const user = test.withIdentity({ subject: userId });
  await user.mutation(api.projects.functions.renameProject, {
    projectId,
    name: "Renamed",
  });

  const project = await test.run(async (ctx) => ctx.db.get(projectId));
  expect(project?.name).toBe("Renamed");
});
