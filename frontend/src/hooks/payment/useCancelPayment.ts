import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useCancelPayment() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const confirmCancel = async () => {
    setIsModalOpen(false);

    try {
      const stored = localStorage.getItem("currentPayment");
      if (stored) {
        const payment = JSON.parse(stored);
        await fetch(`/api/transacciones/${payment.id}/cancelar`, {
          method: "PATCH",
        });
        const planId = payment.planId;
        localStorage.removeItem("currentPayment");
        router.push(
          planId ? `/pago/resumen?planId=${planId}` : "/cobros-suscripciones",
        );
        return;
      }
    } catch {
      // No bloqueamos la navegación si la llamada falla
    }

    router.push("/cobros-suscripciones");
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isModalOpen]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return { isModalOpen, openModal, closeModal, confirmCancel };
}
