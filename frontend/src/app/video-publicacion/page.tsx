'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Play } from 'lucide-react';

type TutorialContent = {
  titulo: string;
  mensaje: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  subtitlesUrl: string | null;
  checkboxLabel: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VideoPublicacionPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [aceptado, setAceptado] = useState(false);
  const [contenido, setContenido] = useState<TutorialContent | null>(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const cargarTutorial = async () => {
      try {
        const token = getToken();

        const [contenidoResponse, estadoResponse] = await Promise.all([
          fetch(`${API_URL}/api/tutorial-publicacion`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/api/tutorial-publicacion/estado`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const contenidoResult = await contenidoResponse.json();
        const estadoResult = await estadoResponse.json();

        if (!contenidoResponse.ok || !estadoResponse.ok) {
          router.replace('/registro-inmueble');
          return;
        }

        if (!estadoResult.data?.debeMostrarTutorial) {
          router.replace('/registro-inmueble');
          return;
        }

        setContenido(contenidoResult.data);
      } catch (error) {
        console.error('Error al cargar tutorial:', error);
        router.replace('/registro-inmueble');
      } finally {
        setLoading(false);
      }
    };

    cargarTutorial();
  }, [router]);

  const continuar = async () => {
    try {
      const token = getToken();

      await fetch(`${API_URL}/api/tutorial-publicacion/confirmar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error al confirmar tutorial:', error);
    } finally {
      router.replace('/registro-inmueble');
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-600">Cargando tutorial...</p>
      </main>
    );
  }

  if (!contenido) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
        <section className="relative w-full max-w-[620px] rounded-2xl bg-white px-7 py-8 shadow-2xl">
          <button
            type="button"
            onClick={() => router.replace('/registro-inmueble')}
            className="absolute right-5 top-5 text-gray-500 transition hover:text-gray-800"
            aria-label="Cerrar tutorial"
          >
            <X size={24} />
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {contenido.titulo}
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {contenido.mensaje}
            </p>

            <p className="mt-5 text-sm font-semibold text-gray-900">
              Video explicativo
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl bg-[#FFF1E6]">
            <a
              href={contenido.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[240px] w-full items-center justify-between px-8"
            >
              <div>
                <h2 className="text-2xl font-bold leading-tight text-gray-900">
                  ¿Cómo publicar
                  <br />
                  <span className="text-orange-500">tu propiedad?</span>
                </h2>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-md">
                <Play size={34} fill="white" />
              </div>

              <div className="hidden sm:block">
                <img
                  src={
                    contenido.thumbnailUrl ||
                    '/images/video-publicacion/casa-publicacion.png'
                  }
                  alt="Tutorial de publicación"
                  className="h-[185px] w-auto object-contain"
                />
              </div>
            </a>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={aceptado}
              onChange={(e) => setAceptado(e.target.checked)}
              className="h-5 w-5 rounded border-orange-500 accent-orange-500"
            />
            {contenido.checkboxLabel}
          </label>

          <button
            type="button"
            disabled={!aceptado}
            onClick={continuar}
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
    </main>
  );
}
