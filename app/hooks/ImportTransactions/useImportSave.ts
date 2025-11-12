"use client";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback } from "react";
import toast from "react-hot-toast";

export function useImportSave() {
  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction,
  );

  const save = useCallback(
    async (
      transaction: Doc<"transactions">,
      formData: {
        projectId: string;
        categoryId: string;
        donorId: string;
        matchedTransactionId: string | null;
      },
    ) => {
      const { projectId, categoryId, donorId, matchedTransactionId } = formData;

      if (!projectId || !categoryId) {
        toast("Transaktion übersprungen", { icon: "⏭️" });
        return false;
      }

      const normalizedMatchedId =
        matchedTransactionId && matchedTransactionId !== ""
          ? matchedTransactionId
          : null;

      try {
        const isIncome = transaction.amount > 0;
        await updateTransaction({
          transactionId: transaction._id,
          projectId: projectId as Id<"projects">,
          categoryId: categoryId as Id<"categories">,
          ...(isIncome && donorId ? { donorId: donorId as Id<"donors"> } : {}),
          matchedTransactionId: normalizedMatchedId || undefined,
        });

        if (normalizedMatchedId) {
          await updateTransaction({
            transactionId: normalizedMatchedId as Id<"transactions">,
            matchedTransactionId: transaction._id,
          });
        }

        toast.success("Transaktion gespeichert");
        return true;
      } catch (_error) {
        toast.error("Fehler beim Speichern");
        return false;
      }
    },
    [updateTransaction],
  );

  return { save };
}
