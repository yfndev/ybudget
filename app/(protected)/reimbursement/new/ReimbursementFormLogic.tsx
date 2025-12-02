"use client";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ReimbursementFormUI } from "./ReimbursementFormUI";

const calculateNet = (gross: number, taxRate: number) => gross / (1 + taxRate / 100);

const emptyReceipt = {
  receiptDate: "",
  companyName: "",
  description: "",
  grossAmount: "",
  taxRate: "19",
  receiptNumber: "",
  fileStorageId: "" as Id<"_storage"> | "",
};

export default function ReimbursementFormLogic() {
  const router = useRouter();
  const bankDetailsQuery = useQuery(api.reimbursements.queries.getUserBankDetails);
  const createReimbursement = useMutation(api.reimbursements.mutations.createReimbursement);
  const updateUserBankDetails = useMutation(api.users.functions.updateBankDetails);

  const [bankDetails, setBankDetails] = useState({ iban: "", bic: "", accountHolder: "" });
  const [editingBank, setEditingBank] = useState(false);
  const [receipts, setReceipts] = useState<Doc<"receipts">[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState(emptyReceipt);

  if (bankDetailsQuery && bankDetails.iban === "" && bankDetails.bic === "" && bankDetails.accountHolder === "") {
    setBankDetails(bankDetailsQuery);
  }

  const calculatedNet = currentReceipt.grossAmount
    ? calculateNet(parseFloat(currentReceipt.grossAmount), parseFloat(currentReceipt.taxRate))
    : 0;

  const handleAddReceipt = () => {
    if (!currentReceipt.receiptNumber || !currentReceipt.companyName || !currentReceipt.grossAmount || !currentReceipt.fileStorageId) {
      toast.error("Bitte Pflichtfelder ausfüllen");
      return;
    }

    const gross = parseFloat(currentReceipt.grossAmount);
    const taxRate = parseFloat(currentReceipt.taxRate);

    const receipt = {
      receiptNumber: currentReceipt.receiptNumber,
      receiptDate: currentReceipt.receiptDate,
      companyName: currentReceipt.companyName,
      description: currentReceipt.description,
      netAmount: calculateNet(gross, taxRate),
      taxRate,
      grossAmount: gross,
      fileStorageId: currentReceipt.fileStorageId as Id<"_storage">,
    };

    setReceipts([...receipts, { ...receipt, _id: crypto.randomUUID() as any, _creationTime: Date.now(), reimbursementId: "" as any }]);

    setCurrentReceipt(emptyReceipt);
    toast.success(`Beleg ${receipts.length + 1} hinzugefügt`);
  };

  const handleDeleteReceipt = (id: Id<"receipts">) => {
    setReceipts(receipts.filter((r) => r._id !== id));
    toast.success("Beleg entfernt");
  };

  const handleBankDetailsUpdate = async () => {
    if (editingBank) {
      await updateUserBankDetails(bankDetails);
    }
    setEditingBank(!editingBank);
  };

  const handleSubmit = async () => {
    if (receipts.length === 0) {
      toast.error("Mindestens ein Beleg erforderlich");
      return;
    }

    await createReimbursement({
      amount: receipts.reduce((sum, r) => sum + r.grossAmount, 0),
      ...bankDetails,
      receipts: receipts.map(r => ({
        receiptNumber: r.receiptNumber,
        receiptDate: r.receiptDate,
        companyName: r.companyName,
        description: r.description,
        netAmount: r.netAmount,
        taxRate: r.taxRate,
        grossAmount: r.grossAmount,
        fileStorageId: r.fileStorageId,
      })),
    });

    toast.success("Auslagenerstattung zur Genehmigung eingereicht");
    router.push("/reimbursement");
  };

  return (
    <ReimbursementFormUI
      bankDetails={bankDetails}
      setBankDetails={setBankDetails}
      editingBank={editingBank}
      setEditingBank={handleBankDetailsUpdate}
      currentReceipt={currentReceipt}
      setCurrentReceipt={setCurrentReceipt}
      calculatedNet={calculatedNet}
      handleAddReceipt={handleAddReceipt}
      receipts={receipts}
      handleDeleteReceipt={handleDeleteReceipt}
      handleSubmit={handleSubmit}
    />
  );
}
