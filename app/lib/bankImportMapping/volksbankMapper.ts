import { createImportId } from "./createImportId";
import { TransactionData } from "./csvMappers";
import { parseVolksbankDate } from "./parseDate";
import { parseGermanAmount } from "./parseGermanAmount";

const SENSITIVE_DATA_PATTERN = /(?:CRED|IBAN|BIC|MREF):\s*[A-Z0-9]+/gi;

function stripSensitiveData(text: string): string {
  return text.replace(SENSITIVE_DATA_PATTERN, "").replace(/\s+/g, " ").trim();
}

export function mapVolksbankCSV(row: Record<string, string>): TransactionData {
  const buchungstag = row["Buchungstag"] || "";
  const verwendungszweck = row["Verwendungszweck"] || "";
  const buchungstext = row["Buchungstext"] || "";

  const cleanedDescription = stripSensitiveData(
    verwendungszweck || buchungstext,
  );

  return {
    date: buchungstag ? parseVolksbankDate(buchungstag) : Date.now(),
    amount: parseGermanAmount(row["Betrag"] || "0"),
    description: cleanedDescription,
    counterparty: row["Name Zahlungsbeteiligter"] || "",
    importedTransactionId: createImportId(
      buchungstag,
      verwendungszweck,
      "volksbank",
    ),
    accountName: row["Bezeichnung Auftragskonto"] || "",
  };
}
