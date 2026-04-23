"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createBlog,
  getBlogCategories,
  updateBlog,
  type BlogCategoryOption,
  type BlogCreationAction,
} from "@/services/blogs.service";

type FieldErrors = {
  categoria_id?: string;
  contenido?: string;
  imagen?: string;
  titulo?: string;
};

const INITIAL_ERRORS: FieldErrors = {};
const AUTOSAVE_STORAGE_PREFIX = "propbol_blog_form";

type BlogCreateFormProps = {
  blogId?: number;
  initialValues?: {
    categoriaId: string;
    contenido: string;
    imagen: string;
    titulo: string;
  };
  mode?: "create" | "edit";
  statusLabel?: "BORRADOR" | "RECHAZADO";
};

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export default function BlogCreateForm({
  blogId,
  initialValues,
  mode = "create",
  statusLabel,
}: BlogCreateFormProps) {
  const router = useRouter();
  const hasHydratedDraft = useRef(false);
  const [categories, setCategories] = useState<BlogCategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [autosaveMessage, setAutosaveMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(INITIAL_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [titulo, setTitulo] = useState(initialValues?.titulo ?? "");
  const [imagen, setImagen] = useState(initialValues?.imagen ?? "");
  const [categoriaId, setCategoriaId] = useState(initialValues?.categoriaId ?? "");
  const [contenido, setContenido] = useState(initialValues?.contenido ?? "");

  const autosaveKey = useMemo(
    () =>
      mode === "edit" && blogId
        ? `${AUTOSAVE_STORAGE_PREFIX}:edit:${blogId}`
        : `${AUTOSAVE_STORAGE_PREFIX}:create`,
    [blogId, mode],
  );

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const rows = await getBlogCategories();

        if (!isMounted) {
          return;
        }

        setCategories(rows);
        setLoadError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las categorías del blog.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setTitulo(initialValues?.titulo ?? "");
    setImagen(initialValues?.imagen ?? "");
    setCategoriaId(initialValues?.categoriaId ?? "");
    setContenido(initialValues?.contenido ?? "");
  }, [initialValues]);

  useEffect(() => {
    if (hasHydratedDraft.current) {
      return;
    }

    hasHydratedDraft.current = true;

    const rawDraft = window.localStorage.getItem(autosaveKey);

    if (!rawDraft) {
      return;
    }

    try {
      const draft = JSON.parse(rawDraft) as {
        categoriaId?: string;
        contenido?: string;
        imagen?: string;
        titulo?: string;
      };

      setTitulo(draft.titulo ?? initialValues?.titulo ?? "");
      setImagen(draft.imagen ?? initialValues?.imagen ?? "");
      setCategoriaId(draft.categoriaId ?? initialValues?.categoriaId ?? "");
      setContenido(draft.contenido ?? initialValues?.contenido ?? "");
      setAutosaveMessage("Recuperamos un borrador local para que continúes editando.");
    } catch {
      window.localStorage.removeItem(autosaveKey);
    }
  }, [autosaveKey, initialValues]);

  const isFormDirty = useMemo(() => {
    const baseTitulo = initialValues?.titulo?.trim() ?? "";
    const baseImagen = initialValues?.imagen?.trim() ?? "";
    const baseCategoriaId = initialValues?.categoriaId ?? "";
    const baseContenido = initialValues?.contenido?.trim() ?? "";

    return (
      titulo.trim() !== baseTitulo ||
      imagen.trim() !== baseImagen ||
      categoriaId !== baseCategoriaId ||
      contenido.trim() !== baseContenido
    );
  }, [categoriaId, contenido, imagen, initialValues, titulo]);

  useEffect(() => {
    const hasContent = Boolean(
      titulo.trim() || imagen.trim() || categoriaId || contenido.trim(),
    );

    if (!hasContent) {
      window.localStorage.removeItem(autosaveKey);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(
        autosaveKey,
        JSON.stringify({
          categoriaId,
          contenido,
          imagen,
          titulo,
        }),
      );
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autosaveKey, categoriaId, contenido, imagen, titulo]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isFormDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFormDirty]);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!titulo.trim()) {
      nextErrors.titulo = "El título es obligatorio.";
    }

    if (!imagen.trim()) {
      nextErrors.imagen = "La imagen es obligatoria.";
    } else if (!isValidImageUrl(imagen.trim())) {
      nextErrors.imagen = "Ingresa una URL válida para la imagen.";
    }

    if (!categoriaId) {
      nextErrors.categoria_id = "Selecciona una categoría.";
    }

    if (!contenido.trim()) {
      nextErrors.contenido = "El contenido es obligatorio.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const submitBlog = async (accion: BlogCreationAction) => {
    if (!validate()) {
      setSubmitError("");
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");
    setAutosaveMessage("");

    try {
      const payload = {
        titulo: titulo.trim(),
        imagen: imagen.trim(),
        categoria_id: Number(categoriaId),
        contenido: contenido.trim(),
        accion,
      };

      if (mode === "edit" && blogId) {
        await updateBlog(blogId, payload);
      } else {
        await createBlog(payload);
      }

      setFieldErrors(INITIAL_ERRORS);
      window.localStorage.removeItem(autosaveKey);
      setSuccessMessage(
        accion === "borrador"
          ? mode === "edit"
            ? "Los cambios del blog fueron guardados como borrador."
            : "El blog fue guardado como borrador exitosamente."
          : mode === "edit"
            ? "El blog fue actualizado y reenviado a revisión."
            : "El blog fue enviado a revisión y quedó pendiente de aprobación.",
      );

      window.setTimeout(() => {
        router.push("/blogs");
      }, 1200);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo guardar el blog.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    accion: BlogCreationAction,
  ) => {
    event.preventDefault();
    await submitBlog(accion);
  };

  const handleCancel = () => {
    if (
      isFormDirty &&
      !window.confirm("¿Deseas descartar los cambios no guardados?")
    ) {
      return;
    }

    window.localStorage.removeItem(autosaveKey);
    router.push("/blogs");
  };

  return (
    <div className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            void handleSubmit(event, "pendiente");
          }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
              {mode === "edit" ? "Editar blog" : "Nuevo aporte al blog"}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight text-stone-900">
              {mode === "edit"
                ? "Ajusta tu artículo antes de volver a enviarlo."
                : "Comparte tu conocimiento con la comunidad."}
            </h1>
            {statusLabel ? (
              <p className="mt-3 text-sm font-medium text-stone-500">
                Estado actual: <span className="font-semibold text-stone-700">{statusLabel}</span>
              </p>
            ) : null}
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              URL de la imagen destacada
            </span>
            <input
              type="url"
              value={imagen}
              onChange={(event) => setImagen(event.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
            />
            {fieldErrors.imagen ? (
              <p className="mt-2 text-sm text-red-600">{fieldErrors.imagen}</p>
            ) : (
              <p className="mt-2 text-xs text-stone-500">
                Usa una URL pública válida para la portada del artículo.
              </p>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Título del post
            </span>
            <input
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Escribe un título"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
            />
            {fieldErrors.titulo ? (
              <p className="mt-2 text-sm text-red-600">{fieldErrors.titulo}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Categoría
            </span>
            <select
              value={categoriaId}
              onChange={(event) => setCategoriaId(event.target.value)}
              disabled={isLoadingCategories}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 disabled:cursor-not-allowed disabled:bg-stone-100"
            >
              <option value="">
                {isLoadingCategories ? "Cargando categorías..." : "Selecciona una categoría"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.nombre}
                </option>
              ))}
            </select>
            {fieldErrors.categoria_id ? (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.categoria_id}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Contenido del artículo
            </span>
            <textarea
              value={contenido}
              onChange={(event) => setContenido(event.target.value)}
              placeholder="Comienza a escribir tu historia aquí..."
              rows={12}
              className="w-full rounded-3xl border border-stone-200 px-4 py-4 text-sm leading-7 text-stone-900 outline-none transition focus:border-amber-500"
            />
            {fieldErrors.contenido ? (
              <p className="mt-2 text-sm text-red-600">
                {fieldErrors.contenido}
              </p>
            ) : null}
          </label>

          {loadError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </p>
          ) : null}

          {autosaveMessage ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {autosaveMessage}
            </p>
          ) : null}
          {submitError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                void submitBlog("borrador");
              }}
              disabled={isSubmitting || isLoadingCategories || Boolean(loadError)}
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-stone-300 px-6 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mode === "edit" ? "Guardar cambios" : "Guardar borrador"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingCategories || Boolean(loadError)}
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-amber-600 px-6 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Enviando..."
                : mode === "edit"
                  ? "Enviar nuevamente"
                  : "Publicar"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl px-6 text-sm font-semibold text-stone-500 transition hover:bg-stone-50 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>

        <aside className="space-y-6 rounded-[28px] border border-stone-200 bg-stone-50 p-5">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-stone-900">Publicación</h2>
            <p className="text-sm leading-6 text-stone-600">
              {mode === "edit"
                ? "Guarda los cambios localmente o reenvía tu blog a revisión cuando esté listo."
                : "Usa “Guardar borrador” si quieres continuar luego, o “Publicar” para enviar tu blog a revisión del administrador."}
            </p>
          </div>

          <div className="space-y-3 border-t border-stone-200 pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Guías de un buen post
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-stone-600">
              <li>Prioriza un título claro y una categoría consistente.</li>
              <li>Usa una imagen pública válida para la portada.</li>
              <li>Redacta contenido completo antes de enviarlo a revisión.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
