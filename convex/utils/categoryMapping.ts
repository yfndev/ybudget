import { CATEGORY_GROUPS } from "../../app/lib/mockData/mockCategories";

export function createCategoryMap(): Map<string, string> {
  const categoryMap = new Map();
  CATEGORY_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      categoryMap.set(item.value, item.label);
    });
  });
  return categoryMap;
}
