"use client";

import { useCallback, useState } from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

export type ImportFormState = {
  projectId: string;
  categoryId: string;
  donorId: string;
  matchedTransactionId: string | null;
  selectedDonationIds: Id<"transactions">[];
};

const INITIAL_STATE: ImportFormState = {
  projectId: "",
  categoryId: "",
  donorId: "",
  matchedTransactionId: null,
  selectedDonationIds: [],
};

export function useImportForm() {
  const [form, setForm] = useState<ImportFormState>(INITIAL_STATE);

  const updateForm = useCallback((updates: Partial<ImportFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearForm = useCallback(() => {
    setForm(INITIAL_STATE);
  }, []);

  const initFromTransaction = useCallback(
    (transaction: Doc<"transactions"> | null) => {
      if (!transaction) {
        clearForm();
        return;
      }
      setForm({
        projectId: transaction.projectId || "",
        categoryId: transaction.categoryId || "",
        donorId: transaction.donorId || "",
        matchedTransactionId: transaction.matchedTransactionId || null,
        selectedDonationIds: [],
      });
    },
    [clearForm],
  );

  return {
    ...form,
    setProjectId: (v: string) => updateForm({ projectId: v }),
    setCategoryId: (v: string) => updateForm({ categoryId: v }),
    setDonorId: (v: string) => updateForm({ donorId: v }),
    setMatchedTransactionId: (v: string | null) =>
      updateForm({ matchedTransactionId: v }),
    setSelectedDonationIds: (v: Id<"transactions">[]) =>
      updateForm({ selectedDonationIds: v }),
    clearForm,
    initFromTransaction,
  };
}
