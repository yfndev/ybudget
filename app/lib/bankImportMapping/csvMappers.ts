import { mapMossCSV } from "./mossMapper";
import { mapSparkasseCSV } from "./sparkasseMapper";
import { mapVolksbankCSV } from "./volksbankMapper";

export interface TransactionData {
  date: number;
  amount: number;
  description: string;
  counterparty: string;
  importedTransactionId: string;
  accountName?: string;
}

export function mapCSVRow(
  row: Record<string, string>,
  source: "moss" | "sparkasse" | "volksbank",
): TransactionData {
  if (source === "moss") {
    return mapMossCSV(row);
  }
  if (source === "volksbank") {
    return mapVolksbankCSV(row);
  }
  if (source === "sparkasse") {
    return mapSparkasseCSV(row);
  }
  throw new Error(`Unbekannte Datenquelle: ${source}`);
}
