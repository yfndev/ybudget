import { mapVolksbankCSV } from "./volksbankMapper";

export interface TransactionData {
  date: number;
  amount: number;
  description: string;
  counterparty: string;
  importedTransactionId: string;
  accountName?: string;
}

function parseDate(dateString: string): number {
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }

  const parts = dateString.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
    const usParsed = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    if (!isNaN(usParsed.getTime())) {
      return usParsed.getTime();
    }
  }

  return Date.now();
}

export function mapMossCSV(row: Record<string, string>): TransactionData {
  const dateValue = row["Payment Date"] || row["Payment date"] || row.date || row.Date || "";
  const parsedDate = dateValue ? parseDate(dateValue) : Date.now();

  return {
    date: parsedDate,
    amount: parseFloat(row["Amount"] || row.amount || "0"),
    description: row["Note"] || row["Merchant and Card Description"] || row["Description"] || row.description || "",
    counterparty: row["Merchant Name"] || row["Merchant name"] || row.merchant || "",
    importedTransactionId: row["Transaction ID"] || row["transaction id"] || row.id || `moss-${Date.now()}-${Math.random()}`,
    accountName: row["Cardholder"] || row.cardholder || row.account || "",
  };
}

export function mapCSVRow(row: Record<string, string>, source: "moss" | "sparkasse" | "volksbank"): TransactionData {
  if (source === "moss") {
    return mapMossCSV(row);
  }
  if (source === "volksbank") {
    return mapVolksbankCSV(row);
  }
  throw new Error(`Unbekannte Datenquelle: ${source}`);
}
