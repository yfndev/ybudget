import { createImportId } from "./createImportId";
import { TransactionData } from "./csvMappers";
import { parseDate } from "./parseDate";
import { parseGermanAmount } from "./parseGermanAmount";

export function mapVolksbankCSV(row: Record<string, string>): TransactionData {
  const buchungstag = row["Buchungstag"] || "";
  const verwendungszweck = row["Verwendungszweck"] || "";

  return {
    date: buchungstag ? parseDate(buchungstag) : Date.now(),
    amount: parseGermanAmount(row["Betrag"] || "0"),
    description: verwendungszweck || row["Buchungstext"] || "",
    counterparty: row["Name Zahlungsbeteiligter"] || "",
    importedTransactionId: createImportId(
      buchungstag,
      verwendungszweck,
      "volksbank",
    ),
    accountName: row["Bezeichnung Auftragskonto"] || "",
  };
}
