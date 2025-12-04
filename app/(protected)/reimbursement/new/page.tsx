"use client";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ReimbursementFormUI } from "./ReimbursementFormUI";
import { TravelReimbursementFormUI } from "./TravelReimbursementFormUI";

type TransportationMode = "car" | "train" | "flight" | "taxi" | "bus";

const calculateNet = (gross: number, taxRate: number) =>
  gross / (1 + taxRate / 100);

const emptyReceipt = {
  receiptDate: "",
  companyName: "",
  description: "",
  grossAmount: "",
  taxRate: "19",
  receiptNumber: "",
  fileStorageId: undefined as Id<"_storage"> | undefined,
};

export default function ReimbursementFormPage() {
  const router = useRouter();
  const bankDetailsQuery = useQuery(
    api.reimbursements.queries.getUserBankDetails,
  );
  const projects = useQuery(api.projects.queries.getAllProjects);
  const createReimbursement = useMutation(
    api.reimbursements.functions.createReimbursement,
  );
  const createTravelReimbursement = useMutation(
    api.reimbursements.functions.createTravelReimbursement,
  );
  const updateUserBankDetails = useMutation(
    api.users.functions.updateBankDetails,
  );

  const [reimbursementType, setReimbursementType] = useState<
    "expense" | "travel"
  >("expense");
  const [selectedProjectId, setSelectedProjectId] =
    useState<Id<"projects"> | null>(null);
  const [bankDetails, setBankDetails] = useState({
    iban: "",
    bic: "",
    accountHolder: "",
  });
  const [bankDetailsLoaded, setBankDetailsLoaded] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [receipts, setReceipts] = useState<
    Omit<Doc<"receipts">, "_id" | "_creationTime">[]
  >([]);
  const [currentReceipt, setCurrentReceipt] = useState(emptyReceipt);
  const [travelDetails, setTravelDetails] = useState({
    travelStartDate: "",
    travelEndDate: "",
    destination: "",
    travelPurpose: "",
    isInternational: false,
    transportationMode: "car" as TransportationMode,
    kilometers: 0,
    transportationAmount: 0,
    accommodationAmount: 0,
    transportationReceiptId: undefined as Id<"_storage"> | undefined,
    accommodationReceiptId: undefined as Id<"_storage"> | undefined,
  });

  useEffect(() => {
    if (bankDetailsQuery && !bankDetailsLoaded) {
      setBankDetails(bankDetailsQuery);
      setBankDetailsLoaded(true);
    }
  }, [bankDetailsQuery, bankDetailsLoaded]);

  const calculatedNet = currentReceipt.grossAmount
    ? calculateNet(
        parseFloat(currentReceipt.grossAmount),
        parseFloat(currentReceipt.taxRate),
      )
    : 0;

  const handleAddReceipt = () => {
    if (
      !currentReceipt.receiptNumber ||
      !currentReceipt.companyName ||
      !currentReceipt.grossAmount ||
      !currentReceipt.fileStorageId
    ) {
      toast.error("Bitte Pflichtfelder ausfüllen");
      return;
    }

    const gross = parseFloat(currentReceipt.grossAmount);
    const taxRate = parseFloat(currentReceipt.taxRate);

    setReceipts([
      ...receipts,
      {
        reimbursementId: "" as Id<"reimbursements">,
        receiptNumber: currentReceipt.receiptNumber,
        receiptDate: currentReceipt.receiptDate,
        companyName: currentReceipt.companyName,
        description: currentReceipt.description,
        netAmount: calculateNet(gross, taxRate),
        taxRate,
        grossAmount: gross,
        fileStorageId: currentReceipt.fileStorageId,
      },
    ]);

    setCurrentReceipt(emptyReceipt);
    toast.success(`Beleg ${receipts.length + 1} hinzugefügt`);
  };

  const handleDeleteReceipt = (index: number) => {
    setReceipts(receipts.filter((_, i) => i !== index));
    toast.success("Beleg entfernt");
  };

  const handleBankDetailsUpdate = async () => {
    if (editingBank) {
      await updateUserBankDetails(bankDetails);
    }
    setEditingBank(!editingBank);
  };

  const handleSubmit = async () => {
    if (reimbursementType === "expense") {
      await createReimbursement({
        projectId: selectedProjectId!,
        amount: receipts.reduce((sum, r) => sum + r.grossAmount, 0),
        ...bankDetails,
        receipts,
      });
    } else {
      await createTravelReimbursement({
        projectId: selectedProjectId!,
        amount:
          travelDetails.transportationAmount +
          travelDetails.accommodationAmount,
        ...bankDetails,
        travelDetails,
      });
    }
    router.push("/reimbursement");
  };

  if (reimbursementType === "travel") {
    return (
      <TravelReimbursementFormUI
        projects={projects || []}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        bankDetails={bankDetails}
        setBankDetails={setBankDetails}
        editingBank={editingBank}
        setEditingBank={handleBankDetailsUpdate}
        travelDetails={travelDetails}
        setTravelDetails={setTravelDetails}
        handleSubmit={handleSubmit}
        reimbursementType={reimbursementType}
        setReimbursementType={setReimbursementType}
      />
    );
  }

  return (
    <ReimbursementFormUI
      projects={projects || []}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={setSelectedProjectId}
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
      reimbursementType={reimbursementType}
      setReimbursementType={setReimbursementType}
    />
  );
}
