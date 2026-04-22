"use client";

import { useEffect, useState } from "react";
import { ADMIN_MODERATION_BLOGS_MOCK } from "@/lib/mock/adminModerationBlogs.mock";
import type {
  AdminModerationBlog,
  AdminModerationStatus,
} from "@/types/adminModerationBlog";

const ADMIN_BLOGS_STORAGE_KEY = "propbol_admin_moderation_blogs";

function loadStoredBlogs() {
  if (typeof window === "undefined") {
    return ADMIN_MODERATION_BLOGS_MOCK;
  }

  const rawBlogs = localStorage.getItem(ADMIN_BLOGS_STORAGE_KEY);

  if (!rawBlogs) {
    // TODO: reemplazar este mock local por el listado real cuando exista backend.
    localStorage.setItem(
      ADMIN_BLOGS_STORAGE_KEY,
      JSON.stringify(ADMIN_MODERATION_BLOGS_MOCK),
    );

    return ADMIN_MODERATION_BLOGS_MOCK;
  }

  try {
    return JSON.parse(rawBlogs) as AdminModerationBlog[];
  } catch {
    localStorage.setItem(
      ADMIN_BLOGS_STORAGE_KEY,
      JSON.stringify(ADMIN_MODERATION_BLOGS_MOCK),
    );

    return ADMIN_MODERATION_BLOGS_MOCK;
  }
}

export function useAdminBlogModeration() {
  const [blogs, setBlogs] = useState<AdminModerationBlog[]>(
    ADMIN_MODERATION_BLOGS_MOCK,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncBlogs = () => {
      setBlogs(loadStoredBlogs());
      setIsReady(true);
    };

    syncBlogs();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ADMIN_BLOGS_STORAGE_KEY) {
        syncBlogs();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateBlogStatus = (
    blogId: string,
    nextStatus: AdminModerationStatus,
    rejectionComment?: string,
  ) => {
    setBlogs((currentBlogs) => {
      const updatedBlogs = currentBlogs.map((blog) => {
        if (blog.id !== blogId) {
          return blog;
        }

        return {
          ...blog,
          status: nextStatus,
          rejectionComment:
            nextStatus === "RECHAZADO" ? rejectionComment?.trim() ?? "" : null,
          reviewedAt: new Date().toISOString(),
        };
      });

      // TODO: persistir aprobacion y rechazo con endpoints reales cuando exista backend.
      localStorage.setItem(
        ADMIN_BLOGS_STORAGE_KEY,
        JSON.stringify(updatedBlogs),
      );

      return updatedBlogs;
    });
  };

  return {
    blogs,
    isReady,
    updateBlogStatus,
  };
}
