"use client";

import { useRef } from "react";
import BlogLinkModal from "./BlogLinkModal";

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
              event.preventDefault();
              void submitBlog("pendiente");
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