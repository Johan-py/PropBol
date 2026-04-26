"use client";

import { useState } from "react";
import BlogLinkModal from "./BlogLinkModal";
import BlogPublishModal from "./BlogPublishModal";
import SuccessToast from "./SuccessToast";

import BlogFormHeader from "./form/BlogFormHeader";
import BlogImageSection from "./form/BlogImageSection";
import BlogInfoFields from "./form/BlogInfoFields";
import BlogEditorSection from "./form/BlogEditorSection";
import BlogSidebar from "./form/BlogSidebar";
import { useBlogForm } from "@/hooks/useBlogForm";

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

export default function BlogCreateForm({
  blogId,
  initialValues,
  mode = "create",
  statusLabel,
}: BlogCreateFormProps) {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

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
    applyFormatting,
    insertLink,
    handleLinkConfirm,
    setIsLinkModalOpen,
    isLinkModalOpen,
    selectionForLink,
    setSelectedImageFile,
    submitBlog,
    undoContenido,
    redoContenido,
    validate,
  } = useBlogForm({ blogId, initialValues, mode });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) {
      return
    }

    const key = e.key.toLowerCase()

    if (key === "z") {
      e.preventDefault()

      if (e.shiftKey) {
        redoContenido()
      } else {
        undoContenido()
      }

      return
    }

    if (key === "y") {
      e.preventDefault()
      redoContenido()
      return
    }

    if (e.shiftKey) {
      return
    }

    switch (key) {
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

  const handleAction = (accion: "borrador" | "pendiente") => {
    if (accion === "borrador") {
      void submitBlog("borrador");
      return;
    }

    // Para publicar, validamos primero
    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsPublishModalOpen(true);
    }
  };

  const handleConfirmPublish = () => {
    setIsPublishModalOpen(false);
    void submitBlog("pendiente");
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
              event.preventDefault();
              handleAction("pendiente");
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
            {submitError && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {submitError}
              </p>
            )}
          </form>
        </div>

        {/* Sidebar */}
        <BlogSidebar
          statusLabel={statusLabel}
          isSubmitting={isSubmitting}
          onAction={handleAction}
        />
      </div>

      <BlogLinkModal
        isOpen={isLinkModalOpen}
        initialText={selectionForLink}
        onClose={() => setIsLinkModalOpen(false)}
        onConfirm={handleLinkConfirm}
      />

      <BlogPublishModal
        isOpen={isPublishModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
      />

      <SuccessToast
        message={successMessage}
        isOpen={!!successMessage}
        onClose={() => {}} // El hook redirige rápido, así que no es crítico el reset manual aquí
      />
    </div>
  );
}
