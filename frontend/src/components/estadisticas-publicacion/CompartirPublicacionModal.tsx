"use client";

import { X, MessageCircle, Facebook, Send, Mail, Copy } from "lucide-react";
import { registrarCompartido } from "@/services/estadisticas-publicacion.service";

type CompartirPublicacionModalProps = {
  open: boolean;
  onClose: () => void;
  publicacionId: string | number;
  titulo: string;
  url: string;
  estado?: string;
};

export default function CompartirPublicacionModal({
  open,
  onClose,
  publicacionId,
  titulo,
  url,
  estado,
}: CompartirPublicacionModalProps) {
  if (!open) return null;

  const puedeRegistrarCompartido =
    estado === "Publicada" ||
    estado === "publicada" ||
    estado === "ACTIVA" ||
    estado === "activa";

  const registrarAccionCompartido = async (plataforma: string) => {
    if (puedeRegistrarCompartido) {
      await registrarCompartido(publicacionId, plataforma);
    }
  };

  const compartirWhatsApp = async () => {
    await registrarAccionCompartido("whatsapp");

    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${titulo} - ${url}`)}`,
      "_blank"
    );
  };

  const compartirFacebook = async () => {
    await registrarAccionCompartido("facebook");

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const compartirTelegram = async () => {
    await registrarAccionCompartido("telegram");

    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(titulo)}`,
      "_blank"
    );
  };

  const compartirEmail = async () => {
    await registrarAccionCompartido("email");

    window.location.href = `mailto:?subject=${encodeURIComponent(
      titulo
    )}&body=${encodeURIComponent(url)}`;
  };

  const copiarEnlace = async () => {
    await registrarAccionCompartido("copiar_enlace");

    await navigator.clipboard.writeText(url);
    alert("Enlace copiado correctamente");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Compartir publicación
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            type="button"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={compartirWhatsApp}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-orange-400 hover:bg-orange-50"
            type="button"
          >
            <MessageCircle size={18} className="text-orange-500" />
            WhatsApp
          </button>

          <button
            onClick={compartirFacebook}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-orange-400 hover:bg-orange-50"
            type="button"
          >
            <Facebook size={18} className="text-orange-500" />
            Facebook
          </button>

          <button
            onClick={compartirTelegram}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-orange-400 hover:bg-orange-50"
            type="button"
          >
            <Send size={18} className="text-orange-500" />
            Telegram
          </button>

          <button
            onClick={compartirEmail}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-orange-400 hover:bg-orange-50"
            type="button"
          >
            <Mail size={18} className="text-orange-500" />
            Email
          </button>

          <button
            onClick={copiarEnlace}
            className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-orange-400 hover:bg-orange-50"
            type="button"
          >
            <Copy size={18} className="text-orange-500" />
            Copiar enlace
          </button>
        </div>
      </div>
    </div>
  );
}
