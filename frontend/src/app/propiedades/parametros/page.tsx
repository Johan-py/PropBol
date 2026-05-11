"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExtrasPropiedad from "@/components/extras-propiedad/ExtrasPropiedad";

type ParametroBackend = {
  id: number;
  nombre: string;
  descripcion?: string | null;
};

type ParametroPublicacion = {
  id: number;
  nombre: string;
};

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("Falta NEXT_PUBLIC_API_URL en el entorno");
  }

  return apiUrl;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5efe7] p-8">
          Cargando parámetros...
        </div>
      }
    >
      <ParametrosPageContent />
    </Suspense>
  );
}

function ParametrosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const publicacionIdParam = searchParams.get("publicacionId");
  const publicacionId = publicacionIdParam ? Number(publicacionIdParam) : null;

  // Acepta los dos nombres por seguridad:
  // returnTo viene desde Mis Publicaciones
  // origen puede venir desde Multimedia u otro flujo
  const returnTo = searchParams.get("returnTo");
  const origen = searchParams.get("origen");

  const [catalogoParametros, setCatalogoParametros] = useState<ParametroBackend[]>([]);
  const [parametrosGuardados, setParametrosGuardados] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarModalExito, setMostrarModalExito] = useState(false);

  const volverSegunOrigen = () => {
    const destino = returnTo || origen;

    if (destino === "mis-publicaciones") {
      router.push("/mis-publicaciones");
      return;
    }

    if (destino === "multimedia" && publicacionId && !Number.isNaN(publicacionId)) {
      router.push(`/contenido-multimedia?publicacionId=${publicacionId}`);
      return;
    }

    if (publicacionId && !Number.isNaN(publicacionId)) {
      router.push(`/contenido-multimedia?publicacionId=${publicacionId}`);
      return;
    }

    router.push("/mis-publicaciones");
  };

  useEffect(() => {
    const cargarDatos = async () => {
      if (!publicacionId || Number.isNaN(publicacionId)) {
        setMensaje("No se recibió un ID válido de la publicación.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setMensaje("");

        const [catalogoRes, publicacionRes] = await Promise.all([
          fetch(`${getApiUrl()}/api/parametros`),
          fetch(`${getApiUrl()}/api/publicaciones/${publicacionId}/parametros`),
        ]);

        const catalogoJson = await catalogoRes.json().catch(() => null);
        const publicacionJson = await publicacionRes.json().catch(() => null);

        if (!catalogoRes.ok) {
          throw new Error(catalogoJson?.message || "No se pudieron obtener los parámetros.");
        }

        if (!publicacionRes.ok) {
          throw new Error(
            publicacionJson?.message || "No se pudieron obtener los parámetros de la publicación."
          );
        }

        const catalogo: ParametroBackend[] = Array.isArray(catalogoJson?.data)
          ? catalogoJson.data
          : [];

        const parametrosPublicacion: ParametroPublicacion[] = Array.isArray(publicacionJson?.data)
          ? publicacionJson.data
              .map((item: any) => ({
                id: item.parametros_personalizados?.id,
                nombre: item.parametros_personalizados?.nombre,
              }))
              .filter((item: ParametroPublicacion) => item.id && item.nombre)
          : [];

        setCatalogoParametros(catalogo);
        setParametrosGuardados(parametrosPublicacion.map((item) => item.nombre));
      } catch (error) {
        const mensajeError =
          error instanceof Error ? error.message : "Error al cargar parámetros.";
        setMensaje(mensajeError);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [publicacionId]);

  const crearParametroSiNoExiste = async (nombre: string, token: string) => {
    const existente = catalogoParametros.find(
      (item) => item.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
    );

    if (existente) return existente;

    const response = await fetch(`${getApiUrl()}/api/parametros`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre,
        descripcion: `Parámetro personalizado: ${nombre}`,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.mensaje || data?.message || `No se pudo crear el parámetro "${nombre}".`
      );
    }

    const creado: ParametroBackend = data?.data;

    if (!creado?.id) {
      throw new Error(`No se recibió el ID del parámetro "${nombre}".`);
    }

    setCatalogoParametros((prev) => [...prev, creado]);
    return creado;
  };

  const manejarGuardarParametros = async (parametros: string[]) => {
    if (!publicacionId || Number.isNaN(publicacionId)) {
      setMensaje("No se recibió un ID válido de la publicación.");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró la sesión del usuario.");
      }

      const parametrosConId: Array<{ parametroId: number; valor: null }> = [];

      for (const nombre of parametros) {
        const parametro = await crearParametroSiNoExiste(nombre, token);

        parametrosConId.push({
          parametroId: parametro.id,
          valor: null,
        });
      }

      const response = await fetch(
        `${getApiUrl()}/api/publicaciones/${publicacionId}/parametros`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            parametros: parametrosConId,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.mensaje || data?.message || "No se pudieron guardar los parámetros."
        );
      }

      setParametrosGuardados(parametros);
      setMostrarModalExito(true);

      setTimeout(() => {
        setMostrarModalExito(false);
        volverSegunOrigen();
      }, 1500);
    } catch (error) {
      const mensajeError =
        error instanceof Error ? error.message : "Ocurrió un error al guardar.";
      setMensaje(mensajeError);
    } finally {
      setGuardando(false);
    }
  };

 return (
  <main className="min-h-screen bg-[#f5efe7] px-6 py-8">
    <div className="mx-auto max-w-[1000px] rounded-[32px] border border-[#ECECEC] bg-white p-2 shadow-sm">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-[56px] font-bold leading-tight text-[#101828]">
          Parámetros personalizados
        </h1>

        <p className="mt-4 text-[22px] text-[#667085]">
          Agrega características adicionales que hacen única tu propiedad.
        </p>
      </div>

      {/* MENSAJE */}
      {mensaje && (
        <div className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-base text-orange-700">
          {mensaje}
        </div>
      )}

      {/* CONTENIDO */}
      <div className="rounded-[32px] border border-[#ECECEC] bg-white">
        {cargando ? (
          <div className="p-10 text-lg text-gray-600">
            Cargando parámetros...
          </div>
        ) : (
          <ExtrasPropiedad
            valoresIniciales={parametrosGuardados}
            catalogoParametros={catalogoParametros}
            onGuardar={manejarGuardarParametros}
            onCancelar={volverSegunOrigen}
          />
        )}
      </div>

      {/* GUARDANDO */}
      {guardando && !mostrarModalExito && (
        <p className="mt-6 text-base text-gray-600">
          Guardando parámetros...
        </p>
      )}
    </div>

    {/* MODAL */}
    {mostrarModalExito && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-[32px] bg-white px-8 py-10 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-500 text-5xl font-bold text-white">
            ✓
          </div>

          <p className="text-2xl font-bold text-[#101828]">
            ¡Parámetros guardados correctamente!
          </p>
        </div>
      </div>
    )}
  </main>
);
}