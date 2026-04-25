'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlogCategoryOption } from '@/services/blogs.service'

const AUTOSAVE_STORAGE_PREFIX = 'propbol_blog_form'

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

export function useBlogForm({ blogId, initialValues, mode }: UseBlogFormProps) {
  const router = useRouter()
  const _hasHydratedDraft = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [titulo, setTitulo] = useState(initialValues?.titulo ?? '')
  const [imagen, setImagen] = useState(initialValues?.imagen ?? '')
  const [categoriaId, setCategoriaId] = useState(initialValues?.categoriaId ?? '')
  const [contenido, setContenido] = useState(initialValues?.contenido ?? '')

  const [categories, _setCategories] = useState<BlogCategoryOption[]>([])
  const [isLoadingCategories, _setIsLoadingCategories] = useState(true)

  const autosaveKey = useMemo(
    () =>
      mode === 'edit' && blogId
        ? `${AUTOSAVE_STORAGE_PREFIX}:edit:${blogId}`
        : `${AUTOSAVE_STORAGE_PREFIX}:create`,
    [blogId, mode]
  )
  // Hidratación de borrador
  useEffect(() => {
    if (_hasHydratedDraft.current) return
    _hasHydratedDraft.current = true

    const rawDraft = window.localStorage.getItem(autosaveKey)
    if (!rawDraft) return

    try {
      const draft = JSON.parse(rawDraft)
      setTitulo(draft.titulo ?? initialValues?.titulo ?? '')
      setImagen(draft.imagen ?? initialValues?.imagen ?? '')
      setCategoriaId(draft.categoriaId ?? initialValues?.categoriaId ?? '')
      setContenido(draft.contenido ?? initialValues?.contenido ?? '')
    } catch {
      window.localStorage.removeItem(autosaveKey)
    }
  }, [autosaveKey, initialValues])

  // retorno mínimo para no romper nada
  return {
    titulo,
    setTitulo,
    imagen,
    setImagen,
    categoriaId,
    setCategoriaId,
    contenido,
    setContenido,
    categories,
    isLoadingCategories,
    textareaRef,
    router,
    autosaveKey
  }
}
