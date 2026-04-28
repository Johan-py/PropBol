"use client";

import { Payment, RiskLevel } from "@/types/paymed";

export const usePaymentRisk = (payments: Payment[]) => {
  const today = new Date();

  const calculateRisk = (payment: Payment): RiskLevel | null => {
    if (payment.status === "paid") return null;

    const due = new Date(payment.dueDate);
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return "high";
    if (diffDays <= 5) return "medium";
    return "low";
  };

  const enrichedPayments = payments
    .map((p) => ({
      ...p,
      risk: calculateRisk(p),
    }))
    .filter((p) => p.risk !== null);

  const sorted = enrichedPayments.sort((a, b) => {
    const order = { high: 3, medium: 2, low: 1 };
    return order[b.risk!] - order[a.risk!];
  });

  const summary = {
    high: sorted.filter((p) => p.risk === "high").length,
    medium: sorted.filter((p) => p.risk === "medium").length,
    low: sorted.filter((p) => p.risk === "low").length,
  };

  return { payments: sorted, summary };
};
