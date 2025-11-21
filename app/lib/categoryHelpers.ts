import type { Id } from "@/convex/_generated/dataModel";

type Category = {
  _id: Id<"categories">;
  name: string;
  description: string;
  parentId?: Id<"categories">;
  taxsphere:
    | "non-profit"
    | "asset-management"
    | "purpose-operations"
    | "commercial-operations";
};

type CategoryGroup = {
  parent: Category;
  children: Category[];
};

export function groupCategories(categories: Category[]): CategoryGroup[] {
  const parents = categories.filter((category) => !category.parentId);

  return parents.map((parent) => ({
    parent,
    children: categories.filter((category) => category.parentId === parent._id),
  }));
}

export function filterGroups(
  groups: CategoryGroup[],
  search: string,
): CategoryGroup[] {
  if (!search) return groups;

  const searchLower = search.toLowerCase();

  return groups
    .map((group) => ({
      parent: group.parent,
      children: group.children.filter(
        (child) =>
          child.name.toLowerCase().includes(searchLower) ||
          child.description.toLowerCase().includes(searchLower) ||
          group.parent.name.toLowerCase().includes(searchLower),
      ),
    }))
    .filter(
      (group) =>
        group.children.length > 0 ||
        group.parent.name.toLowerCase().includes(searchLower) ||
        group.parent.description.toLowerCase().includes(searchLower),
    );
}

export function findGroupIndex(
  groups: CategoryGroup[],
  categoryId?: Id<"categories">,
): number {
  if (!categoryId) return 0;

  const idx = groups.findIndex(
    (group) =>
      group.parent._id === categoryId ||
      group.children.some((child) => child._id === categoryId),
  );

  return idx >= 0 ? idx : 0;
}

export function findItemIndex(
  group: CategoryGroup,
  categoryId?: Id<"categories">,
): number {
  if (!categoryId) return 0;

  const idx = group.children.findIndex((child) => child._id === categoryId);
  return idx >= 0 ? idx : 0;
}
