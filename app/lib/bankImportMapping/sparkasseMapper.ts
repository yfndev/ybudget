import { createImportId } from "./createImportId";
import { TransactionData } from "./csvMappers";
import { parseDate } from "./parseDate";
import { parseGermanAmount } from "./parseGermanAmount";

export function mapSparkasseCSV(row: Record<string, string>): TransactionData {
  const buchungstag = row["Buchungstag"] || "";
  const verwendungszweck = row["Verwendungszweck"] || "";

  return {
    date: buchungstag ? parseDate(buchungstag) : Date.now(),
    amount: parseGermanAmount(row["Betrag"] || "0"),
    description: verwendungszweck || row["Buchungstext"] || "",
    counterparty: row["Beguenstigter/Zahlungspflichtiger"] || "",
    importedTransactionId: createImportId(
      buchungstag,
      verwendungszweck,
      "sparkasse",
    ),
    accountName: row["Auftragskonto"] || "",
  };
}
