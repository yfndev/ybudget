export function formatDate(
  date: Date | string | number | null | undefined,
): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("de-DE");
}

