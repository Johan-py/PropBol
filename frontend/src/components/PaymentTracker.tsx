"use client";

import { useState } from "react";

type Payment = {
  id: number;
  amount: number;
  dueDate: string;
  status: "paid" | "pending";
};

const mockPayments: Payment[] = [
  { id: 1, amount: 500, dueDate: "2026-05-01", status: "paid" },
  { id: 2, amount: 500, dueDate: "2026-06-01", status: "pending" },
  { id: 3, amount: 500, dueDate: "2026-04-01", status: "pending" },
];

export const PaymentTracker = () => {
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  const today = new Date();

  const getStatus = (p: Payment) => {
    if (p.status === "paid") return "paid";
    if (new Date(p.dueDate) < today) return "overdue";
    return "pending";
  };

  const filtered = mockPayments.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  return (
    <div className="p-6 border rounded-xl shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Historial de Pagos</h2>

      {/* filtros */}
      <div className="flex gap-2 mb-4">
        {["all", "paid", "pending"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className="px-3 py-1 border rounded"
          >
            {f}
          </button>
        ))}
      </div>

      {/* lista */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const status = getStatus(p);

          const colors = {
            paid: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            overdue: "bg-red-100 text-red-700",
          };

          return (
            <div
              key={p.id}
              className="p-4 border rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">${p.amount}</p>
                <p className="text-sm text-gray-500">
                  Vence: {p.dueDate}
                </p>
              </div>

              <span
                className={`px-2 py-1 text-sm rounded ${colors[status]}`}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};