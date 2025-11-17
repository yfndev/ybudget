export function createImportId(
  buchungstag: string,
  verwendungszweck: string,
  source: "sparkasse" | "volksbank",
): string {
  if (buchungstag && verwendungszweck) {
    return `${buchungstag}-${verwendungszweck}`.replace(
      /[^a-zA-Z0-9\-_]/g,
      "-",
    );
  }
  return `${source}-${Date.now()}-${Math.random()}`;
}
