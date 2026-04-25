"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  Link,
  List,
  Quote,
  Type,
  Bold,
  Italic,
  MessageSquare,
  Eye,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import BlogLinkModal from "./BlogLinkModal";

import BlogFormHeader from "./form/BlogFormHeader";
import BlogImageSection from "./form/BlogImageSection";
import BlogInfoFields from "./form/BlogInfoFields";

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
  const [showPreview, setShowPreview] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectionForLink, setSelectionForLink] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      text.substring(end);

    setContenido(newText);

    // Restaurar el foco y la selección
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    setSelectionForLink(selectedText);
    setIsLinkModalOpen(true);
  };

  const handleLinkConfirm = (url: string, linkText: string = selectionForLink) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText =
      text.substring(0, start) +
      `[${linkText}](${url})` +
      text.substring(end);

    setContenido(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + linkText.length + url.length + 4; // [text](url) -> 4 extra chars
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          applyFormatting("**");
          break;
        case "i":
          e.preventDefault();
          applyFormatting("*");
          break;
        case "k":
          e.preventDefault();
          insertLink();
          break;
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Main Content Area */}
        <div className="space-y-8">
          <BlogFormHeader mode={mode} />

          <form
            id="blog-form"
            className="space-y-8"
            onSubmit={(event) => {
              void handleSubmit(event, "pendiente");
            }}
          >
            {/* Image Upload Section */}
            <BlogImageSection
              imagePreviewUrl={imagePreviewUrl}
              onImageChange={(file) => {
                setSelectedImageFile(file);
                setFieldErrors((prev) => ({ ...prev, imagen: undefined }));
              }}
              error={fieldErrors.imagen}
            />

            {/* Info Fields (Title & Category) */}
            <BlogInfoFields
              titulo={titulo}
              setTitulo={setTitulo}
              categoriaId={categoriaId}
              setCategoriaId={setCategoriaId}
              categories={categories}
              isLoadingCategories={isLoadingCategories}
              errors={fieldErrors}
            />

            {/* Content Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E]">
                  Contenido del artículo
                </span>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${showPreview ? "text-[#B45309] hover:text-[#92400E]" : "text-[#78716C] hover:text-[#44403C]"
                    }`}
                >
                  <Eye className={`h-3 w-3 ${showPreview ? "" : "opacity-50"}`} />
                  {showPreview ? "Ocultar vista previa" : "Mostrar vista previa"}
                </button>
              </div>

              <div className={`grid grid-cols-1 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-px rounded-[32px] bg-[#F5F5F4] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 overflow-hidden transition-all duration-300`}>
                {/* Editor Column */}
                <div className="bg-white flex flex-col">
                  {/* Visual Toolbar */}
                  <div className="flex items-center gap-2 border-b border-[#F5F5F4] px-6 py-4">
                    <button
                      type="button"
                      onClick={() => applyFormatting("**")}
                      title="Negrita (Ctrl+B)"
                      className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting("*")}
                      title="Cursiva (Ctrl+I)"
                      className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting("\n- ", "")}
                      title="Lista"
                      className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting("\n> ", "")}
                      title="Cita"
                      className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"
                    >
                      <Quote className="h-4 w-4" />
                    </button>
                    <div className="w-px h-6 bg-[#F5F5F4] mx-2" />
                    <button
                      type="button"
                      onClick={insertLink}
                      title="Enlace (Ctrl+K)"
                      className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"
                    >
                      <Link className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={contenido}
                    onChange={(event) => setContenido(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Comienza a escribir tu historia aquí..."
                    rows={18}
                    className="w-full flex-1 px-8 py-8 text-lg leading-relaxed text-[#44403C] placeholder:text-[#D6D3D1] outline-none resize-none min-h-[500px]"
                  />
                </div>

                {/* Preview Column */}
                {showPreview && (
                  <div className="bg-[#FAFAFA] flex flex-col border-l border-[#F5F5F4] animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="px-8 py-6 border-b border-[#F5F5F4] bg-[#F5F5F4]/30">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78716C]">
                        Vista Previa
                      </span>
                    </div>
                    <div className="flex-1 px-8 py-8 overflow-y-auto max-h-[600px] prose prose-stone prose-amber">
                      {contenido ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-4 text-[#1C1917]" {...props} />,
                            h2: ({ ...props }) => <h2 className="text-2xl font-bold mb-3 text-[#1C1917]" {...props} />,
                            h3: ({ ...props }) => <h3 className="text-xl font-bold mb-2 text-[#1C1917]" {...props} />,
                            p: ({ ...props }) => <p className="text-base leading-relaxed text-[#44403C] mb-4" {...props} />,
                            ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-[#44403C]" {...props} />,
                            ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-[#44403C]" {...props} />,
                            li: ({ ...props }) => <li className="text-[#44403C]" {...props} />,
                            blockquote: ({ ...props }) => (
                              <blockquote className="border-l-4 border-[#B45309] pl-4 italic text-[#78716C] my-4" {...props} />
                            ),
                            a: ({ ...props }) => (
                              <a className="text-[#B45309] underline hover:text-[#92400E] transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
                            ),
                          }}
                        >
                          {contenido}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40 py-20">
                          <div className="h-12 w-12 rounded-full bg-stone-200 flex items-center justify-center">
                            <Eye className="h-6 w-6 text-stone-400" />
                          </div>
                          <p className="text-sm font-medium text-stone-500">
                            El contenido formateado aparecerá aquí...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

      <BlogLinkModal
        isOpen={isLinkModalOpen}
        initialText={selectionForLink}
        onClose={() => setIsLinkModalOpen(false)}
        onConfirm={handleLinkConfirm}
      />
    </div>
  );
}