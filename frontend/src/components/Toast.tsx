"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export const Toast = ({ message, type = "info", onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseStyle =
    "fixed bottom-5 right-5 px-4 py-2 rounded text-white shadow-lg transition-all";

  const typeStyle = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return <div className={`${baseStyle} ${typeStyle[type]}`}>{message}</div>;
};
