"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronDown, MessageSquare, MoreHorizontal, Pencil, ThumbsUp, Trash2 } from "lucide-react";

import { MAX_BLOG_COMMENT_LENGTH } from "@/lib/mock/blogComments.mock";
import { useBlogComments } from "@/hooks/useBlogComments";
import type { BlogCommentAuthor, BlogCommentThread } from "@/types/blogComment";

type DraftMode = {
  editingCommentId: string | null;
  editDraft: string;
  menuCommentId: string | null;
  replyDraft: string;
  replyToCommentId: string | null;
};

const INITIAL_DRAFT_MODE: DraftMode = {
  editingCommentId: null,
  editDraft: "",
  menuCommentId: null,
  replyDraft: "",
  replyToCommentId: null,
};

function formatRelativeTime(date: string) {
  const now = new Date().getTime();
  const target = new Date(date).getTime();
  const diffInMinutes = Math.round((target - now) / 60000);
  const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  if (Math.abs(diffInMinutes) < 60) {
    return formatter.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);

  if (Math.abs(diffInHours) < 24) {
    return formatter.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  return formatter.format(diffInDays, "day");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function Avatar({ author }: { author: BlogCommentAuthor }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!author.avatarUrl || hasImageError) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold uppercase tracking-[0.2em] text-white">
        {getInitials(author.name)}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={author.name}
      className="h-11 w-11 shrink-0 rounded-full bg-cover bg-center"
      style={{ backgroundImage: `url(${author.avatarUrl})` }}
      onError={() => setHasImageError(true)}
    />
  );
}

function Composer({
  actionLabel,
  currentLength,
  helperText,
  isDisabled,
  onCancel,
  onSubmit,
  onTextChange,
  placeholder,
  submitLabel,
  text,
}: {
  actionLabel?: string;
  currentLength: number;
  helperText?: string;
  isDisabled: boolean;
  onCancel?: () => void;
  onSubmit: () => void;
  onTextChange: (value: string) => void;
  placeholder: string;
  submitLabel: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      {actionLabel ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
          {actionLabel}
        </p>
      ) : null}

      <textarea
        value={text}
        maxLength={MAX_BLOG_COMMENT_LENGTH}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="min-h-[120px] w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-700 outline-none transition focus:border-amber-500 focus:bg-white"
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs text-stone-500">{currentLength}/{MAX_BLOG_COMMENT_LENGTH}</p>
          {helperText ? <p className="text-xs font-medium text-red-600">{helperText}</p> : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-stone-300 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600 transition-colors hover:border-stone-500 hover:text-stone-900"
            >
              Cancelar
            </button>
          ) : null}

          <button
            type="button"
            disabled={isDisabled}
            onClick={onSubmit}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#a56400] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#8f5700] disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  canInteract,
  comment,
  depth = 0,
  draftMode,
  isSubmitting,
  onDelete,
  onEditStart,
  onEditSubmit,
  onReplyStart,
  onReplySubmit,
  onToggleLike,
  setDraftMode,
}: {
  canInteract: boolean;
  comment: BlogCommentThread;
  depth?: number;
  draftMode: DraftMode;
  isSubmitting: boolean;
  onDelete: (commentId: string) => void;
  onEditStart: (comment: BlogCommentThread) => void;
  onEditSubmit: () => void;
  onReplyStart: (commentId: string) => void;
  onReplySubmit: () => void;
  onToggleLike: (commentId: string) => void;
  setDraftMode: Dispatch<SetStateAction<DraftMode>>;
}) {
  const isEditing = draftMode.editingCommentId === comment.id;
  const isReplying = draftMode.replyToCommentId === comment.id;
  const menuIsOpen = draftMode.menuCommentId === comment.id;

  return (
    <div className={`${depth > 0 ? "border-l border-stone-200 pl-4 sm:pl-6" : ""}`}>
      <article className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <Avatar author={comment.author} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-base font-semibold text-stone-900">{comment.author.name}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-stone-400">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>

                {!isEditing ? (
                  <p className="mt-3 text-sm leading-7 text-stone-600">{comment.content}</p>
                ) : null}
              </div>

              {comment.isOwnComment ? (
                <div className="relative self-start">
                  <button
                    type="button"
                    onClick={() =>
                      setDraftMode((currentDraftMode) => ({
                        ...currentDraftMode,
                        menuCommentId: currentDraftMode.menuCommentId === comment.id ? null : comment.id,
                      }))
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-900"
                    aria-label="Abrir acciones del comentario"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {menuIsOpen ? (
                    <div className="absolute right-0 top-11 z-10 min-w-[150px] rounded-2xl border border-stone-200 bg-white p-2 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          onEditStart(comment);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(comment.id)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Borrar
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mt-4">
                <Composer
                  actionLabel="Editando comentario"
                  currentLength={draftMode.editDraft.length}
                  isDisabled={isSubmitting || !draftMode.editDraft.trim()}
                  onCancel={() => setDraftMode((currentDraftMode) => ({ ...currentDraftMode, editingCommentId: null, editDraft: "" }))}
                  onSubmit={onEditSubmit}
                  onTextChange={(value) =>
                    setDraftMode((currentDraftMode) => ({
                      ...currentDraftMode,
                      editDraft: value,
                    }))
                  }
                  placeholder="Corrige tu comentario..."
                  submitLabel={isSubmitting ? "Guardando..." : "Guardar cambios"}
                  text={draftMode.editDraft}
                />
              </div>
            ) : null}

            {!isEditing ? (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                <button
                  type="button"
                  onClick={() => onToggleLike(comment.id)}
                  disabled={isSubmitting || !canInteract}
                  className={`inline-flex items-center gap-2 transition-colors ${
                    comment.likedByCurrentUser ? "text-amber-700" : "hover:text-stone-700"
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {comment.likeCount}
                </button>

                <button
                  type="button"
                  onClick={() => onReplyStart(comment.id)}
                  disabled={!canInteract}
                  className="inline-flex items-center gap-2 transition-colors hover:text-stone-700 disabled:cursor-not-allowed disabled:text-stone-300"
                >
                  <MessageSquare className="h-4 w-4" />
                  Responder
                </button>
              </div>
            ) : null}

            {isReplying ? (
              <div className="mt-4">
                <Composer
                  actionLabel="Respuesta"
                  currentLength={draftMode.replyDraft.length}
                  isDisabled={isSubmitting || !draftMode.replyDraft.trim()}
                  onCancel={() =>
                    setDraftMode((currentDraftMode) => ({
                      ...currentDraftMode,
                      replyDraft: "",
                      replyToCommentId: null,
                    }))
                  }
                  onSubmit={onReplySubmit}
                  onTextChange={(value) =>
                    setDraftMode((currentDraftMode) => ({
                      ...currentDraftMode,
                      replyDraft: value,
                    }))
                  }
                  placeholder="Escribe tu respuesta aqui..."
                  submitLabel={isSubmitting ? "Publicando..." : "Publicar respuesta"}
                  text={draftMode.replyDraft}
                />
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {comment.replies.length > 0 ? (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              canInteract={canInteract}
              depth={depth + 1}
              draftMode={draftMode}
              isSubmitting={isSubmitting}
              onDelete={onDelete}
              onEditStart={onEditStart}
              onEditSubmit={onEditSubmit}
              onReplyStart={onReplyStart}
              onReplySubmit={onReplySubmit}
              onToggleLike={onToggleLike}
              setDraftMode={setDraftMode}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function BlogCommentsSection({ blogId }: { blogId: string }) {
  const {
    commentsCount,
    currentUser,
    hasMoreComments,
    isReady,
    isSubmitting,
    visibleThread,
    addComment,
    deleteComment,
    loadMoreComments,
    toggleLike,
    updateComment,
  } = useBlogComments(blogId);

  const [commentDraft, setCommentDraft] = useState("");
  const [draftMode, setDraftMode] = useState<DraftMode>(INITIAL_DRAFT_MODE);
  const canInteract = Boolean(currentUser);

  const hasUnsavedDrafts = useMemo(
    () =>
      Boolean(
        commentDraft.trim() || draftMode.replyDraft.trim() || draftMode.editDraft.trim(),
      ),
    [commentDraft, draftMode.editDraft, draftMode.replyDraft],
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedDrafts) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedDrafts]);

  const submitComment = async () => {
    if (!commentDraft.trim()) {
      return;
    }

    await addComment(commentDraft);
    setCommentDraft("");
  };

  const submitReply = async () => {
    if (!draftMode.replyToCommentId || !draftMode.replyDraft.trim()) {
      return;
    }

    await addComment(draftMode.replyDraft, draftMode.replyToCommentId);
    setDraftMode((currentDraftMode) => ({
      ...currentDraftMode,
      replyDraft: "",
      replyToCommentId: null,
    }));
  };

  const submitEdit = async () => {
    if (!draftMode.editingCommentId || !draftMode.editDraft.trim()) {
      return;
    }

    await updateComment(draftMode.editingCommentId, draftMode.editDraft);
    setDraftMode((currentDraftMode) => ({
      ...currentDraftMode,
      editingCommentId: null,
      editDraft: "",
    }));
  };

  const handleDelete = async (commentId: string) => {
    const shouldDelete = window.confirm("Estas seguro de eliminar este comentario?");

    if (!shouldDelete) {
      return;
    }

    await deleteComment(commentId);
    setDraftMode((currentDraftMode) => ({
      ...currentDraftMode,
      editingCommentId:
        currentDraftMode.editingCommentId === commentId
          ? null
          : currentDraftMode.editingCommentId,
      menuCommentId: null,
      replyToCommentId:
        currentDraftMode.replyToCommentId === commentId ? null : currentDraftMode.replyToCommentId,
    }));
  };

  if (!isReady) {
    return (
      <section className="mx-auto mt-16 max-w-4xl px-6">
        <div className="rounded-[32px] border border-stone-200 bg-white px-6 py-16 text-center text-stone-500 shadow-sm">
          Cargando comentarios...
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-16 max-w-4xl px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {commentsCount} Comentarios
          </h2>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
          Unirse a la conversacion
        </p>
      </div>

      <div className="mt-8">
        <div className="rounded-[32px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {currentUser ? (
              <Avatar author={currentUser} />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold uppercase tracking-[0.2em] text-white">
                U
              </div>
            )}

            <div className="min-w-0 flex-1">
              <textarea
                value={commentDraft}
                maxLength={MAX_BLOG_COMMENT_LENGTH}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder={
                  canInteract
                    ? "Escribe tu comentario aqui..."
                    : "Inicia sesion para comentar..."
                }
                rows={5}
                disabled={!canInteract}
                className="min-h-[150px] w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-700 outline-none transition focus:border-amber-500 focus:bg-white"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-stone-500">
                    {commentDraft.length}/{MAX_BLOG_COMMENT_LENGTH}
                  </p>
                  {!canInteract ? (
                    <p className="text-xs font-medium text-stone-500">
                      Debes iniciar sesion para publicar comentarios.
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || !commentDraft.trim() || !canInteract}
                  onClick={submitComment}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#a56400] px-6 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#8f5700] disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {isSubmitting ? "Publicando..." : "Publicar comentario"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-5">
        {visibleThread.map((comment) => (
          <CommentItem
            key={comment.id}
            canInteract={canInteract}
            comment={comment}
            draftMode={draftMode}
            isSubmitting={isSubmitting}
            onDelete={handleDelete}
            onEditStart={(nextComment) =>
              setDraftMode((currentDraftMode) => ({
                ...currentDraftMode,
                editDraft: nextComment.content,
                editingCommentId: nextComment.id,
                menuCommentId: null,
                replyDraft: "",
                replyToCommentId: null,
              }))
            }
            onEditSubmit={submitEdit}
            onReplyStart={(commentId) =>
              setDraftMode((currentDraftMode) => ({
                ...currentDraftMode,
                editingCommentId: null,
                editDraft: "",
                menuCommentId: null,
                replyDraft: "",
                replyToCommentId:
                  currentDraftMode.replyToCommentId === commentId ? null : commentId,
              }))
            }
            onReplySubmit={submitReply}
            onToggleLike={toggleLike}
            setDraftMode={setDraftMode}
          />
        ))}
      </div>

      {hasMoreComments ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMoreComments}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 transition-colors hover:text-stone-900"
          >
            Cargar mas comentarios
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
