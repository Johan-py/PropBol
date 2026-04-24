"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { USER_STORAGE_KEY, type SessionUser } from "@/lib/session";
import { MOCK_BLOG_COMMENTS } from "@/lib/mock/blogComments.mock";
import type { BlogComment, BlogCommentAuthor, BlogCommentThread } from "@/types/blogComment";

const INITIAL_VISIBLE_COMMENTS = 3;
const DEFAULT_USER_AVATAR = "https://i.pravatar.cc/120?img=11";

function getStorageKey(blogId: string) {
  return `propbol_blog_comments:${blogId}`;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getCurrentUser(): BlogCommentAuthor | null {
  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as SessionUser;
    const normalizedName = user.name?.trim() || "Tu usuario";
    const normalizedId =
      user.email?.trim().toLowerCase() ||
      normalizedName.toLowerCase().replace(/\s+/g, "-");

    return {
      id: normalizedId,
      name: normalizedName,
      avatarUrl: user.avatar || DEFAULT_USER_AVATAR,
    };
  } catch {
    return null;
  }
}

function buildCommentTree(comments: BlogComment[], currentUserId: string) {
  const commentMap = new Map<string, BlogCommentThread>();

  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      isOwnComment: comment.author.id === currentUserId,
      replies: [],
    });
  });

  const roots: BlogCommentThread[] = [];

  comments.forEach((comment) => {
    const current = commentMap.get(comment.id);

    if (!current) {
      return;
    }

    if (!comment.parentId) {
      roots.push(current);
      return;
    }

    const parent = commentMap.get(comment.parentId);

    if (parent) {
      parent.replies.push(current);
      return;
    }

    roots.push(current);
  });

  const sortByNewest = (left: BlogCommentThread, right: BlogCommentThread) =>
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

  const sortReplies = (thread: BlogCommentThread) => {
    thread.replies.sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
    thread.replies.forEach(sortReplies);
  };

  roots.sort(sortByNewest);
  roots.forEach(sortReplies);

  return roots;
}

export function useBlogComments(blogId: string) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [currentUser, setCurrentUser] = useState<BlogCommentAuthor | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COMMENTS);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hydrateComments = () => {
      const fallbackComments =
        MOCK_BLOG_COMMENTS[blogId] || MOCK_BLOG_COMMENTS.default || [];
      const storedComments = window.localStorage.getItem(getStorageKey(blogId));

      setCurrentUser(getCurrentUser());
      setVisibleCount(INITIAL_VISIBLE_COMMENTS);

      if (!storedComments) {
        setComments(fallbackComments);
        setIsReady(true);
        return;
      }

      try {
        setComments(JSON.parse(storedComments) as BlogComment[]);
      } catch {
        setComments(fallbackComments);
      } finally {
        setIsReady(true);
      }
    };

    hydrateComments();

    const syncUser = () => setCurrentUser(getCurrentUser());
    window.addEventListener("storage", syncUser);
    window.addEventListener("propbol:session-changed", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("propbol:session-changed", syncUser);
    };
  }, [blogId]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    // TODO: reemplazar localStorage por endpoints de comentarios cuando exista backend.
    window.localStorage.setItem(getStorageKey(blogId), JSON.stringify(comments));
  }, [blogId, comments, isReady]);

  const thread = useMemo(
    () => buildCommentTree(comments, currentUser?.id || ""),
    [comments, currentUser?.id],
  );

  const visibleThread = useMemo(
    () => thread.slice(0, visibleCount),
    [thread, visibleCount],
  );

  const hasMoreComments = thread.length > visibleCount;

  const runCommentMutation = useCallback(
    async (updater: (currentComments: BlogComment[]) => BlogComment[]) => {
      setIsSubmitting(true);
      await wait(220);
      setComments((currentComments) => updater(currentComments));
      setIsSubmitting(false);
    },
    [],
  );

  const addComment = useCallback(
    async (content: string, parentId: string | null = null) => {
      if (!currentUser) {
        return;
      }

      const author = currentUser;
      const nextComment: BlogComment = {
        id: `${parentId ? "reply" : "comment"}-${Date.now()}`,
        parentId,
        author,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likeCount: 0,
        likedByCurrentUser: false,
      };

      await runCommentMutation((currentComments) => [nextComment, ...currentComments]);

      if (!parentId) {
        setVisibleCount((currentVisibleCount) =>
          Math.max(currentVisibleCount, INITIAL_VISIBLE_COMMENTS),
        );
      }
    },
    [currentUser, runCommentMutation],
  );

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!currentUser) {
        return;
      }

      await runCommentMutation((currentComments) =>
        currentComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                content: content.trim(),
              }
            : comment,
        ),
      );
    },
    [runCommentMutation],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!currentUser) {
        return;
      }

      await runCommentMutation((currentComments) => {
        const descendants = new Set<string>([commentId]);
        let foundNewChild = true;

        while (foundNewChild) {
          foundNewChild = false;

          currentComments.forEach((comment) => {
            if (comment.parentId && descendants.has(comment.parentId)) {
              if (!descendants.has(comment.id)) {
                descendants.add(comment.id);
                foundNewChild = true;
              }
            }
          });
        }

        return currentComments.filter((comment) => !descendants.has(comment.id));
      });
    },
    [runCommentMutation],
  );

  const toggleLike = useCallback(
    async (commentId: string) => {
      if (!currentUser) {
        return;
      }

      await runCommentMutation((currentComments) =>
        currentComments.map((comment) => {
          if (comment.id !== commentId) {
            return comment;
          }

          const likedByCurrentUser = !comment.likedByCurrentUser;

          return {
            ...comment,
            likedByCurrentUser,
            likeCount: likedByCurrentUser
              ? comment.likeCount + 1
              : Math.max(comment.likeCount - 1, 0),
          };
        }),
      );
    },
    [runCommentMutation],
  );

  const loadMoreComments = useCallback(() => {
    setVisibleCount((currentVisibleCount) => currentVisibleCount + INITIAL_VISIBLE_COMMENTS);
  }, []);

  return {
    commentsCount: comments.length,
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
  };
}
