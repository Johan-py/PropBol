"use client";

import { Payment } from "@/types/paymed";
import { usePaymentRisk } from "@/hooks/usePaymentRisk";

interface Props {
  payments: Payment[];
}

export const PaymentAlerts = ({ payments }: Props) => {
  const { payments: alerts, summary } = usePaymentRisk(payments);

  const colors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 border rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold">Alertas de Riesgo de Pago</h2>

      {/* RESUMEN */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 border rounded text-center">
          <p className="text-sm text-gray-500">Alto</p>
          <p className="text-red-600 font-bold">{summary.high}</p>
        </div>
        <div className="p-3 border rounded text-center">
          <p className="text-sm text-gray-500">Medio</p>
          <p className="text-yellow-600 font-bold">{summary.medium}</p>
        </div>
        <div className="p-3 border rounded text-center">
          <p className="text-sm text-gray-500">Bajo</p>
          <p className="text-green-600 font-bold">{summary.low}</p>
        </div>
      </div>

      {/* LISTA */}
      {alerts.length === 0 && (
        <p className="text-gray-500">No hay pagos en riesgo</p>
      )}

      <div className="space-y-3">
        {alerts.map((p) => (
          <div
            key={p.id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">${p.amount}</p>
              <p className="text-sm text-gray-500">Vence: {p.dueDate}</p>
            </div>

            <span className={`px-3 py-1 rounded text-sm ${colors[p.risk!]}`}>
              {p.risk}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
