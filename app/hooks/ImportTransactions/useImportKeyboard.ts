"use client";

import { useEffect } from "react";

export function useImportKeyboard(
  onNext: () => void,
  onPrev: () => void,
  onSave: () => void | Promise<void>,
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onNext();
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSave();
      }
      if (e.key === "ArrowLeft" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onSave]);
}
