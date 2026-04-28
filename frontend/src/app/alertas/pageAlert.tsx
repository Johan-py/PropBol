"use client";

import { useEffect, useState } from "react";
import { PaymentAlerts } from "@/components/PaymentAlerts";
import { Loader } from "@/components/Loader";

type Payment = {
  id: number;
  amount: number;
  dueDate: string;
  status: "paid" | "pending";
};

export default function AlertsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // simulación de backend (Sprint 3 ready)
  useEffect(() => {
    setTimeout(() => {
      setPayments([
        { id: 1, amount: 500, dueDate: "2026-04-01", status: "pending" },
        { id: 2, amount: 700, dueDate: "2026-05-01", status: "pending" },
        { id: 3, amount: 800, dueDate: "2026-06-10", status: "pending" },
        { id: 4, amount: 400, dueDate: "2026-03-15", status: "paid" },
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Riesgo de Pagos</h1>
        <p className="text-gray-500">
          Identificación de pagos en riesgo de mora
        </p>
      </div>

      <PaymentAlerts payments={payments} />
    </div>
  );
}
