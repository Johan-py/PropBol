'use client'

import { useEffect, useState } from 'react'
import { MOCK_BLOG_COMMENTS_BY_BLOG_ID } from '@/lib/mock/blogComments.mock'
import {
  BLOG_COMMENT_MAX_LENGTH,
  BlogComment,
  BlogCommentAuthor,
  INITIAL_VISIBLE_TOP_LEVEL_COMMENTS
} from '@/types/blogComment'
import { USER_STORAGE_KEY } from '@/lib/session'

const COMMENTS_STORAGE_PREFIX = 'propbol_blog_comments'
const DRAFT_STORAGE_PREFIX = 'propbol_blog_comment_draft'

const createStorageKey = (prefix: string, blogId: string) => `${prefix}:${blogId}`

const getDescendantIds = (comments: BlogComment[], parentId: string): string[] => {
  const directChildren = comments.filter((comment) => comment.parentId === parentId)

  return directChildren.flatMap((comment) => [comment.id, ...getDescendantIds(comments, comment.id)])
}

const readStoredComments = (blogId: string) => {
  const fallbackComments = MOCK_BLOG_COMMENTS_BY_BLOG_ID[blogId] ?? []

  if (typeof window === 'undefined') {
    return fallbackComments
  }

  const rawComments = window.localStorage.getItem(createStorageKey(COMMENTS_STORAGE_PREFIX, blogId))

  if (!rawComments) {
    return fallbackComments
  }

  try {
    const parsedComments = JSON.parse(rawComments) as BlogComment[]
    return Array.isArray(parsedComments) ? parsedComments : fallbackComments
  } catch {
    return fallbackComments
  }
}

const readStoredDraft = (blogId: string) => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(createStorageKey(DRAFT_STORAGE_PREFIX, blogId)) ?? ''
}

const buildFallbackUserName = () => {
  if (typeof window === 'undefined') {
    return 'Usuario PropBol'
  }

  return (
    window.localStorage.getItem('nombre') ||
    window.localStorage.getItem('correo') ||
    'Usuario PropBol'
  )
}

const readCurrentUser = (): BlogCommentAuthor => {
  if (typeof window === 'undefined') {
    return {
      id: 'guest-user',
      name: 'Usuario PropBol',
      avatar: null
    }
  }

  const storedAvatar = window.localStorage.getItem('avatar')
  const storedUser = window.localStorage.getItem(USER_STORAGE_KEY)

  if (!storedUser) {
    const fallbackName = buildFallbackUserName()

    return {
      id: fallbackName.toLowerCase().replace(/\s+/g, '-'),
      name: fallbackName,
      avatar: storedAvatar
    }
  }

  try {
    const parsedUser = JSON.parse(storedUser) as {
      name?: string
      email?: string
      avatar?: string | null
    }

    const name = parsedUser.name || parsedUser.email || buildFallbackUserName()
    const id = parsedUser.email || name.toLowerCase().replace(/\s+/g, '-')

    return {
      id,
      name,
      email: parsedUser.email,
      avatar: parsedUser.avatar ?? storedAvatar
    }
  } catch {
    const fallbackName = buildFallbackUserName()

    return {
      id: fallbackName.toLowerCase().replace(/\s+/g, '-'),
      name: fallbackName,
      avatar: storedAvatar
    }
  }
}

const createCommentId = () =>
  `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const waitForUiPersistence = () =>
  new Promise((resolve) => {
    window.setTimeout(resolve, 350)
  })

export const useBlogComments = (blogId: string) => {
  const [comments, setComments] = useState<BlogComment[]>(() => readStoredComments(blogId))
  const [draft, setDraft] = useState(() => readStoredDraft(blogId))
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null)
  const [visibleTopLevelComments, setVisibleTopLevelComments] = useState(
    INITIAL_VISIBLE_TOP_LEVEL_COMMENTS
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<BlogCommentAuthor>(() => readCurrentUser())

  useEffect(() => {
    setComments(readStoredComments(blogId))
    setDraft(readStoredDraft(blogId))
    setReplyingToId(null)
    setEditingCommentId(null)
    setMenuOpenForId(null)
    setVisibleTopLevelComments(INITIAL_VISIBLE_TOP_LEVEL_COMMENTS)
    setCurrentUser(readCurrentUser())
  }, [blogId])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      createStorageKey(COMMENTS_STORAGE_PREFIX, blogId),
      JSON.stringify(comments)
    )
  }, [blogId, comments])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(createStorageKey(DRAFT_STORAGE_PREFIX, blogId), draft)
  }, [blogId, draft])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!draft.trim()) {
        return
      }

      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [draft])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const syncCurrentUser = () => {
      setCurrentUser(readCurrentUser())
    }

    window.addEventListener('storage', syncCurrentUser)
    window.addEventListener('propbol:session-changed', syncCurrentUser)
    window.addEventListener('profileUpdated', syncCurrentUser)

    return () => {
      window.removeEventListener('storage', syncCurrentUser)
      window.removeEventListener('propbol:session-changed', syncCurrentUser)
      window.removeEventListener('profileUpdated', syncCurrentUser)
    }
  }, [])

  const topLevelComments = comments.filter((comment) => comment.parentId === null)
  const visibleComments = topLevelComments.slice(0, visibleTopLevelComments)
  const totalComments = comments.length
  const isDraftEmpty = draft.trim().length === 0
  const isAtCharacterLimit = draft.length >= BLOG_COMMENT_MAX_LENGTH
  const activeParent = replyingToId
    ? comments.find((comment) => comment.id === replyingToId) ?? null
    : null
  const activeEdition = editingCommentId
    ? comments.find((comment) => comment.id === editingCommentId) ?? null
    : null

  const getReplies = (commentId: string) =>
    comments.filter((comment) => comment.parentId === commentId)

  const startReply = (commentId: string) => {
    setReplyingToId(commentId)
    setEditingCommentId(null)
    setMenuOpenForId(null)
  }

  const startEdit = (commentId: string) => {
    const commentToEdit = comments.find((comment) => comment.id === commentId)

    if (!commentToEdit) {
      return
    }

    setDraft(commentToEdit.content)
    setEditingCommentId(commentId)
    setReplyingToId(null)
    setMenuOpenForId(null)
  }

  const cancelComposerMode = () => {
    setReplyingToId(null)
    setEditingCommentId(null)
    setMenuOpenForId(null)
    setDraft('')
  }

  const handleDraftChange = (value: string) => {
    setDraft(value.slice(0, BLOG_COMMENT_MAX_LENGTH))
  }

  const toggleLike = (commentId: string) => {
    setComments((currentComments) =>
      currentComments.map((comment) => {
        if (comment.id !== commentId) {
          return comment
        }

        const nextLikedState = !comment.likedByCurrentUser

        return {
          ...comment,
          likedByCurrentUser: nextLikedState,
          likes: Math.max(0, comment.likes + (nextLikedState ? 1 : -1))
        }
      })
    )
  }

  const deleteComment = (commentId: string) => {
    const idsToDelete = [commentId, ...getDescendantIds(comments, commentId)]

    setComments((currentComments) =>
      currentComments.filter((comment) => !idsToDelete.includes(comment.id))
    )

    if (replyingToId && idsToDelete.includes(replyingToId)) {
      setReplyingToId(null)
    }

    if (editingCommentId && idsToDelete.includes(editingCommentId)) {
      setEditingCommentId(null)
      setDraft('')
    }

    setMenuOpenForId(null)
  }

  const requestDelete = (commentId: string) => {
    if (typeof window === 'undefined') {
      return
    }

    const confirmed = window.confirm('Estas seguro de eliminar este comentario?')

    if (!confirmed) {
      return
    }

    deleteComment(commentId)
  }

  const submitComment = async () => {
    const normalizedDraft = draft.trim()

    if (!normalizedDraft || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    await waitForUiPersistence()

    if (editingCommentId) {
      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === editingCommentId
            ? {
                ...comment,
                content: normalizedDraft,
                updatedAt: new Date().toISOString()
              }
            : comment
        )
      )
    } else {
      const newComment: BlogComment = {
        id: createCommentId(),
        blogId,
        parentId: replyingToId,
        author: currentUser,
        content: normalizedDraft,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        likes: 0,
        likedByCurrentUser: false
      }

      setComments((currentComments) => [...currentComments, newComment])
      setVisibleTopLevelComments((currentVisibleCount) =>
        replyingToId ? currentVisibleCount : currentVisibleCount + 1
      )
    }

    setDraft('')
    setReplyingToId(null)
    setEditingCommentId(null)
    setIsSubmitting(false)
  }

  return {
    activeEdition,
    activeParent,
    blogId,
    canLoadMore: topLevelComments.length > visibleTopLevelComments,
    cancelComposerMode,
    currentUser,
    draft,
    getReplies,
    handleDraftChange,
    isAtCharacterLimit,
    isDraftEmpty,
    isSubmitting,
    maxLength: BLOG_COMMENT_MAX_LENGTH,
    menuOpenForId,
    requestDelete,
    setMenuOpenForId,
    startEdit,
    startReply,
    submitComment,
    toggleLike,
    totalComments,
    visibleComments,
    loadMore: () =>
      setVisibleTopLevelComments((currentVisibleCount) => currentVisibleCount + 3)
  }
}
