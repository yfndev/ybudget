"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ReimbursementFormUI, type Receipt } from "./ReimbursementFormUI";
import {
  TravelReimbursementFormUI,
  type TravelInfo,
  type TravelReceipt,
} from "./TravelReimbursementFormUI";

type BankDetails = {
  iban: string;
  bic: string;
  accountHolder: string;
};

const EMPTY_BANK_DETAILS: BankDetails = {
  iban: "",
  bic: "",
  accountHolder: "",
};

const EMPTY_TRAVEL_INFO: TravelInfo = {
  startDate: "",
  endDate: "",
  destination: "",
  purpose: "",
  isInternational: false,
};

export default function ReimbursementFormPage() {
  const router = useRouter();
  const bankDetailsQuery = useQuery(
    api.reimbursements.queries.getUserBankDetails,
  );
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
  const [bankDetails, setBankDetails] =
    useState<BankDetails>(EMPTY_BANK_DETAILS);
  const [bankDetailsLoaded, setBankDetailsLoaded] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [travelInfo, setTravelInfo] = useState<TravelInfo>(EMPTY_TRAVEL_INFO);
  const [travelReceipts, setTravelReceipts] = useState<TravelReceipt[]>([]);

  useEffect(() => {
    if (bankDetailsQuery && !bankDetailsLoaded) {
      setBankDetails(bankDetailsQuery);
      setBankDetailsLoaded(true);
    }
  }, [bankDetailsQuery, bankDetailsLoaded]);

  const handleBankDetailsUpdate = async () => {
    if (editingBank) {
      await updateUserBankDetails(bankDetails);
    }
    setEditingBank(!editingBank);
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      toast.error("Bitte ein Projekt auswählen");
      return;
    }

    if (reimbursementType === "expense") {
      const amount = receipts.reduce((sum, r) => sum + r.grossAmount, 0);
      await createReimbursement({
        projectId: selectedProjectId,
        amount,
        ...bankDetails,
        receipts,
      });
    } else {
      const amount = travelReceipts.reduce((sum, r) => sum + r.grossAmount, 0);
      await createTravelReimbursement({
        projectId: selectedProjectId,
        amount,
        ...bankDetails,
        ...travelInfo,
        receipts: travelReceipts,
      });
    }
    router.push("/reimbursement");
  };

  const sharedProps = {
    selectedProjectId,
    setSelectedProjectId,
    bankDetails,
    setBankDetails,
    editingBank,
    onBankToggle: handleBankDetailsUpdate,
    onSubmit: handleSubmit,
    reimbursementType,
    setReimbursementType,
  };

  return (
    <div>
      <PageHeader title="Neue Erstattung" showBackButton />
      {reimbursementType === "travel" ? (
        <TravelReimbursementFormUI
          {...sharedProps}
          travelInfo={travelInfo}
          setTravelInfo={setTravelInfo}
          receipts={travelReceipts}
          setReceipts={setTravelReceipts}
        />
      ) : (
        <ReimbursementFormUI
          {...sharedProps}
          receipts={receipts}
          setReceipts={setReceipts}
        />
      )}
    </div>
  );
}
