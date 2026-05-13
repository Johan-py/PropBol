'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Pencil, Trash2, RotateCcw, X, QrCode, Loader2, AlertTriangle,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Plan {
  id: number
  nombre: string
  precio: number | null
  nro_publicaciones: number | null
  duracion_dias: number | null
  descripcion: string
  imagen_gr_url: string | null
  eliminado: boolean
}

interface FormData {
  nombre: string
  precio: string
  nro_publicaciones: string
  duracion_dias: string
  descripcion: string
  imagen_gr_url: string
}

const EMPTY_FORM: FormData = {
  nombre: '',
  precio: '',
  nro_publicaciones: '',
  duracion_dias: '',
  descripcion: '',
  imagen_gr_url: '',
}

export default function AdminPlanesPage() {
  const router = useRouter()
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Plan | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Confirm delete modal
  const [confirmDelete, setConfirmDelete] = useState<Plan | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getToken = () => localStorage.getItem('token') ?? ''

  const fetchPlanes = async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${API_URL}/api/planes/admin/lista`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (r.status === 401) { router.replace('/sign-in'); return }
      const data = await r.json()
      setPlanes(Array.isArray(data) ? data : [])
    } catch {
      setError('No se pudieron cargar los planes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.replace('/sign-in'); return }
    fetchPlanes()
  }, [])

  const openCreate = () => {
    setEditando(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (plan: Plan) => {
    setEditando(plan)
    setForm({
      nombre: plan.nombre,
      precio: plan.precio !== null ? String(plan.precio) : '',
      nro_publicaciones: plan.nro_publicaciones !== null ? String(plan.nro_publicaciones) : '',
      duracion_dias: plan.duracion_dias !== null ? String(plan.duracion_dias) : '',
      descripcion: plan.descripcion,
      imagen_gr_url: plan.imagen_gr_url ?? '',
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleSave = async () => {
    setFormError(null)
    if (!form.nombre.trim()) { setFormError('El nombre es obligatorio'); return }
    if (form.precio === '' || Number(form.precio) < 0) {
      setFormError('El precio debe ser un valor mayor o igual a 0')
      return
    }

    setSaving(true)
    try {
      const body = {
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        nro_publicaciones: form.nro_publicaciones ? Number(form.nro_publicaciones) : null,
        duracion_dias: form.duracion_dias ? Number(form.duracion_dias) : null,
        descripcion: form.descripcion.trim(),
        imagen_gr_url: form.imagen_gr_url.trim() || null,
      }

      const url = editando
        ? `${API_URL}/api/planes/admin/${editando.id}`
        : `${API_URL}/api/planes/admin`
      const method = editando ? 'PUT' : 'POST'

      const r = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      })

      const data = await r.json()
      if (!r.ok) { setFormError(data.error ?? 'Error al guardar'); return }

      setModalOpen(false)
      fetchPlanes()
    } catch {
      setFormError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (plan: Plan) => {
    setDeleting(true)
    try {
      const r = await fetch(`${API_URL}/api/planes/admin/${plan.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (r.ok) { setConfirmDelete(null); fetchPlanes() }
    } catch { /* silencioso */ }
    finally { setDeleting(false) }
  }

  const handleRestore = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/planes/admin/${id}/restaurar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      fetchPlanes()
    } catch { /* silencioso */ }
  }

  const activos = planes.filter((p) => !p.eliminado)
  const eliminados = planes.filter((p) => p.eliminado)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Administración de Planes</h1>
          <p className="text-sm text-stone-500 mt-0.5">Gestiona los planes disponibles para los usuarios</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus size={15} />
          Crear Plan
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-4 py-3 mb-6">
        <AlertTriangle size={13} className="shrink-0 mt-0.5" />
        <span>
          <strong>Eliminación lógica:</strong> El plan deja de mostrarse a nuevos usuarios, pero los
          suscriptores activos conservan sus beneficios hasta el vencimiento.
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-orange-500" size={28} />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 text-sm py-16">{error}</p>
      ) : (
        <>
          {/* Tabla activos */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden mb-6">
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-stone-50">
              <span className="text-sm font-semibold text-stone-700">Planes Activos</span>
              <span className="text-xs text-stone-400">{activos.length} activos</span>
            </div>
            {activos.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-8">No hay planes activos</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      {['Nombre', 'Precio/mes', 'Publicaciones', 'Vigencia', 'QR', 'Estado', 'Acciones'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activos.map((p) => (
                      <tr key={p.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition">
                        <td className="px-4 py-3.5 font-medium text-stone-800">{p.nombre}</td>
                        <td className="px-4 py-3.5 text-orange-600 font-semibold">
                          {p.precio === 0 ? 'Gratis' : p.precio !== null ? `Bs. ${p.precio}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-stone-700">{p.nro_publicaciones ?? '∞'}</td>
                        <td className="px-4 py-3.5 text-stone-700">
                          {p.duracion_dias ? `${p.duracion_dias} días` : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          {p.imagen_gr_url ? (
                            <QrCode size={18} className="text-stone-500" />
                          ) : (
                            <span className="text-stone-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Activo
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-orange-500 transition"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(p)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Eliminados */}
          {eliminados.length > 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 overflow-hidden">
              <div className="px-5 py-3 border-b border-stone-200">
                <span className="text-sm font-semibold text-stone-500">Planes Eliminados (Soft Delete)</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {eliminados.map((p) => (
                    <tr key={p.id} className="border-b border-stone-200 last:border-0">
                      <td className="px-4 py-3 text-stone-400 line-through">{p.nombre}</td>
                      <td className="px-4 py-3 text-stone-400">
                        {p.precio !== null ? `Bs. ${p.precio}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-red-500">Eliminado</span>
                      </td>
                      <td className="px-4 py-3 text-right pr-5">
                        <button
                          onClick={() => handleRestore(p.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-orange-600 border border-stone-300 hover:border-orange-400 px-3 py-1.5 rounded-lg transition"
                        >
                          <RotateCcw size={12} />
                          Restaurar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Validation note */}
          <p className="text-xs text-amber-600 mt-4 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Validación al crear/editar: Nombre obligatorio, precio no negativo, nombre duplicado rechazado.
          </p>
        </>
      )}

      {/* === MODAL CREAR/EDITAR === */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-800">
                {editando ? 'Editar Plan' : 'Crear Plan'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <Field label="Nombre *" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} placeholder="Ej: Estándar" />
              <Field label="Precio (Bs.) *" value={form.precio} onChange={(v) => setForm({ ...form, precio: v })} placeholder="0" type="number" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Publicaciones" value={form.nro_publicaciones} onChange={(v) => setForm({ ...form, nro_publicaciones: v })} placeholder="Ej: 10" type="number" />
                <Field label="Vigencia (días)" value={form.duracion_dias} onChange={(v) => setForm({ ...form, duracion_dias: v })} placeholder="Ej: 30" type="number" />
              </div>
              <Field label="Descripción" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} placeholder="Descripción del plan" />
              <Field label="URL imagen QR" value={form.imagen_gr_url} onChange={(v) => setForm({ ...form, imagen_gr_url: v })} placeholder="https://..." />
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="text-sm text-stone-500 hover:text-stone-700 px-4 py-2">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-60"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                {editando ? 'Guardar Cambios' : 'Crear Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL CONFIRMAR ELIMINAR === */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <h2 className="font-semibold text-stone-800">Eliminar plan</h2>
            </div>
            <p className="text-sm text-stone-600 mb-2">
              ¿Deseas eliminar <strong>{confirmDelete.nombre}</strong>?
            </p>
            <p className="text-xs text-stone-400 mb-6">
              La eliminación es lógica. Los usuarios con este plan activo <strong>no se verán afectados</strong>{' '}
              y conservarán sus beneficios hasta el vencimiento.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-stone-200 text-stone-600 text-sm rounded-lg py-2 hover:border-stone-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg py-2 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={type === 'number' ? '0' : undefined}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
      />
    </div>
  )
}
