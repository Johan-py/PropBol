"use client";

import { useState } from "react";

export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type?: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
};
