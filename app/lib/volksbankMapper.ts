import { TransactionData } from "./csvMappers";

function parseDate(dateString: string): number {
  const parts = dateString.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.getTime() : Date.now();
}

function parseGermanAmount(amountString: string): number {
  const cleaned = amountString.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function createImportId(buchungstag: string, verwendungszweck: string): string {
  if (buchungstag && verwendungszweck) {
    return `${buchungstag}-${verwendungszweck}`.replace(/[^a-zA-Z0-9\-_]/g, "-");
  }
  return `volksbank-${Date.now()}-${Math.random()}`;
}

export function mapVolksbankCSV(row: Record<string, string>): TransactionData {
  const buchungstag = row["Buchungstag"] || "";
  const verwendungszweck = row["Verwendungszweck"] || "";
  
  return {
    date: buchungstag ? parseDate(buchungstag) : Date.now(),
    amount: parseGermanAmount(row["Betrag"] || "0"),
    description: verwendungszweck || row["Buchungstext"] || "",
    counterparty: row["Name Zahlungsbeteiligter"] || "",
    importedTransactionId: createImportId(buchungstag, verwendungszweck),
    accountName: row["Bezeichnung Auftragskonto"] || "",
  };
}

