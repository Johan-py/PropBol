'use client'

/*import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getBlogCategories,
  uploadBlogImage,
  createBlog,
  updateBlog,
  BlogCategoryOption,
  BlogCreationAction
} from "@/services/blogs.service";*/

//const AUTOSAVE_STORAGE_PREFIX = "propbol_blog_form";

export type FieldErrors = {
  categoria_id?: string
  contenido?: string
  imagen?: string
  titulo?: string
}

export type BlogFormValues = {
  titulo: string
  imagen: string
  categoriaId: string
  contenido: string
}

export interface UseBlogFormProps {
  blogId?: number
  initialValues?: BlogFormValues
  mode: 'create' | 'edit'
}

export const INITIAL_ERRORS: FieldErrors = {}
