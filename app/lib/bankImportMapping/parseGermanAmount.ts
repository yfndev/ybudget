export function parseGermanAmount(amountString: string): number {
  const cleaned = amountString.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}
