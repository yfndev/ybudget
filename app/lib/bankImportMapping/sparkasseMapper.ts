import { createImportId } from "./createImportId";
import { TransactionData } from "./csvMappers";
import { parseSparkasseDate } from "./parseDate";
import { parseGermanAmount } from "./parseGermanAmount";

const DATE_TIME_PATTERN = /DATUM\s+\d{2}\.\d{2}\.\d{4},\s+\d{2}\.\d{2}\s+UHR/gi;

function stripDateTime(text: string): string {
  return text.replace(DATE_TIME_PATTERN, "").replace(/\s+/g, " ").trim();
}

export function mapSparkasseCSV(row: Record<string, string>): TransactionData {
  const buchungstag = row["Buchungstag"] || "";
  const verwendungszweck = row["Verwendungszweck"] || "";
  const buchungstext = row["Buchungstext"] || "";

  const cleanedDescription = stripDateTime(verwendungszweck || buchungstext);

  return {
    date: buchungstag ? parseSparkasseDate(buchungstag) : Date.now(),
    amount: parseGermanAmount(row["Betrag"] || "0"),
    description: cleanedDescription,
    counterparty: row["Beguenstigter/Zahlungspflichtiger"] || "",
    importedTransactionId: createImportId(
      buchungstag,
      verwendungszweck,
      "sparkasse",
    ),
    accountName: row["Auftragskonto"] || "",
  };
}
