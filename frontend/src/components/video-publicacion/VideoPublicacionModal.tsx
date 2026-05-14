'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import VideoPublicacionCard from './VideoPublicacionCard';

type VideoPublicacionModalProps = {
  onClose?: () => void;
  onContinue?: () => void;
};

export default function VideoPublicacionModal({
  onClose,
  onContinue,
}: VideoPublicacionModalProps) {
  const [aceptado, setAceptado] = useState(false);

  const handleContinue = () => {
    if (!aceptado) return;

    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <section className="relative w-full max-w-[620px] rounded-2xl bg-white px-7 py-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 transition hover:text-gray-800"
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Antes de publicar tu propiedad
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Mira este video y conoce qué necesitas tener listo
            <br />
            para crear tu publicación de forma exitosa.
          </p>

          <p className="mt-5 text-sm font-semibold text-gray-900">
            Video explicativo
          </p>
        </div>

        <VideoPublicacionCard />

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={aceptado}
            onChange={(e) => setAceptado(e.target.checked)}
            className="h-5 w-5 rounded border-orange-500 accent-orange-500"
          />
          Sí entiendo qué necesito para publicar una propiedad
        </label>

        <button
          type="button"
          disabled={!aceptado}
          onClick={handleContinue}
          className={`mt-5 w-full rounded-lg py-3 text-sm font-semibold text-white transition ${
            aceptado
              ? 'bg-orange-400 hover:bg-orange-500'
              : 'cursor-not-allowed bg-orange-300 opacity-70'
          }`}
        >
          Continuar
        </button>
      </section>
    </div>
  );
}