import { TransactionData } from "./csvMappers";
import { parseDate } from "./parseDate";

export function mapMossCSV(row: Record<string, string>): TransactionData {
  const dateValue =
    row["Payment Date"] || row["Payment date"] || row.date || row.Date || "";
  const parsedDate = dateValue ? parseDate(dateValue) : Date.now();

  return {
    date: parsedDate,
    amount: parseFloat(row["Amount"] || row.amount || "0"),
    description:
      row["Note"] ||
      row["Merchant and Card Description"] ||
      row["Description"] ||
      row.description ||
      "",
    counterparty:
      row["Merchant Name"] || row["Merchant name"] || row.merchant || "",
    importedTransactionId:
      row["Transaction ID"] ||
      row["transaction id"] ||
      row.id ||
      `moss-${Date.now()}-${Math.random()}`,
    accountName: row["Cardholder"] || row.cardholder || row.account || "",
  };
}
