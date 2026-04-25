"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import BlogLinkModal from "./BlogLinkModal";

import BlogFormHeader from "./form/BlogFormHeader";
import BlogImageSection from "./form/BlogImageSection";
import BlogInfoFields from "./form/BlogInfoFields";
import BlogEditorSection from "./form/BlogEditorSection";
import BlogSidebar from "./form/BlogSidebar";
import { useBlogForm } from "@/hooks/useBlogForm";

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
  const {
    titulo,
    setTitulo,
    categoriaId,
    setCategoriaId,
    contenido,
    setContenido,
    categories,
    isLoadingCategories,
    loadError,
    autosaveMessage,
    isSubmitting,
    submitError,
    successMessage,
    fieldErrors,
    setFieldErrors,
    textareaRef,
    imagePreviewUrl,
    isFormDirty,
    applyFormatting,
    insertLink,
    handleLinkConfirm,
    setIsLinkModalOpen,
    isLinkModalOpen,
    selectionForLink,
    setSelectedImageFile,
    submitBlog,
    router,
    autosaveKey
  } = useBlogForm({ blogId, initialValues, mode });



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

            {/* Editor Section */}
            <BlogEditorSection
              contenido={contenido}
              setContenido={setContenido}
              textareaRef={textareaRef}
              applyFormatting={applyFormatting}
              insertLink={insertLink}
              onKeyDown={handleKeyDown}
              error={fieldErrors.contenido}
            />

            {/* Feedback Messages */}
            {loadError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">{loadError}</p>}
            {autosaveMessage && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 font-medium">{autosaveMessage}</p>}
            {submitError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">{submitError}</p>}
            {successMessage && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">{successMessage}</p>}
          </form>
        </div>

        {/* Sidebar */}
        <BlogSidebar
          statusLabel={statusLabel}
          isSubmitting={isSubmitting}
          onAction={(accion) => void submitBlog(accion)}
        />
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