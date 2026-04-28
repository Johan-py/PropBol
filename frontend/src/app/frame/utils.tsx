"use client";

import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

export default function Page() {
  const { toast, showToast, hideToast } = useToast();

  return (
    <div>
      <h1>Demo</h1>

      <button
        onClick={() => showToast("Guardado correctamente", "success")}
        className="bg-black text-white px-4 py-2"
      >
        Mostrar Toast
      </button>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
