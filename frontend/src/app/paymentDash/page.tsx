"use client";

import { useEffect, useState } from "react";
import { PaymentsDashboard } from "@/components/PaymentsDashboard";
import { Loader } from "@/components/Loader";

type Payment = {
  id: number;
  amount: number;
  dueDate: string;
  status: "paid" | "pending";
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER VISUAL */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 shadow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">
            Gestión de Pagos
          </h1>
          <p className="text-blue-100 mt-1">
            Control, seguimiento y análisis financiero
          </p>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <PaymentsDashboard payments={payments} />
        </div>
      </div>
    </div>
  );
}