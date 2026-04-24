"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, X } from "lucide-react";

interface BlogLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, text?: string) => void;
  initialText?: string;
}

export default function BlogLinkModal({
  isOpen,
  onClose,
  onConfirm,
  initialText = "",
}: BlogLinkModalProps) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setUrl("");
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConfirm(url.trim(), text.trim() || url.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-[#F5F5F4] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-[#B45309]" />
            </div>
            <h3 className="text-lg font-bold text-[#1C1917]">Insertar enlace</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A8A29E] hover:text-[#44403C] hover:bg-[#F5F5F4] rounded-xl transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E]">
                Texto a mostrar
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ej: Haz clic aquí"
                className="w-full rounded-2xl bg-[#F5F5F4] px-5 py-4 text-sm font-medium text-[#1C1917] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#F59E0B]/20"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E]">
                URL del enlace
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                required
                className="w-full rounded-2xl bg-[#F5F5F4] px-5 py-4 text-sm font-medium text-[#1C1917] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#F59E0B]/20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl bg-[#E7E5E4] text-sm font-bold uppercase tracking-wider text-[#44403C] transition hover:bg-[#D6D3D1]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] h-14 rounded-2xl bg-[#B45309] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#92400E] shadow-lg shadow-amber-900/10"
            >
              Añadir enlace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
