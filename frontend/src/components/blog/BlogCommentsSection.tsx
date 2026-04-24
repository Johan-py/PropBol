'use client'

import { useEffect, useRef } from 'react'
import { MessageCircle, MoreHorizontal, Pencil, Reply, ThumbsUp, Trash2 } from 'lucide-react'
import { useBlogComments } from '@/hooks/useBlogComments'
import { BlogComment, BlogCommentAuthor } from '@/types/blogComment'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const formatRelativeTime = (dateString: string) => {
  const diffInMinutes = Math.max(1, Math.floor((Date.now() - new Date(dateString).getTime()) / 60000))

  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes === 1 ? '' : 's'}`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours === 1 ? '' : 's'}`
  }

  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays < 30) {
    return `hace ${diffInDays} dia${diffInDays === 1 ? '' : 's'}`
  }

  const diffInMonths = Math.floor(diffInDays / 30)

  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths === 1 ? '' : 'es'}`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `hace ${diffInYears} ano${diffInYears === 1 ? '' : 's'}`
}

const getAvatarUrl = (avatar: string | null) => {
  if (!avatar) {
    return null
  }

  return avatar.startsWith('http') ? avatar : `${API_URL}${avatar}`
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? '')
    .join('')

const Avatar = ({ author, sizeClass }: { author: BlogCommentAuthor; sizeClass: string }) => {
  const avatarUrl = getAvatarUrl(author.avatar)

  return avatarUrl ? (
    <img src={avatarUrl} alt={author.name} className={`${sizeClass} rounded-full object-cover`} />
  ) : (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white`}
    >
      {getInitials(author.name)}
    </div>
  )
}

type CommentItemProps = {
  comment: BlogComment
  currentUserId: string
  getReplies: (commentId: string) => BlogComment[]
  menuOpenForId: string | null
  onDelete: (commentId: string) => void
  onEdit: (commentId: string) => void
  onReply: (commentId: string) => void
  onToggleLike: (commentId: string) => void
  onToggleMenu: (commentId: string | null) => void
  level?: number
}

const CommentItem = ({
  comment,
  currentUserId,
  getReplies,
  menuOpenForId,
  onDelete,
  onEdit,
  onReply,
  onToggleLike,
  onToggleMenu,
  level = 0
}: CommentItemProps) => {
  const replies = getReplies(comment.id)
  const isOwnComment = comment.author.id === currentUserId
  const hasReplies = replies.length > 0

  return (
    <div className={level > 0 ? 'border-l border-stone-200 pl-4 sm:pl-6' : ''}>
      <article className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar author={comment.author} sizeClass="h-11 w-11 sm:h-12 sm:w-12" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-base font-semibold text-stone-900">{comment.author.name}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                  {comment.updatedAt ? (
                    <span className="text-xs text-stone-400">(editado)</span>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">{comment.content}</p>
              </div>

              <div className="flex items-center gap-3 self-start text-stone-400">
                <button
                  type="button"
                  onClick={() => onToggleLike(comment.id)}
                  className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                    comment.likedByCurrentUser ? 'text-[#a56400]' : 'hover:text-[#a56400]'
                  }`}
                >
                  <ThumbsUp size={15} className={comment.likedByCurrentUser ? 'fill-current' : ''} />
                  <span>{comment.likes}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReply(comment.id)}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400 transition-colors hover:text-[#a56400]"
                >
                  <Reply size={15} />
                  <span>Responder</span>
                </button>

                {isOwnComment ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => onToggleMenu(menuOpenForId === comment.id ? null : comment.id)}
                      className="rounded-full p-1 transition-colors hover:bg-stone-100 hover:text-stone-700"
                      aria-label="Abrir acciones del comentario"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {menuOpenForId === comment.id ? (
                      <div className="absolute right-0 top-10 z-10 w-40 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
                        <button
                          type="button"
                          onClick={() => onEdit(comment.id)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-100"
                        >
                          <Pencil size={15} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(comment.id)}
                          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          <span>Borrar</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </article>

      {hasReplies ? (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              getReplies={getReplies}
              menuOpenForId={menuOpenForId}
              onDelete={onDelete}
              onEdit={onEdit}
              onReply={onReply}
              onToggleLike={onToggleLike}
              onToggleMenu={onToggleMenu}
              level={level + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function BlogCommentsSection({ blogId }: { blogId: string }) {
  const {
    activeEdition,
    activeParent,
    canLoadMore,
    cancelComposerMode,
    currentUser,
    draft,
    getReplies,
    handleDraftChange,
    isAtCharacterLimit,
    isDraftEmpty,
    isSubmitting,
    loadMore,
    maxLength,
    menuOpenForId,
    requestDelete,
    setMenuOpenForId,
    startEdit,
    startReply,
    submitComment,
    toggleLike,
    totalComments,
    visibleComments
  } = useBlogComments(blogId)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (activeEdition || activeParent) {
      textareaRef.current?.focus()
    }
  }, [activeEdition, activeParent])

  return (
    <section className="mt-16 bg-[#f7f1e7] py-12 sm:mt-20 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-black text-stone-900 sm:text-4xl">
              {totalComments} Comentarios
            </h2>
            <p className="mt-2 text-sm uppercase tracking-[0.28em] text-[#a56400]">
              Unirse a la conversacion
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <Avatar author={currentUser} sizeClass="h-12 w-12 sm:h-14 sm:w-14" />

            <div className="min-w-0 flex-1">
              {activeParent ? (
                <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
                  <span>
                    Respondiendo a <strong className="text-stone-900">{activeParent.author.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={cancelComposerMode}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a56400]"
                  >
                    Cancelar
                  </button>
                </div>
              ) : null}

              {activeEdition ? (
                <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
                  <span>
                    Editando tu comentario de{' '}
                    <strong className="text-stone-900">{formatRelativeTime(activeEdition.createdAt)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={cancelComposerMode}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a56400]"
                  >
                    Cancelar
                  </button>
                </div>
              ) : null}

              <label className="sr-only" htmlFor="blog-comment-composer">
                Escribe tu comentario aqui
              </label>
              <textarea
                id="blog-comment-composer"
                ref={textareaRef}
                value={draft}
                maxLength={maxLength}
                onChange={(event) => handleDraftChange(event.target.value)}
                rows={5}
                placeholder="Escribe tu comentario aqui..."
                className="min-h-[180px] w-full resize-none rounded-[28px] border border-stone-200 bg-[#fcfbf8] px-5 py-4 text-sm leading-7 text-stone-700 outline-none transition focus:border-[#a56400] focus:ring-2 focus:ring-[#a56400]/15 sm:text-base"
              />

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p
                    className={`text-sm ${
                      isAtCharacterLimit ? 'font-semibold text-red-600' : 'text-stone-500'
                    }`}
                  >
                    {draft.length}/{maxLength} caracteres
                  </p>
                  {isAtCharacterLimit ? (
                    <p className="text-sm text-red-600">
                      Alcanzaste el maximo permitido para evitar comentarios demasiado largos.
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => void submitComment()}
                  disabled={isDraftEmpty || isSubmitting}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#a56400] px-7 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#8f5700] disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {isSubmitting
                    ? 'Publicando...'
                    : activeEdition
                      ? 'Guardar cambios'
                      : activeParent
                        ? 'Publicar respuesta'
                        : 'Publicar comentario'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-5">
          {visibleComments.length > 0 ? (
            visibleComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUser.id}
                getReplies={getReplies}
                menuOpenForId={menuOpenForId}
                onDelete={requestDelete}
                onEdit={startEdit}
                onReply={startReply}
                onToggleLike={toggleLike}
                onToggleMenu={setMenuOpenForId}
              />
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                <MessageCircle size={24} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-stone-900">Aun no hay comentarios</h3>
              <p className="mt-2 text-sm leading-7 text-stone-500 sm:text-base">
                Se la primera persona en dejar una opinion o una duda sobre este articulo.
              </p>
            </div>
          )}
        </div>

        {canLoadMore ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-stone-600 transition hover:text-[#a56400]"
            >
              <span>Cargar mas comentarios</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
