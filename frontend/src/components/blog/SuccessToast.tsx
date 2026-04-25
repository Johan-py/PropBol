"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

type SuccessToastProps = {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
};

export default function SuccessToast({
  message,
  isOpen,
  onClose,
  duration = 5000,
}: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Esperar a que termine la animación de salida
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed left-1/2 top-24 z-[110] w-full max-w-sm -translate-x-1/2 px-4 transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
      }`}
    >
      <div className="flex items-center gap-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-bold text-stone-900">¡Éxito!</p>
          <p className="text-xs text-stone-500">{message}</p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="rounded-lg p-1 text-stone-300 transition-colors hover:bg-stone-50 hover:text-stone-500"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Barra de progreso inferior */}
        <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-[5000ms] ease-linear" style={{ width: isVisible ? '100%' : '0%' }} />
      </div>
    </div>
  );
}
