import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function addProjectAndCategoryNames<
  Transaction extends {
    projectId?: Id<"projects">;
    categoryId?: Id<"categories">;
  },
>(
  ctx: QueryCtx,
  items: Transaction[],
): Promise<(Transaction & { projectName?: string; categoryName?: string })[]> {
  const projectIds = [
    ...new Set(items.map((item) => item.projectId).filter(Boolean)),
  ];
  const categoryIds = [
    ...new Set(items.map((item) => item.categoryId).filter(Boolean)),
  ];

  const [projects, categories] = await Promise.all([
    Promise.all(projectIds.map((id) => ctx.db.get(id!))),
    Promise.all(categoryIds.map((id) => ctx.db.get(id!))),
  ]);

  const projectMap = new Map(
    projects.filter(Boolean).map((project) => [project!._id, project!.name]),
  );
  const categoryMap = new Map(
    categories
      .filter(Boolean)
      .map((category) => [category!._id, category!.name]),
  );

  return items.map((item) => ({
    ...item,
    projectName: item.projectId ? projectMap.get(item.projectId) : undefined,
    categoryName: item.categoryId
      ? categoryMap.get(item.categoryId)
      : undefined,
  }));
}
