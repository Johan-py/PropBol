'use client'

import { useState, useEffect } from 'react'
import { 
  Star, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  MoreVertical, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react'
import Image from 'next/image'

// Tipado basado en tus criterios de aceptación
interface Testimonio {
  id: number
  nombreUsuario: string
  departamento: string
  zonaBarrio: string
  categoria: string
  texto: string
  avatar: string | null
  likes: number
  activo: boolean
}

export default function AdminTestimoniosPage() {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')

  // Simulación de carga de datos (Criterio 1)
  useEffect(() => {
    const fetchTestimonios = async () => {
      try {
        // Aquí iría tu llamada a la API real
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonios`)
        setIsLoading(false)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    fetchTestimonios()
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header de la sección */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-montserrat text-stone-900">
              Gestión de <span className="text-amber-600">Testimonios</span>
            </h1>
            <p className="text-stone-600 font-inter mt-1">
              Administra las reseñas que aparecen en el Home.
            </p>
          </div>
          
          <button 
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-sm"
            onClick={() => {/* Lógica para abrir modal de creación - Criterio 2 */}}
          >
            <Plus className="h-5 w-5" />
            Nuevo Testimonio
          </button>
        </div>

        {/* Barra de herramientas / Filtros */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input 
              type="text"
              placeholder="Buscar por nombre o ciudad..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex gap-2 text-sm text-stone-500 font-medium ml-auto">
            <span>Total: {testimonios.length} gestionados</span>
          </div>
        </div>

        {/* Listado de Testimonios (Criterio 1) */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-sm font-semibold text-stone-700 font-montserrat">Autor</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-700 font-montserrat">Ubicación / Categoría</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-700 font-montserrat">Contenido</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-700 font-montserrat">Estado</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-700 font-montserrat text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading ? (
                // Skeleton loading similar al Dashboard
                [1,2,3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-stone-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : (
                // Mapeo de testimonios reales
                testimonios.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 overflow-hidden relative">
                          {t.avatar ? (
                            <Image src={t.avatar} alt={t.nombreUsuario} fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-amber-700 font-bold">
                              {t.nombreUsuario[0]}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-stone-900">{t.nombreUsuario}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-stone-600">{t.departamento}</span>
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full w-fit mt-1">
                          {t.categoria}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-stone-500 line-clamp-1 max-w-xs">
                        {t.texto}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {/* Toggle de Estado (Criterio 6) */}
                      <button 
                        onClick={() => {/* Lógica toggle */}}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          t.activo 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {t.activo ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {t.activo ? 'ACTIVO' : 'INACTIVO'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                          onClick={() => {/* Confirmación y delete - Criterio 5 */}}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Empty State */}
          {!isLoading && testimonios.length === 0 && (
            <div className="py-20 text-center">
              <Star className="h-12 w-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-500 font-inter">No hay testimonios registrados aún.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}