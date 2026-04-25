'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlogCategoryOption, getBlogCategories } from '@/services/blogs.service'

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

  const [categories, setCategories] = useState<BlogCategoryOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

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

  // Carga de categorías
  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const rows = await getBlogCategories()
        if (isMounted) setCategories(rows)
      } catch {
        // luego manejamos error pe
      } finally {
        if (isMounted) setIsLoadingCategories(false)
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [])

  // Autoguardado
  useEffect(() => {
    const hasContent = Boolean(titulo.trim() || imagen.trim() || categoriaId || contenido.trim())

    if (!hasContent) {
      window.localStorage.removeItem(autosaveKey)
      return
    }

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(
        autosaveKey,
        JSON.stringify({
          titulo,
          imagen,
          categoriaId,
          contenido
        })
      )
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [autosaveKey, titulo, imagen, categoriaId, contenido])

  //url para previsualizar imagen
  const imagePreviewUrl = useMemo(() => {
    return imagen.trim() || ''
  }, [imagen])

  // Detectar cambios en el formulario (si no está “sucio”)
  const isFormDirty = useMemo(() => {
    const baseTitulo = initialValues?.titulo?.trim() ?? ''
    const baseImagen = initialValues?.imagen?.trim() ?? ''
    const baseCategoriaId = initialValues?.categoriaId ?? ''
    const baseContenido = initialValues?.contenido?.trim() ?? ''

    return (
      titulo.trim() !== baseTitulo ||
      imagen.trim() !== baseImagen ||
      categoriaId !== baseCategoriaId ||
      contenido.trim() !== baseContenido
    )
  }, [titulo, imagen, categoriaId, contenido, initialValues])

  // Advertencia de salida
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isFormDirty) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isFormDirty])

  // Aplicar formato al texto seleccionado
  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)

    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end)

    setContenido(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  const insertLink = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)

    // insertar link
    const url = prompt('Ingresa la URL')
    if (!url) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    const newText =
      text.substring(0, start) + `[${selected || 'texto'}](${url})` + text.substring(end)

    setContenido(newText)
  }

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
    autosaveKey,
    imagePreviewUrl,
    isFormDirty,
    applyFormatting,
    insertLink
  }
}
