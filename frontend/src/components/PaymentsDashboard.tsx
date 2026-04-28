"use client";

import { useState } from "react";
import { PaymentTracker } from "@/components/PaymentTracker";
import { PaymentAlerts } from "@/components/PaymentAlerts";

type Payment = {
  id: number;
  amount: number;
  dueDate: string;
  status: "paid" | "pending";
};

type View = "tracker" | "alerts";

interface Props {
  payments: Payment[];
}

export const PaymentsDashboard = ({ payments }: Props) => {
  const [view, setView] = useState<View>("tracker");

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Módulo de Pagos
        </h1>
        <p className="text-gray-500">
          Gestión y análisis de pagos del cliente
        </p>
      </div>

      {/* NAVEGACIÓN */}
      <div className="flex gap-3">
        <button
          onClick={() => setView("tracker")}
          className={`px-4 py-2 rounded border ${
            view === "tracker"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          Historial de Pagos
        </button>

        <button
          onClick={() => setView("alerts")}
          className={`px-4 py-2 rounded border ${
            view === "alerts"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          Alertas de Riesgo
        </button>
      </div>

      {/* CONTENIDO */}
      <div>
        {view === "tracker" && (
          <PaymentTracker />
        )}

        {view === "alerts" && (
          <PaymentAlerts payments={payments} />
        )}
      </div>
    </div>
  );
};