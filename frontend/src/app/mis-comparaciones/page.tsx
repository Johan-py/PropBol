'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Propiedad {
  id: number
  titulo: string
  ubicacion: string
  precio: number
  superficie: number
  categoria: string
  tipoAccion: string
}

interface Comparacion {
  id: number
  nombre: string
  fecha: string
  propiedades: Propiedad[]
}

export default function MisComparacionesPage() {
  const [filtro, setFiltro] = useState('Ver Todas')
  const [comparaciones, setComparaciones] = useState<Comparacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const categorias = ['Ver Todas', 'Casas', 'Departamentos', 'Terrenos']

  const getToken = () => localStorage.getItem('token')

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // Mapeo de categorías para el endpoint
  const getCategoriaEndpoint = (filtro: string): string | null => {
    const map: Record<string, string> = {
      Casas: 'CASA',
      Departamentos: 'DEPARTAMENTO',
      Terrenos: 'TERRENO'
    }
    return map[filtro] || null
  }

  // ✅ Función para transformar datos del backend al formato del frontend
  const transformarComparacion = (comp: any): Comparacion => {
    // Si ya tiene la estructura 'propiedades' (endpoint de categoría transformado)
    if (comp.propiedades) {
      return comp
    }

    // Si viene del endpoint /comparaciones (con detalle_comparacion)
    return {
      id: comp.id,
      nombre: comp.nombre,
      fecha: comp.creadoEn,
      propiedades:
        comp.detalle_comparacion?.map((detalle: any) => ({
          id: detalle.inmueble.id,
          titulo: detalle.inmueble.titulo,
          ubicacion:
            detalle.inmueble.ubicacion?.zona ||
            detalle.inmueble.ubicacion?.ciudad ||
            'Ubicación no disponible',
          precio: detalle.inmueble.precio,
          superficie: detalle.inmueble.superficieM2,
          categoria: detalle.inmueble.categoria,
          tipoAccion: detalle.inmueble.tipo_accion || detalle.inmueble.tipoAccion
        })) || []
    }
  }

  // Fetch según el filtro seleccionado
  const fetchComparaciones = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const token = getToken()
      let url = `${API_BASE_URL}/api/comparaciones`

      // Si no es "Ver Todas", usa el endpoint de categoría
      if (filtro !== 'Ver Todas') {
        const categoriaEndpoint = getCategoriaEndpoint(filtro)
        if (categoriaEndpoint) {
          url = `${API_BASE_URL}/api/comparaciones/categoria/${categoriaEndpoint}`
        }
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar las comparaciones')
      }

      const data = await response.json()

      // ✅ Transformar los datos al formato unificado
      const transformedData = Array.isArray(data) ? data.map(transformarComparacion) : []
      setComparaciones(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching comparaciones:', err)
    } finally {
      setLoading(false)
    }
  }, [filtro, API_BASE_URL])

  // Efecto para cargar datos cuando cambia el filtro
  useEffect(() => {
    fetchComparaciones()
  }, [fetchComparaciones])

  // Eliminar comparación
  const eliminarComparacion = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta comparación?')) return

    try {
      const token = getToken()
      const response = await fetch(`${API_BASE_URL}/api/comparaciones/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la comparación')
      }

      // Recargar según el filtro actual
      await fetchComparaciones()
    } catch (err) {
      console.error('Error deleting comparacion:', err)
      alert('Error al eliminar la comparación')
    }
  }

  // ✅ Función para agrupar comparaciones por categoría
  const comparacionesAgrupadas = () => {
    const grouped: Record<string, Comparacion[]> = {
      DEPARTAMENTO: [],
      CASA: [],
      TERRENO: [],
      OTROS: []
    }

    comparaciones.forEach((comp) => {
      const categoriaPrincipal = comp.propiedades[0]?.categoria || 'OTROS'
      const categoriaKey = categoriaPrincipal as keyof typeof grouped

      if (grouped[categoriaKey]) {
        grouped[categoriaKey].push(comp)
      } else {
        grouped['OTROS'].push(comp)
      }
    })

    return grouped
  }

  const getCategoriaNombre = (categoria: string) => {
    const nombres: Record<string, string> = {
      DEPARTAMENTO: 'Departamentos',
      CASA: 'Casas',
      TERRENO: 'Terrenos',
      OFICINA: 'Oficinas',
      CUARTO: 'Cuartos',
      OTROS: 'Otras'
    }
    return nombres[categoria] || categoria
  }

  const formatPrecio = (precio: number) => {
    if (precio >= 1000) {
      return `$${precio.toLocaleString()}`
    }
    return `$${precio}`
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-4 md:p-12 font-sans">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E87B00]"></div>
          <p className="mt-4 text-gray-600">Cargando tus comparaciones...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white p-4 md:p-12 font-sans">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
            <p>Error: {error}</p>
            <button
              onClick={fetchComparaciones}
              className="mt-4 px-4 py-2 bg-[#E87B00] text-white rounded-lg hover:bg-orange-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    )
  }

  const grupos = comparacionesAgrupadas()

  return (
    <main className="min-h-screen bg-white p-4 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
            Historial de Comparaciones
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Revisa y retorna tus análisis previos de propiedades.
          </p>
          {comparaciones.length === 0 && filtro === 'Ver Todas' && (
            <p className="text-gray-500 mt-4">Aún no tienes comparaciones guardadas.</p>
          )}
          {comparaciones.length === 0 && filtro !== 'Ver Todas' && (
            <p className="text-gray-500 mt-4">No hay comparaciones para {filtro.toLowerCase()}.</p>
          )}
        </header>

        <div className="flex gap-2 md:gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-4 md:px-6 py-2 rounded-xl border-2 text-sm md:text-lg font-medium transition-all whitespace-nowrap ${
                filtro === cat
                  ? 'bg-[#E87B00] text-white border-[#E87B00]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {Object.entries(grupos).map(([categoria, comparacionesList]) => {
            if (comparacionesList.length === 0) return null

            return comparacionesList.map((comp) => (
              <section
                key={comp.id}
                className={`rounded-3xl border p-5 md:p-8 flex flex-col ${
                  categoria === 'DEPARTAMENTO'
                    ? 'bg-[#F0F4FF] border-[#DCE4FF]'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center mb-6 px-2">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 text-center md:text-left">
                    {comp.nombre || `Comparación de ${getCategoriaNombre(categoria)}`}
                  </h2>
                  <span className="text-xs text-gray-400">{formatFecha(comp.fecha)}</span>
                </div>

                <div
                  className={`grid gap-4 mb-8 ${
                    comp.propiedades.length === 3
                      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                      : comp.propiedades.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-1'
                  }`}
                >
                  {comp.propiedades.map((prop) => (
                    <div
                      key={prop.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-50 hover:shadow-md transition-shadow"
                    >
                      <div className="h-40 md:h-28 bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">📷 Imagen</span>
                      </div>
                      <div className="p-4 md:p-3 text-[13px] leading-tight">
                        <p className="font-bold text-black mb-2 text-[15px] md:text-[14px] truncate">
                          {prop.titulo || `Propiedad ${prop.id}`}
                        </p>
                        <p className="text-black mb-1">
                          <strong>Ubicación:</strong> {prop.ubicacion}
                        </p>
                        <p className="text-black mb-1">
                          <strong>Precio:</strong> {formatPrecio(prop.precio)}
                          {prop.tipoAccion === 'ALQUILER' && ' / mes'}
                        </p>
                        <p className="text-black">
                          <strong>Superficie:</strong> {prop.superficie || 'N/E'}m²
                        </p>
                        {prop.tipoAccion && (
                          <p className="text-black mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                prop.tipoAccion === 'VENTA'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {prop.tipoAccion === 'VENTA' ? 'Venta' : 'Alquiler'}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => eliminarComparacion(comp.id)}
                  className="mt-auto mx-auto flex items-center gap-2 px-6 md:px-8 py-3 md:py-2 bg-white border border-[#F3C291] text-[#E87B00] rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-sm text-sm"
                >
                  <Trash2 size={18} /> Eliminar comparación
                </button>
              </section>
            ))
          })}
        </div>
      </div>
    </main>
  )
}
