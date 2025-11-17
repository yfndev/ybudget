import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { CSVLink } from "react-csv";
import { Button } from "../ui/button";

interface DonorCSVExportProps {
  donorId: Id<"donors">;
  donorName: string;
}

export default function DonorCSVExport({
  donorId,
  donorName,
}: DonorCSVExportProps) {
  const transactions = useQuery(api.donors.queries.getDonorTransactions, {
    donorId: donorId as Id<"donors">,
  });

  const headers: { label: string; key: string }[] = [
    { label: "Datum", key: "date" },
    { label: "Betrag", key: "amount" },
    { label: "Beschreibung", key: "description" },
    { label: "Begünstigter/Zahlungspflichtiger", key: "counterparty" },
    { label: "Auftragskonto", key: "accountName" },
    { label: "Verwendungszweck", key: "description" },
    { label: "Status", key: "status" },
  ];

  const csvData =
    transactions?.map((transaction) => ({
      date: new Date(transaction.date).toISOString(),
      amount: transaction.amount,
      description: transaction.description,
      counterparty: transaction.counterparty,
      accountName: transaction.accountName,
      status: transaction.status,
    })) ?? [];
  return (
    <div>
      <CSVLink
        data={csvData}
        filename={`${donorName}-transactions.csv`}
        headers={headers}
      >
        <Button variant="outline" size="sm">
          Download CSV
        </Button>
      </CSVLink>
    </div>
  );
}
