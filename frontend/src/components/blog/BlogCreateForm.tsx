"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  Camera,
  Link,
  List,
  Quote,
  Type,
  Bold,
  Italic,
  MessageSquare,
} from "lucide-react";

import {
  createBlog,
  getBlogCategories,
  updateBlog,
  uploadBlogImage,
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
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];


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

function isValidImageFile(file: File) {
  return (
    ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE_BYTES
  );
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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

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
    setSelectedImageFile(null);
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

  const imagePreviewUrl = useMemo(() => {
    if (!selectedImageFile) {
      return imagen.trim() || "";
    }

    return URL.createObjectURL(selectedImageFile);
  }, [imagen, selectedImageFile]);

  useEffect(() => {
    if (!selectedImageFile || !imagePreviewUrl.startsWith("blob:")) {
      return;
    }

    return () => {
      window.URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl, selectedImageFile]);

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

    if (!selectedImageFile && !imagen.trim()) {
      nextErrors.imagen = "La imagen es obligatoria.";
    } else if (selectedImageFile && !isValidImageFile(selectedImageFile)) {
      nextErrors.imagen =
        "La imagen debe ser JPG, PNG o WebP y no superar los 5 MB.";
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
      const imageUrl = selectedImageFile
        ? (await uploadBlogImage(selectedImageFile)).url
        : imagen.trim();
      const payload = {
        titulo: titulo.trim(),
        imagen: imageUrl,
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
      setImagen(imageUrl);
      setSelectedImageFile(null);
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
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Main Content Area */}
        <div className="space-y-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B45309]">
              {mode === "edit" ? "Editar blog" : "Nuevo aporte al blog"}
            </p>
            <h1 className="font-heading mt-4 text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1C1917]">
              {mode === "edit" ? (
                "Ajusta tu artículo antes de volver a enviarlo."
              ) : (
                <>
                  Comparte tu conocimiento <br />
                  <span className="italic text-[#B45309]">con la comunidad.</span>
                </>
              )}
            </h1>
          </div>

          <form
            id="blog-form"
            className="space-y-8"
            onSubmit={(event) => {
              void handleSubmit(event, "pendiente");
            }}
          >
            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#E7E5E4] bg-[#FAFAFA] px-10 py-12 text-center transition hover:border-[#F59E0B] hover:bg-white group">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedImageFile(file);
                    setFieldErrors((currentErrors) => ({
                      ...currentErrors,
                      imagen: undefined,
                    }));
                  }}
                />

                {imagePreviewUrl ? (
                  <div className="absolute inset-0 overflow-hidden rounded-[32px]">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                      <Camera className="h-10 w-10 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                      <Camera className="h-6 w-6 text-[#A8A29E]" />
                    </div>
                    <p className="text-base font-semibold text-[#1C1917]">
                      Arrastra y suelta la imagen destacada
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#78716C]">
                      Recomendado: 1920×820px (JPG, PNG)
                    </p>
                  </>
                )}
              </label>
              {fieldErrors.imagen && (
                <p className="px-2 text-sm font-medium text-red-500">{fieldErrors.imagen}</p>
              )}
            </div>

            {/* Title Section */}
            <div className="space-y-3">
              <span className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E]">
                Titulo del post
              </span>
              <input
                type="text"
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Escribe un título"
                className="w-full rounded-[20px] bg-[#F5F5F4] px-6 py-5 text-xl font-bold text-[#1C1917] placeholder:text-[#D6D3D1] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#F59E0B]/20"
              />
              {fieldErrors.titulo && (
                <p className="px-2 text-sm font-medium text-red-500">{fieldErrors.titulo}</p>
              )}
            </div>

            {/* Category Section */}
            <div className="space-y-3">
              <span className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E]">
                Categoría
              </span>
              <div className="relative">
                <select
                  value={categoriaId}
                  onChange={(event) => setCategoriaId(event.target.value)}
                  disabled={isLoadingCategories}
                  className="w-full appearance-none rounded-2xl bg-[#F5F5F4] px-6 py-4 text-sm font-semibold text-[#44403C] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#F59E0B]/20 disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingCategories ? "Cargando..." : "Selecciona una categoría"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 text-[#A8A29E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {fieldErrors.categoria_id && (
                <p className="px-2 text-sm font-medium text-red-500">{fieldErrors.categoria_id}</p>
              )}
            </div>

            {/* Content Section */}
            <div className="space-y-3">
              <span className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E]">
                Contenido del artículo
              </span>

              <div className="rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 overflow-hidden">
                {/* Visual Toolbar */}
                <div className="flex items-center gap-2 border-b border-[#F5F5F4] px-6 py-4">
                  <button type="button" className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><Bold className="h-4 w-4" /></button>
                  <button type="button" className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><Italic className="h-4 w-4" /></button>
                  <button type="button" className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><List className="h-4 w-4" /></button>
                  <button type="button" className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><Quote className="h-4 w-4" /></button>
                  <div className="w-px h-6 bg-[#F5F5F4] mx-2" />
                  <button type="button" className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><Link className="h-4 w-4" /></button>
                </div>

                <textarea
                  value={contenido}
                  onChange={(event) => setContenido(event.target.value)}
                  placeholder="Comienza a escribir tu historia aquí..."
                  rows={15}
                  className="w-full px-8 py-8 text-lg leading-relaxed text-[#44403C] placeholder:text-[#D6D3D1] outline-none resize-none"
                />
              </div>
              {fieldErrors.contenido && (
                <p className="px-2 text-sm font-medium text-red-500">{fieldErrors.contenido}</p>
              )}
            </div>

            {/* Feedback Messages */}
            {loadError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">{loadError}</p>}
            {autosaveMessage && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 font-medium">{autosaveMessage}</p>}
            {submitError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">{submitError}</p>}
            {successMessage && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">{successMessage}</p>}
          </form>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:pt-24">
          {/* Action Card */}
          <div className="rounded-[32px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 space-y-5">
            <h2 className="text-xl font-bold text-[#1C1917]">Publicación</h2>

            <div className="space-y-3">
              <button
                type="submit"
                form="blog-form"
                onClick={(e) => {
                  e.preventDefault();
                  void submitBlog("pendiente");
                }}
                disabled={isSubmitting || isLoadingCategories}
                className="w-full flex h-[56px] items-center justify-center rounded-[20px] bg-[#B45309] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#92400E] shadow-lg shadow-amber-900/10 disabled:opacity-50"
              >
                {isSubmitting ? "Enviando..." : "Publicar"}
              </button>

              <button
                type="button"
                onClick={() => void submitBlog("borrador")}
                disabled={isSubmitting || isLoadingCategories}
                className="w-full flex h-[56px] items-center justify-center rounded-[20px] bg-[#E7E5E4] text-sm font-bold uppercase tracking-wider text-[#44403C] transition hover:bg-[#D6D3D1] disabled:opacity-50"
              >
                Guardar borrador
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-[#78716C]">Estado</span>
              <span className="inline-flex items-center rounded-lg bg-[#E7E5E4] px-3 py-1 text-[10px] font-bold text-[#44403C]">
                {statusLabel ?? "BORRADOR"}
              </span>
            </div>
          </div>

          {/* Guides Card */}
          <div className="rounded-[32px] bg-[#F5F5F4]/60 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-[#B45309]" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78716C]">
                Guías de un buen post
              </h3>
            </div>

            <div className="space-y-6">
              {[
                {
                  num: "01",
                  text: "Prioriza la claridad sobre la complejidad. Usa encabezados descriptivos para guiar al lector.",
                },
                {
                  num: "02",
                  text: "Asegúrate de que todas las imágenes sean de alta resolución e incluyan créditos apropiados.",
                },
                {
                  num: "03",
                  text: "Los enlaces deben abrirse en pestañas nuevas y dirigir a fuentes autorizadas.",
                },
              ].map((item) => (
                <div key={item.num} className="flex gap-4">
                  <span className="text-xl font-black text-[#B45309] leading-none">{item.num}</span>
                  <p className="text-xs font-medium leading-relaxed text-[#57534E]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
