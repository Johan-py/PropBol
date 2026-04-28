"use client";

import { useEffect, useState } from "react";
import { PaymentTracker } from "@/components/PaymentTracker";
import { Loader } from "@/components/Loader";
import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

type Payment = {
  id: number;
  amount: number;
  dueDate: string;
  status: "paid" | "pending";
};

export default function Page() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast, showToast, hideToast } = useToast();

  // simulación de fetch (Sprint 3 = comportamiento más real)
  useEffect(() => {
    setTimeout(() => {
      const data: Payment[] = [
        { id: 1, amount: 500, dueDate: "2026-05-01", status: "paid" },
        { id: 2, amount: 500, dueDate: "2026-06-01", status: "pending" },
        { id: 3, amount: 500, dueDate: "2026-04-01", status: "pending" },
      ];

      setPayments(data);
      setLoading(false);

      showToast("Pagos cargados correctamente", "success");
    }, 1500);
  }, []);

  // métricas (nivel sprint 3)
  const total = payments.length;
  const paid = payments.filter((p) => p.status === "paid").length;
  const pending = total - paid;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
        <p className="text-gray-500">
          Seguimiento y estado de pagos del cliente
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg shadow">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold">{total}</p>
        </div>

        <div className="p-4 border rounded-lg shadow">
          <p className="text-sm text-gray-500">Pagados</p>
          <p className="text-xl font-bold text-green-600">{paid}</p>
        </div>

        <div className="p-4 border rounded-lg shadow">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-xl font-bold text-yellow-600">{pending}</p>
        </div>
      </div>

      {/* TRACKER */}
      <PaymentTracker />

      {/* TOAST */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
