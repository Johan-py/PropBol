'use client'
import { OfertaSidebar } from '@/components/filters/OfertaSidebar'
import { CapacidadSidebar } from '@/components/filters/CapacidadSidebar'
import MisZonasSidebar from '@/components/map/MisZonasSidebar'
import { point, polygon } from '@turf/helpers'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
  useMemo,
  type Ref,
} from 'react'
import { useSearchParams, useRouter } from "next/navigation";
import nextDynamic from 'next/dynamic'
import {
  ChevronLeft,
  ChevronRight,
  List as ListIcon,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  X,
  Filter
} from 'lucide-react'

// === HOOKS ===
import { useProperties } from '@/hooks/useProperties'
import { useOrdenamiento } from '@/hooks/useOrdenamiento'
import { useZonas } from '@/hooks/useZonas'
import { useCompareStore } from '@/hooks/useCompareStore'

// === COMPONENTES ===
import FilterBar from '@/components/filters/FilterBar'
import PriceFilterSidebar from '@/components/filters/PriceFilterSidebar'
import PropertyCard from '@/components/layout/PropertyCard'
import PropertyRow from '@/components/galeria/PropertyRow'
import EmptyState from '@/components/galeria/EmptyState'
import MapaListadoPaginacion, { PageSize } from "@/components/galeria/MapaListadoPaginacion";
import { MenuOrdenamiento } from '@/components/busqueda/ordenamiento/MenuOrdenamiento'
import { ErrorState } from '@/components/ClusterSidebar'
import SuperficieFilterSidebar from '@/components/filters/SuperficieFilterSidebar'
import { UbicacionEspecificaPanel } from '@/components/filters/UbicacionEspecificaPanel';
import ComparatorModal from '@/components/busqueda/ComparatorModal'

// Carga dinámica del mapa (sin SSR)
const MapView = nextDynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400">
      Cargando mapa de Bolivia...
    </div>
  )
})

// === HOOKS DE DETECCIÓN MÓVIL ===
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

function useIsLandscapeMobile() {
  const [isLandscape, setIsLandscape] = useState(false)
  useEffect(() => {
    const handler = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerHeight < 500)
    }
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)
    handler()
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [])
  return isLandscape
}

const SHEET_H = { peek: '50%', full: '100%' } as const
type SheetState = 'hidden' | 'peek' | 'full'

const LIST_PAGE_SIZES = [10, 20, 50, 100] as const;
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

interface ZonaUsuario {
  id: number
  nombre: string
  geometria: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

function extraerCoordenadasDeGeometria(geometria: ZonaUsuario['geometria'] | null | undefined): [number, number][] {
  if (!geometria || geometria.type !== 'Polygon' || !Array.isArray(geometria.coordinates?.[0])) {
    return []
  }

  const ring = geometria.coordinates[0]
  const puntos = ring
    .map((coord) => {
      if (!Array.isArray(coord) || coord.length < 2) return null
      return [Number(coord[1]), Number(coord[0])] as [number, number]
    })
    .filter((coord): coord is [number, number] => Boolean(coord))

  if (puntos.length >= 2) {
    const [firstLat, firstLng] = puntos[0]
    const [lastLat, lastLng] = puntos[puntos.length - 1]
    if (firstLat === lastLat && firstLng === lastLng) {
      return puntos.slice(0, -1)
    }
  }

  return puntos
}

function esZonaNavegable(coords: [number, number][]): boolean {
  if (!Array.isArray(coords) || coords.length < 3) return false

  return coords.every(([lat, lng]) => (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ))
}

function BusquedaMapaContent() {
  const [isMisZonasOpen, setIsMisZonasOpen] = useState(false)
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterResetKey = searchParams.toString();
  const minSuperficie = searchParams.get('minSuperficie')
  const maxSuperficie = searchParams.get('maxSuperficie')
  const tieneFiltrSuperficie = minSuperficie || maxSuperficie
  const [isScrolled, setIsScrolled] = useState(false)
  const { isCompareMode, selectedIds, toggleProperty } = useCompareStore()
  const [isModalOpen, setIsModalOpen] = useState(false);

  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const searchOrigin = useMemo<[number, number] | null>(() => {
    return (latParam && lngParam)
      ? [parseFloat(latParam), parseFloat(lngParam)]
      : null
  }, [latParam, lngParam])

  //estado para controlar la autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOfertaOpen, setIsOfertaOpen] = useState(false)

  const toggleOferta = () => {
    setIsOfertaOpen(!isOfertaOpen)
    if (!isOfertaOpen) {
      setActiveSidebarView('oferta')
      setIsSidebarOpen(true)
    } else {
      setActiveSidebarView('results')
    }
  }

  const toggleCapacidad = () => {
    setIsPriceFilterOpen(false)
    setIsSidebarOpen(true)
    setActiveSidebarView(prev => prev === 'capacidad' ? 'results' : 'capacidad')
  }

  const [misZonas, setMisZonas] = useState<ZonaUsuario[]>([])
  const [newZoneName, setNewZoneName] = useState('Nueva zona')
  const [isCreatingCustomZone, setIsCreatingCustomZone] = useState(false)
  const [isSavingNewZone, setIsSavingNewZone] = useState(false)
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null)
  const [editingZoneName, setEditingZoneName] = useState('')
  const [editingPolygonPoints, setEditingPolygonPoints] = useState<[number, number][]>([])
  const [isSavingEditedZone, setIsSavingEditedZone] = useState(false)


  useEffect(() => {
    const syncAuthFromStorage = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(Boolean(token))
    }

    syncAuthFromStorage()

    const handleSessionChange = () => {
      syncAuthFromStorage()
    }

    window.addEventListener('storage', handleSessionChange)
    window.addEventListener('propbol:login', handleSessionChange as EventListener)
    window.addEventListener('propbol:logout', handleSessionChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleSessionChange)
      window.removeEventListener('propbol:login', handleSessionChange as EventListener)
      window.removeEventListener('propbol:logout', handleSessionChange as EventListener)
    }
  }, [])

  // === 1. ESTADOS COMPARTIDOS ===
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sheetState, setSheetState] = useState<SheetState>('peek')
  const [pinnedProperty, setPinnedProperty] = useState<any | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false)
  const [activeSidebarView, setActiveSidebarView] = useState<'results' | 'superficie' | 'capacidad' | 'ubicacion' | 'oferta'>('results')

  useEffect(() => {
    const handleAbrirUbicacion = () => {
      setIsPriceFilterOpen(false); // Cierra el de precio si estaba abierto

      // Si el panel de ubicación ya está abierto en el sidebar, lo cerramos volviendo a results
      if (activeSidebarView === 'ubicacion' && isSidebarOpen) {
        setActiveSidebarView('results');
      } else {
        // De lo contrario, nos aseguramos de que el sidebar esté abierto y mostramos ubicación
        setIsSidebarOpen(true);
        setActiveSidebarView('ubicacion');
      }
    };

    window.addEventListener('abrirPanelUbicacion', handleAbrirUbicacion);
    return () => window.removeEventListener('abrirPanelUbicacion', handleAbrirUbicacion);
  }, [activeSidebarView, isSidebarOpen]);

  // --- INICIO ESTADOS HU8 ---
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [currentPolygonPoints, setCurrentPolygonPoints] = useState<[number, number][]>([])
  const [drawnPolygons, setDrawnPolygons] = useState<[number, number][][]>([])
  const [drawingError, setDrawingError] = useState(false)

  const resetEditingZone = useCallback(() => {
    setEditingZoneId(null)
    setEditingZoneName('')
    setEditingPolygonPoints([])
    setIsSavingEditedZone(false)
  }, [])

  const resetDrawing = () => {
    setIsDrawingMode(false)
    setCurrentPolygonPoints([])
    setDrawnPolygons([])
    setDrawingError(false)
    setIsCreatingCustomZone(false)
  }
  // --- FIN ESTADOS HU8 ---

  const isMobile = useIsMobile()
  const isLandscape = useIsLandscapeMobile()

  const [isSuperficieSidebarOpen, setIsSuperficieSidebarOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // === 2. EXTRACCIÓN DE DATOS BASE Y ZONAS (develop) ===
  const { properties, isLoading, error } = useProperties()
  const { zonas } = useZonas()
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null)

  const cargarMisZonas = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMisZonas([])
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/perfil/zonas`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('No se pudieron cargar tus zonas')
      }

      const data = await response.json()
      setMisZonas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error cargando mis zonas:', err)
      setMisZonas([])
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setMisZonas([])
      return
    }
    cargarMisZonas()
  }, [isAuthenticated, cargarMisZonas])

  const zonasCombinadas = useMemo(() => {
    const zonasUsuarioParaMapa = misZonas
      .map((zonaUsuario) => {
        const coordenadas = extraerCoordenadasDeGeometria(zonaUsuario.geometria)
        if (coordenadas.length < 3) return null

        return {
          id: -zonaUsuario.id,
          nombre: zonaUsuario.nombre,
          coordenadas,
          color: '#ea580c',
          activa: true,
          creadoEn: new Date().toISOString()
        }
      })
      .filter((zona): zona is NonNullable<typeof zona> => Boolean(zona))

    return [...zonas, ...zonasUsuarioParaMapa]
  }, [zonas, misZonas])

  const zonasSidebar = useMemo(
    () => misZonas.map((zona) => ({ id: String(zona.id), nombre: zona.nombre })),
    [misZonas]
  )

  const saveDraftZone = useCallback(async () => {
    if (!isAuthenticated || isSavingNewZone || !isCreatingCustomZone) return

    // ✅ FIX: Leemos del polígono cerrado en caso de que ya lo haya finalizado
    const puntosBase = currentPolygonPoints.length >= 3 ? currentPolygonPoints : drawnPolygons[0]
    if (!puntosBase || puntosBase.length < 3) return

    const token = localStorage.getItem('token')
    if (!token) return

    setIsSavingNewZone(true)
    try {
      const ring = [...puntosBase, puntosBase[0]].map(([lat, lng]) => [lng, lat])

      // Limpiamos la cadena dejando solo alfanuméricos, espacios y caracteres acentuados
      let nombreLimpio = newZoneName.trim() || 'Nueva zona'
      nombreLimpio = nombreLimpio.replace(/[^a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ]/g, '')
      const nombreFinal = nombreLimpio || 'Zona sin nombre'

      const response = await fetch(`${API_URL}/api/perfil/zonas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nombreFinal.slice(0, 100),
          geometria: {
            type: 'Polygon',
            coordinates: [ring]
          }
        })
      })

      if (!response.ok) {
        throw new Error('No se pudo guardar la zona')
      }

      const zonaCreada = await response.json()
      await cargarMisZonas()

      if (zonaCreada?.id) {
        setSelectedZoneId(-Number(zonaCreada.id))
      }

      setCurrentPolygonPoints([])
      setDrawnPolygons([])
      setIsDrawingMode(false)
      setIsCreatingCustomZone(false)
      setNewZoneName('Nueva zona')
    } catch (err) {
      console.error('Error guardando zona:', err)
    } finally {
      setIsSavingNewZone(false)
    }
  }, [
    isAuthenticated,
    isSavingNewZone,
    isCreatingCustomZone,
    currentPolygonPoints,
    newZoneName,
    cargarMisZonas
  ])

  const cancelDraftZone = useCallback(() => {
    setNewZoneName('Nueva zona')
    setIsMisZonasOpen(true)
    resetDrawing()
  }, [])

  const startEditZone = useCallback(
    (id: string) => {
      const zoneId = Number(id)
      if (Number.isNaN(zoneId)) return

      const zone = misZonas.find((item) => item.id === zoneId)
      if (!zone) return

      const points = extraerCoordenadasDeGeometria(zone.geometria)
      if (points.length < 3) return

      setEditingZoneId(id)
      setEditingZoneName(zone.nombre)
      setEditingPolygonPoints(points)
      setIsCreatingCustomZone(false)
      setIsDrawingMode(false)
      setCurrentPolygonPoints([])
      setDrawnPolygons([])
      setSelectedZoneId(-zoneId)
      setIsMisZonasOpen(true)
      setIsSidebarOpen(false)
    },
    [misZonas]
  )

  const saveEditedZone = useCallback(async () => {
    if (!editingZoneId || isSavingEditedZone || editingPolygonPoints.length < 3) return

    const token = localStorage.getItem('token')
    if (!token) return

    const zoneId = Number(editingZoneId)
    if (Number.isNaN(zoneId)) return

    setIsSavingEditedZone(true)
    try {
      const ring = [...editingPolygonPoints, editingPolygonPoints[0]].map(([lat, lng]) => [lng, lat])

      // Aplicamos la misma limpieza de caracteres alfanuméricos
      let nombreLimpio = editingZoneName.trim() || 'Nueva zona'
      nombreLimpio = nombreLimpio.replace(/[^a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ]/g, '')
      const nombreFinal = nombreLimpio || 'Zona sin nombre'

      const response = await fetch(`${API_URL}/api/perfil/zonas/${zoneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nombreFinal.slice(0, 100),
          geometria: {
            type: 'Polygon',
            coordinates: [ring]
          }
        })
      })

      if (!response.ok) {
        throw new Error('No se pudo actualizar la zona')
      }

      await cargarMisZonas()
      setSelectedZoneId(-zoneId)
      resetEditingZone()
    } catch (err) {
      console.error('Error actualizando zona:', err)
    } finally {
      setIsSavingEditedZone(false)
    }
  }, [
    editingZoneId,
    isSavingEditedZone,
    editingPolygonPoints,
    editingZoneName,
    cargarMisZonas,
    resetEditingZone
  ])

  const cancelEditZone = useCallback(() => {
    resetEditingZone()
  }, [resetEditingZone])

  const deleteZone = useCallback(
    async (id: string) => {
      const token = localStorage.getItem('token')
      const zoneId = Number(id)
      if (!token || Number.isNaN(zoneId)) return

      const confirmed = window.confirm('¿Eliminar esta zona?')
      if (!confirmed) return

      try {
        const response = await fetch(`${API_URL}/api/perfil/zonas/${zoneId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
          throw new Error('No se pudo eliminar la zona')
        }

        if (selectedZoneId === -zoneId) {
          setSelectedZoneId(null)
        }

        if (editingZoneId === id) {
          resetEditingZone()
        }

        await cargarMisZonas()
      } catch (err) {
        console.error('Error eliminando zona:', err)
      }
    },
    [cargarMisZonas, selectedZoneId, editingZoneId, resetEditingZone]
  )

  // === 3. LÓGICA MATEMÁTICA HU8 (Filtro por polígono) ===
  const displayedProperties = useMemo(() => {
    if (!properties) return []
    if (drawnPolygons.length > 0) {
      try {
        return properties.filter((p: any) => {
          if (p.lat == null || p.lng == null) return false
          const pt = point([p.lng, p.lat])
          return drawnPolygons.some((polyPoints) => {
            if (polyPoints.length < 3) return false
            const turfCoords = [...polyPoints, polyPoints[0]].map((p) => [p[1], p[0]])
            const drawPoly = polygon([turfCoords])
            return booleanPointInPolygon(pt, drawPoly)
          })
        })
      } catch (err) {
        console.error('Error en validación geométrica:', err)
        return properties
      }
    }
    if (selectedZoneId !== null) {
      // CAMBIO: Usar zonasCombinadas para incluir las personalizadas del usuario
      const zona = zonasCombinadas.find((z: any) => z.id === selectedZoneId)
      if (zona && zona.coordenadas && zona.coordenadas.length >= 3) {
        const coords = [...zona.coordenadas, zona.coordenadas[0]].map((c: any) => [c[1], c[0]])
        return properties.filter((p: any) => p.lat != null && booleanPointInPolygon(point([p.lng, p.lat]), polygon([coords])))
      }
    }
    return properties
  }, [properties, drawnPolygons, selectedZoneId, zonasCombinadas])

  // === 4. ORDENAMIENTO (Usando resultados filtrados) ===
  const { ordenActual, cambiarOrden, inmueblesOrdenados } = useOrdenamiento({
    inmuebles: displayedProperties
  })

  // === LÓGICA DE PAGINACIÓN ===
  const [listPage, setListPage] = useState(1);
  const [listPageSize, setListPageSize] = useState<PageSize>(10);

  const listTotal = inmueblesOrdenados.length;
  const listTotalPages = Math.max(1, Math.ceil(listTotal / listPageSize));
  const listSafePage = Math.min(Math.max(1, listPage), listTotalPages);

  const paginatedProperties = useMemo(() => {
    if (listTotal === 0) return [];
    const start = (listSafePage - 1) * listPageSize;
    return inmueblesOrdenados.slice(start, start + listPageSize);
  }, [inmueblesOrdenados, listSafePage, listPageSize, listTotal]);

  useEffect(() => {
    setListPage(1);
  }, [filterResetKey, drawnPolygons]);

  useEffect(() => {
    if (listPage > listTotalPages) setListPage(listTotalPages);
  }, [listPage, listTotalPages]);

  const listScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [listSafePage, listPageSize, filterResetKey, drawnPolygons]);

  // === 5. ESTADOS VISUALES Y DE CLUSTERS (develop + HU8) ===
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isHoveringList, setIsHoveringList] = useState(false)

  const [clusterProperties, setClusterProperties] = useState<any[]>([])
  const [isClusterView, setIsClusterView] = useState(false)
  const [activeClusterIds, setActiveClusterIds] = useState<string[]>([])

  const dragStartY = useRef<number | null>(null)
  const dragStartState = useRef<SheetState>('peek')

  // Hover con debounce de 200 ms → vuela el mapa al marcador
  useEffect(() => {
    if (!hoveredId) {
      if (!isHoveringList) {
        setSelectedPropertyId(null)
      }
      return
    }

    const timeout = setTimeout(() => {
      if (isHoveringList) {
        setSelectedPropertyId(hoveredId)
      }
    }, 200)

    return () => clearTimeout(timeout)
  }, [hoveredId, isHoveringList])

  // Sincronización del mapa con el colapso del panel lateral
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 310)
    return () => clearTimeout(t)
  }, [isSidebarOpen, sheetState])

  function handleClusterClick(props: any[]) {
    setClusterProperties(props)
    setIsClusterView(true)
    setActiveClusterIds(props.map((p: any) => p.id))
    setSheetState('peek')
  }

  const handleMapSelect = useCallback(
    (id: string | null) => {
      setSelectedPropertyId(id)

      if (id) {
        const prop = inmueblesOrdenados.find((p: any) => p.id === id)
        if (prop) {
          setPinnedProperty(prop)
          setSheetState('peek')
        }
      } else {
        setPinnedProperty(null)
        setIsClusterView(false)
        setActiveClusterIds([])
        setClusterProperties([])
      }
    },
    [inmueblesOrdenados]
  )

  const handleZoneCycle = useCallback((direction: 1 | -1) => {
    const zoneIds = zonasCombinadas
      .filter((zona) => esZonaNavegable(zona.coordenadas))
      .map((zona) => zona.id)

    if (selectedZoneId === null || zoneIds.length === 0) return

    const currentIndex = zoneIds.findIndex((id) => id === selectedZoneId)
    const nextIndex = currentIndex === -1
      ? (direction === -1 ? zoneIds.length - 1 : 0)
      : (currentIndex + direction + zoneIds.length) % zoneIds.length

    setSelectedZoneId(zoneIds[nextIndex])
    setIsClusterView(false)
    setActiveClusterIds([])
    setClusterProperties([])
  }, [selectedZoneId, zonasCombinadas])

  const handleZoneSelect = (id: number | null) => {
    setSelectedZoneId(id)
    setIsClusterView(false)
    setActiveClusterIds([])
    setClusterProperties([])
  }

  // HU4 - Abre el detalle de la propiedad en una nueva pestaña.
  // Se usa property.id porque en filtros corresponde al inmuebleId.
  const abrirDetallePropiedad = (propertyId: string | number) => {
    window.open(`/detalle-propiedad/${propertyId}`, '_blank', 'noopener,noreferrer')
  }

  // Eventos táctiles para el Bottom Sheet
  function onTouchStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY
    dragStartState.current = sheetState === 'hidden' ? 'peek' : sheetState
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (dragStartY.current === null) return
    const dy = dragStartY.current - e.changedTouches[0].clientY
    if (Math.abs(dy) < 20) {
      dragStartY.current = null
      return
    }
    if (dy > 40) {
      setSheetState(dragStartState.current === 'peek' ? 'full' : 'full')
    } else if (dy < -40) {
      setSheetState(dragStartState.current === 'full' ? 'peek' : 'hidden')
    }
    dragStartY.current = null
  }

  // ── COMPONENTES COMPARTIDOS MÓVILES ───────────────────────
  const MenuToggleComponent = (
    <div className="flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner scale-90">
      <button
        onClick={() => setViewMode('grid')}
        className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400'
          }`}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400'
          }`}
      >
        <ListIcon size={16} />
      </button>
    </div>
  )

  const PropertyListMobile = ({
    onClickItem,
    listScrollRef,
  }: {
    onClickItem?: (p: any) => void;
    listScrollRef: Ref<HTMLDivElement>;
  }) => (
    <div ref={listScrollRef} className="flex-1 overflow-y-auto p-4 bg-stone-50 no-scrollbar">
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-full text-stone-400 text-sm gap-2">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />{' '}
          Actualizando...
        </div>
      ) : displayedProperties.length === 0 ? (
        <EmptyState
          titulo={
            tieneFiltrSuperficie
              ? 'Sin resultados por superficie'
              : 'No hay propiedades existentes'
          }
          mensaje={
            tieneFiltrSuperficie
              ? `No se encontraron propiedades dentro del rango de superficie seleccionado.`
              : 'No se encontraron propiedades con los filtros seleccionados. Intenta con otra zona o categoría.'
          }
        />
      ) : (
        <div
          className={`gap-3 flex flex-col ${viewMode === 'list'
            ? 'divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl shadow-sm'
            : ''
            }`}
        >
          {(isClusterView ? clusterProperties : paginatedProperties).map((property: any) => (
            <div
              key={property.id}
              onClick={() => {
                if (isCompareMode) {
                  toggleProperty(property.id);
                } else {
                  // HU4 - Mantiene la selección visual actual
                  setSelectedPropertyId(property.id)

                  // HU4 - Conserva el comportamiento existente del listado móvil
                  onClickItem?.(property)
                }
              }}
              className={`cursor-pointer transition-all duration-200 rounded-xl relative focus:outline-none focus:ring-0 focus:ring-offset-0 ${viewMode === 'grid'
                ? 'transform scale-95 origin-top mx-auto mb-[-4%]'
                : 'w-full py-1 hover:bg-stone-100'
                } ${isCompareMode && selectedIds.includes(property.id)
                  ? 'ring-4 ring-[#ea580c] scale-[0.98] shadow-lg bg-orange-50/30'
                  : ''
                }`}
            >
              {viewMode === 'grid' ? (
                <PropertyCard
                  imagen=""
                  estado={property.type}
                  precioFormateado={property.precioFormateado || 'Consultar precio'}
                  descripcion={property.descripcion || property.title}
                  ubicacionTexto={property.ubicacionTexto}
                  categoriaTexto={property.categoriaTexto}
                  accionTexto={property.accionTexto}
                  camas={property.nroCuartos ?? 0}
                  banos={property.nroBanos ?? 0}
                  metros={property.superficieM2 ?? 0}
                  // HU4 - Pasa la acción de abrir detalle al botón "Ver detalles" en vista grilla
                  onViewDetails={() => {
                    if (!isCompareMode) abrirDetallePropiedad(property.id)
                  }}
                />
              ) : (
                <PropertyRow
                  title={property.title}
                  precioFormateado={property.precioFormateado || 'Consultar precio'}
                  size={`${property.nroCuartos ?? 0} Dorm. • ${property.superficieM2 ?? 0} m²`}
                  ubicacionTexto={property.ubicacionTexto}
                  categoriaTexto={property.categoriaTexto}
                  accionTexto={property.accionTexto}
                  contactType="whatsapp"
                  image={
                    property.thumbnailUrl ||
                    property.imagen ||
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
                  }
                  // HU4 - Pasa la acción de abrir detalle al botón "Ver detalles" en vista tabla
                  onViewDetails={() => {
                    if (!isCompareMode) abrirDetallePropiedad(property.id)
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderListPaginationFooter = () => {
    if (isClusterView) {
      return clusterProperties.length > 0 ? (
        <div className="shrink-0 border-t border-stone-100 bg-stone-50 px-3 py-2">
          <p className="text-[11px] text-stone-500 text-center sm:text-left">
            Mostrando {clusterProperties.length}{" "}
            {clusterProperties.length === 1 ? "propiedad del clúster" : "propiedades del clúster"}.
          </p>
        </div>
      ) : null;
    }

    return listTotal > 0 ? (
      <MapaListadoPaginacion
        total={listTotal}
        page={listSafePage}
        pageSize={listPageSize}
        onPageChange={setListPage}
        onPageSizeChange={(s) => {
          setListPageSize(s);
          setListPage(1);
        }}
        hint={error ? `Error al cargar: ${error}` : null}
      />
    ) : null;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER LANDSCAPE MÓVIL
  // ────────────────────────────────────────────────────────────────────────────
  if (isMounted && (isMobile || isLandscape)) {
    if (isLandscape) {
      return (
        <div className="flex flex-col bg-white overflow-hidden" style={{ height: '100dvh' }}>
          <div className="shrink-0" style={{ zIndex: 1002, position: 'relative' }}>
            <FilterBar variant="map" onSearch={(f) => console.log('🔍 Filtros:', f)} onOpenSuperficieFilter={() => {
              setIsSidebarOpen(true)
              setActiveSidebarView('superficie')
            }} />
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 relative">
              <div className="absolute inset-0" style={{ zIndex: 0 }}>
                <MapView
                  properties={inmueblesOrdenados}
                  selectedId={selectedPropertyId}
                  searchOrigin={searchOrigin}
                  zonas={zonasCombinadas}
                  selectedZoneId={selectedZoneId}
                  onZoneSelect={handleZoneSelect}
                  onZoneCycle={handleZoneCycle}
                  onSelect={handleMapSelect}
                  isLoading={isLoading}
                  error={error}
                  isDrawingMode={isDrawingMode}
                  polygonPoints={currentPolygonPoints}
                  isPolygonClosed={false}
                  drawnPolygons={drawnPolygons}
                  isZoneEditingMode={Boolean(editingZoneId)}
                  editablePolygonPoints={editingPolygonPoints}
                  onEditablePointDrag={(index, lat, lng) => {
                    setEditingPolygonPoints((prev) =>
                      prev.map((point, pointIndex) =>
                        pointIndex === index ? [lat, lng] : point
                      )
                    )
                  }}
                  onMapClick={(latlng) => {
                    if (isDrawingMode) {
                      if (currentPolygonPoints.length >= 15) {
                        alert('Límite máximo de 15 vértices');
                        return;
                      }
                      setCurrentPolygonPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
                    }
                  }}
                  onPointClick={(index) => {
                    if (isDrawingMode && index === 0 && currentPolygonPoints.length >= 3) {
                      setDrawnPolygons((prev) => [...prev, currentPolygonPoints])
                      setCurrentPolygonPoints([])
                      setDrawingError(false)
                      setIsDrawingMode(false)
                      setTimeout(() => setIsDrawingMode(true), 0)
                    }
                  }}
                />
              </div>
            </div>
            <div className="w-[280px] flex flex-col bg-white border-l border-stone-200 overflow-hidden shrink-0">
              <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between shrink-0">
                <span className="text-sm font-semibold text-slate-700">
                  <span className="text-orange-500">
                    {isClusterView ? clusterProperties.length : displayedProperties.length}
                  </span>
                  <span className="ml-1 text-gray-500 font-normal text-xs">props.</span>
                </span>
                {MenuToggleComponent}
              </div>
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <PropertyListMobile listScrollRef={listScrollRef} onClickItem={(p) => setPinnedProperty(p)} />
                {renderListPaginationFooter()}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ────────────────────────────────────────────────────────────────────────────
    // RENDER PORTRAIT MÓVIL — Bottom Sheet
    // ────────────────────────────────────────────────────────────────────────────
    return (
      <div className="flex flex-col overflow-hidden bg-white" style={{ height: '100dvh' }}>
        <div className="shrink-0 overflow-x-auto" style={{ zIndex: 1002, position: 'relative' }}>
          <div className="min-w-max">
            <FilterBar variant="map" onSearch={(f) => console.log('🔍 Filtros:', f)}
              onOpenSuperficieFilter={() => {
                setIsSidebarOpen(true)
                setActiveSidebarView('superficie')
              }}
            />
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0">
            <MapView
              properties={inmueblesOrdenados}
              selectedId={selectedPropertyId}
              searchOrigin={searchOrigin}
              zonas={zonasCombinadas}
              selectedZoneId={selectedZoneId}
              onZoneSelect={handleZoneSelect}
              onZoneCycle={handleZoneCycle}
              onSelect={handleMapSelect}
              isLoading={isLoading}
              error={error}
              isDrawingMode={isDrawingMode}
              polygonPoints={currentPolygonPoints}
              isPolygonClosed={false}
              drawnPolygons={drawnPolygons}
              isZoneEditingMode={Boolean(editingZoneId)}
              editablePolygonPoints={editingPolygonPoints}
              onEditablePointDrag={(index, lat, lng) => {
                setEditingPolygonPoints((prev) =>
                  prev.map((point, pointIndex) =>
                    pointIndex === index ? [lat, lng] : point
                  )
                )
              }}
              onMapClick={(latlng) => {
                if (isDrawingMode) {
                  if (currentPolygonPoints.length >= 15) {
                    alert('Límite máximo de 15 vértices');
                    return;
                  }
                  setCurrentPolygonPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
                }
              }}
              onPointClick={(index) => {
                if (isDrawingMode && index === 0 && currentPolygonPoints.length >= 3) {
                  setDrawnPolygons((prev) => [...prev, currentPolygonPoints])
                  setCurrentPolygonPoints([])
                  setDrawingError(false)
                  setIsDrawingMode(false)
                  setTimeout(() => setIsDrawingMode(true), 0)
                }
              }}
              onClusterClick={handleClusterClick}
              onClusterDissolve={() => { setIsClusterView(false); setActiveClusterIds([]); setClusterProperties([]) }}
              activeClusterIds={activeClusterIds}
            />
          </div>
          {sheetState === 'hidden' && (
            <button
              onClick={() => setSheetState('peek')}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[20] bg-white rounded-full px-5 py-3 shadow-xl border border-stone-200 flex items-center gap-2 text-sm font-semibold text-slate-700 active:scale-95 transition-transform"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}
            >
              <ListIcon size={16} className="text-orange-500" /> Ver lista
              {displayedProperties.length > 0 && (
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {displayedProperties.length}
                </span>
              )}
              <ChevronUp size={16} className="text-stone-400" />
            </button>
          )}
          {sheetState !== 'hidden' && (
            <div
              className="absolute left-0 right-0 bottom-0 z-[30] bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] flex flex-col"
              style={{
                height: SHEET_H[sheetState],
                transition: 'height 0.3s cubic-bezier(0.32,0.72,0,1)'
              }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="shrink-0 overflow-x-auto"
                style={{ zIndex: 10, position: 'relative' }}
              >
                <div
                  className="w-10 h-1.5 bg-stone-300 hover:bg-orange-400 rounded-full mb-3 transition-colors"
                  onClick={() => setSheetState((s) => (s === 'full' ? 'peek' : 'full'))}
                />
                <div className="flex items-center justify-between w-full px-4 pb-2">
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="text-orange-500">
                      {isClusterView ? clusterProperties.length : displayedProperties.length}
                    </span>
                    <span className="text-gray-500 font-normal">propiedades</span>
                  </span>
                  {isClusterView && (
                    <button
                      onClick={() => {
                        setIsClusterView(false)
                        setClusterProperties([])
                        setActiveClusterIds([])
                      }}
                      className="text-xs text-orange-500 hover:underline px-2"
                    >
                      ← Volver
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSheetState('hidden')
                      }}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full px-2 py-1"
                    >
                      <X size={12} />
                      <span>Ocultar</span>
                    </button>
                    {sheetState === 'peek' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSheetState('full')
                        }}
                        className="text-stone-400 hover:text-stone-600 p-1"
                      >
                        <ChevronUp size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSheetState('peek')
                        }}
                        className="text-stone-400 hover:text-stone-600 p-1"
                      >
                        <ChevronDown size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                {error && (
                  <div className="mx-4 mt-3 shrink-0">
                    <ErrorState onRetry={() => window.location.reload()} />
                  </div>
                )}
                {pinnedProperty && (
                  <div className="mx-4 mb-3 relative shrink-0">
                    <button
                      onClick={() => {
                        setPinnedProperty(null)
                        setSelectedPropertyId(null)
                      }}
                      className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow text-stone-400 hover:text-stone-600"
                    >
                      <X size={14} />
                    </button>
                    <div className="ring-2 ring-orange-400 rounded-xl overflow-hidden">
                      <PropertyCard
                        imagen=""
                        estado={pinnedProperty.type}
                        precioFormateado={pinnedProperty.precioFormateado || 'Consultar precio'}
                        descripcion={pinnedProperty.descripcion || pinnedProperty.title}
                        ubicacionTexto={pinnedProperty.ubicacionTexto}
                        categoriaTexto={pinnedProperty.categoriaTexto}
                        accionTexto={pinnedProperty.accionTexto}
                        camas={pinnedProperty.nroCuartos ?? 0}
                        banos={pinnedProperty.nroBanos ?? 0}
                        metros={pinnedProperty.superficieM2 ?? 0}
                      />
                    </div>
                  </div>
                )}
                <div className="px-4 shrink-0 border-b border-stone-100 pb-2">
                  <MenuOrdenamiento
                    totalResultados={displayedProperties.length}
                    ordenActual={ordenActual}
                    onOrdenChange={cambiarOrden}
                  />
                </div>
                <div className="px-4 py-2 flex justify-end shrink-0">
                  {MenuToggleComponent}
                </div>
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <PropertyListMobile
                    listScrollRef={listScrollRef}
                    onClickItem={(p) => {
                      setPinnedProperty(p)
                      setSheetState('peek')
                    }}
                  />
                  {renderListPaginationFooter()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER DESKTOP
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative z-10 flex flex-col bg-white w-full h-[calc(100dvh-54px)] overflow-hidden">
      <FilterBar
        variant="map"
        onSearch={(nuevosFiltros) => {
          console.log('🔍 Buscando con filtros:', nuevosFiltros)
        }}
        onOpenPriceFilter={() => {
          setIsPriceFilterOpen(prev => !prev)
          setIsSidebarOpen(true)
          setActiveSidebarView('results')
        }}
        onOpenSuperficieFilter={() => {
          setIsPriceFilterOpen(false)
          setIsSidebarOpen(true)
          setActiveSidebarView(prev => prev === 'superficie' ? 'results' : 'superficie')
        }}
        isCapacidadActive={activeSidebarView === 'capacidad' && isSidebarOpen}
        onToggleCapacidad={toggleCapacidad}

        isPriceFilterActive={isPriceFilterOpen}
        isSuperficieFilterActive={activeSidebarView === 'superficie' && isSidebarOpen}

        isZonaFilterActive={activeSidebarView === 'ubicacion' && isSidebarOpen}

        isOfertaActive={isOfertaOpen}
        onToggleOferta={toggleOferta}
      />

      <main className="flex flex-col md:flex-row w-full flex-1 min-h-0 relative overflow-hidden border-b border-stone-200">
        {/* Panel lateral colapsable */}
        <aside
          className={`bg-white border-r border-stone-200 flex flex-col z-10 transition-all duration-300 min-h-0 overflow-hidden ${isSidebarOpen ? 'w-full md:w-[450px] h-[65dvh] md:h-full' : 'w-0'
            }`}
        >
          {/* ✅ MODIFICADO: ternario que alterna entre filtro de precio y resultados */}
          {isPriceFilterOpen ? (
            // Vista del filtro de precio — reemplaza temporalmente los resultados
            <PriceFilterSidebar
              isOpen={isPriceFilterOpen}
              onClose={() => {
                setIsPriceFilterOpen(false) // cierra el filtro
                setIsSidebarOpen(true)      // asegura que el aside siga visible
              }}
              totalResultados={displayedProperties.length}
            />

          ) : isSidebarOpen && activeSidebarView === 'oferta' ? (
            <OfertaSidebar
              isOpen={true}
              onClose={() => {
                setIsOfertaOpen(false)
                setActiveSidebarView('results')
              }}
            />
          ): isSidebarOpen && activeSidebarView === 'capacidad' ? (
          <CapacidadSidebar
            isOpen={true}
            onClose={() => {
              setActiveSidebarView('results')
            }}
            onApply={(dormitoriosMin, dormitoriosMax, banosMin, banosMax, tipoBano) => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('dormitoriosMin', dormitoriosMin.toString())
              params.set('dormitoriosMax', dormitoriosMax.toString())
              params.set('banosMin', banosMin.toString())
              params.set('banosMax', banosMax.toString())
              params.set('tipoBano', tipoBano)
              router.push(`/busqueda_mapa?${params.toString()}`)
              setActiveSidebarView('results')
            }}
          />
          ) : isSidebarOpen && activeSidebarView === 'ubicacion' ? (
          <div className="flex flex-col h-full w-full bg-white relative">
            <UbicacionEspecificaPanel
              onClose={() => setActiveSidebarView('results')}
              onApply={(selecciones) => {
                // 1. Rescatamos los filtros actuales de la URL (precio, cuartos, tipo, etc)
                const params = new URLSearchParams(searchParams.toString());

                // 2. Limpiamos ubicaciones previas para evitar duplicados
                params.delete('departamentoId');
                params.delete('provinciaId');
                params.delete('municipioId');
                params.delete('zonaId');
                params.delete('barrioId');

                // 3. Añadimos las nuevas selecciones de este panel
                if (selecciones.departamento !== 'todos') params.set('departamentoId', selecciones.departamento.toString());
                if (selecciones.provincia !== 'todos') params.set('provinciaId', selecciones.provincia.toString());
                if (selecciones.municipio !== 'todos') params.set('municipioId', selecciones.municipio.toString());
                if (selecciones.zona !== 'todos') params.set('zonaId', selecciones.zona.toString());
                if (selecciones.barrio !== 'todos') params.set('barrioId', selecciones.barrio.toString());

                // 4. Empujamos a la URL combinada y cerramos el panel para ver resultados
                router.push(`/busqueda_mapa?${params.toString()}`);
                setActiveSidebarView('results');
              }}
            />
          </div>
          ) : isSidebarOpen && activeSidebarView === 'results' ? (
          // 🚀 CONTENEDOR PADRE SIN SCROLL
          <div className="flex flex-col h-full min-h-0 relative bg-stone-50">

            {/* 🚀 CABECERA (Fuera del scroll = Cero rebotes) */}
            <div className="bg-white shrink-0 border-b border-stone-200 shadow-sm transition-all duration-300">

              {/* BLOQUE 1: DESAPARECE CON EL SCROLL (Solo el título "Filtros") */}
              <div className={`px-4 transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-[60px] opacity-100 pt-4'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1">
                    <Filter className="w-4 h-4 text-orange-500" />
                    <h1 className="text-base font-semibold text-slate-800 uppercase tracking-wide">
                      Filtros
                    </h1>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-stone-100 rounded-full transition-colors text-stone-400 shrink-0"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
              </div>

              {/* BLOQUE 2: SE COMPACTA Y MANTIENE (Resultados, Conteo, Controles) */}
              <div className={`px-4 pb-3 flex flex-col transition-all duration-300 ${isScrolled ? 'pt-3 gap-2' : 'gap-3'}`}>

                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    {/* Título: Resultados de búsqueda (Se compacta de xl a base) */}
                    <h1 className={`font-semibold text-slate-900 transition-all duration-300 truncate ${isScrolled ? 'text-base' : 'text-xl'}`}>
                      {isClusterView
                        ? `${clusterProperties.length} propiedades en este clúster`
                        : 'Resultados de búsqueda'}
                    </h1>

                    {/* Subtítulo: N Propiedades (Se compacta de sm a xs) */}
                    <h2 className={`font-bold text-slate-900 transition-all duration-300 truncate flex items-center gap-2 ${isScrolled ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
                      <div>
                        <span className="text-orange-500">
                          {isClusterView ? clusterProperties.length : displayedProperties.length}
                        </span>
                        <span className="ml-1 text-gray-600 font-normal">
                          {(isClusterView
                            ? clusterProperties.length
                            : displayedProperties.length) === 1
                            ? 'propiedad encontrada'
                            : 'propiedades encontradas'}
                        </span>
                      </div>
                      {isClusterView && (
                        <button
                          onClick={() => {
                            setIsClusterView(false)
                            setClusterProperties([])
                            setActiveClusterIds([])
                          }}
                          className="text-orange-500 hover:underline text-xs"
                        >
                          (Volver)
                        </button>
                      )}
                    </h2>
                  </div>

                  {/* Si el usuario bajó, mostramos el botón de cerrar la barra aquí para no perderlo */}
                  {isScrolled && (
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 hover:bg-stone-100 rounded-full transition-colors text-stone-400 shrink-0 mt-1"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <MenuOrdenamiento
                      totalResultados={displayedProperties.length}
                      ordenActual={ordenActual}
                      onOrdenChange={cambiarOrden}
                      isCompact={isScrolled}
                    />
                  </div>

                  <div className="flex bg-stone-100 p-1 rounded-md border border-stone-200 shadow-inner scale-90 origin-right ml-2 shrink-0">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400'
                        }`}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-[#ea580c] shadow-sm' : 'text-stone-400'
                        }`}
                    >
                      <ListIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚀 LISTA (Tiene su propio scroll independiente) */}
            <div
              ref={listScrollRef as Ref<HTMLDivElement>}
              className="flex-1 overflow-y-auto custom-scrollbar p-4"
              onScroll={(e) => {
                const scrollTop = (e.target as HTMLDivElement).scrollTop;
                if (!isScrolled && scrollTop > 60) setIsScrolled(true);
                if (isScrolled && scrollTop < 10) setIsScrolled(false);
              }}
              onMouseEnter={() => setIsHoveringList(true)}
              onMouseLeave={() => {
                setIsHoveringList(false)
                setSelectedPropertyId(null)
                setHoveredId(null)
              }}
            >
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-full text-stone-400 text-sm gap-2 animate-pulse min-h-[300px]">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Actualizando resultados...
                </div>
              ) : displayedProperties.length === 0 ? (
                <EmptyState
                  titulo={
                    tieneFiltrSuperficie
                      ? 'Sin resultados por superficie'
                      : 'No hay propiedades existentes'
                  }
                  mensaje={
                    tieneFiltrSuperficie
                      ? 'No se encontraron propiedades dentro del rango de superficie seleccionado.'
                      : 'No se encontraron propiedades con los filtros seleccionados. Intenta con otra zona o categoría.'
                  }
                />
              ) : (
                <div
                  className={`gap-4 flex flex-col ${viewMode === 'list'
                    ? 'divide-y divide-gray-100 bg-white border border-gray-100 rounded-xl shadow-sm'
                    : ''
                    }`}
                >
                  {(isClusterView ? clusterProperties : paginatedProperties).map((property: any) => (
                    <div
                      key={property.id}
                      onMouseEnter={() => setHoveredId(property.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        // NUEVA LÓGICA DE INTERCEPCIÓN
                        if (isCompareMode) {
                          toggleProperty(property.id);
                        } else {
                          setSelectedPropertyId(property.id);
                        }
                      }}
                      className={`cursor-pointer transition-all duration-200 rounded-xl relative focus:outline-none focus:ring-0 focus:ring-offset-0 ${viewMode === 'grid'
                        ? 'transform scale-95 origin-top mx-auto mb-[-4%]'
                        : 'w-full py-1 hover:bg-stone-100'
                        } ${
                        // Borde naranja si está seleccionado
                        isCompareMode && selectedIds.includes(property.id)
                          ? 'ring-4 ring-orange-500 scale-[0.98] shadow-lg'
                          : ''
                        }`}
                    >
                      {viewMode === 'grid' ? (
                        <PropertyCard
                          imagen={
                            property.thumbnailUrl ||
                            property.imagen ||
                            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
                          }
                          estado={property.type}
                          precioFormateado={property.precioFormateado || 'Consultar precio'}
                          descripcion={property.descripcion || property.title}
                          ubicacionTexto={property.ubicacionTexto}
                          categoriaTexto={property.categoriaTexto}
                          accionTexto={property.accionTexto}
                          camas={property.nroCuartos ?? 0}
                          banos={property.nroBanos ?? 0}
                          metros={property.superficieM2 ?? 0}
                          onViewDetails={() => {
                            if (!isCompareMode) abrirDetallePropiedad(property.id)
                          }}
                        />
                      ) : (
                        <PropertyRow
                          title={property.title}
                          precioFormateado={property.precioFormateado || 'Consultar precio'}
                          size={`${property.nroCuartos ?? 0} Dorm. • ${property.superficieM2 ?? 0} m²`}
                          ubicacionTexto={property.ubicacionTexto}
                          categoriaTexto={property.categoriaTexto}
                          accionTexto={property.accionTexto}
                          contactType="whatsapp"
                          image={
                            property.thumbnailUrl ||
                            property.imagen ||
                            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
                          }
                          onViewDetails={() => {
                            if (!isCompareMode) abrirDetallePropiedad(property.id)
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {renderListPaginationFooter()}
            </div>
          </div>

          ) : isSidebarOpen && activeSidebarView === 'superficie' ? (
          <div className="flex flex-col h-full min-h-0 bg-white">
            <SuperficieFilterSidebar onClose={() => setActiveSidebarView('results')} />
          </div>
          ) : null}
          {/* // Footer estático para Modo Comparación (Solo aparece si el modo está activo, independiente del filtro seleccionado) */}
          {isCompareMode && (
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-stone-200 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-[100] flex justify-between items-center animate-in slide-in-from-bottom-5">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  Modo Comparación
                </span>
                <span className="text-xs text-stone-500">
                  {selectedIds.length} de 4 seleccionados
                </span>
              </div>

              <button
                disabled={selectedIds.length < 2}
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 bg-[#ea580c] text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c2410c] transition-colors shadow-md"
              >
                Listo
              </button>
            </div>
          )}
        </aside>

        {/* Área del mapa */}
        <section className="relative bg-stone-200 w-full h-[35dvh] md:flex-1 md:h-auto min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-0 top-4 z-[20] bg-white text-black shadow-md rounded-r-md flex flex-col items-center py-4 px-2 gap-4 hover:bg-stone-50 transition-colors"
            >
              <ChevronRight size={16} />
              <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold tracking-widest uppercase text-stone-600">
                Inmuebles
              </span>
              <ListIcon size={16} className="text-stone-500" />
            </button>
          )}
          {/* --- INICIO BOTONES FLOTANTES HU8 --- */}
          <div className="absolute top-3 right-4 z-[1000] flex flex-col gap-2 items-end pointer-events-none">
            {/* CAMBIO: Se removió !isPolygonClosed para que los botones sigan visibles tras dibujar */}
            {!isDrawingMode && !editingZoneId && (
              <div className="flex flex-row gap-2 pointer-events-auto">
                <button
                  onClick={() => {
                    resetDrawing() // AÑADIDO: Limpia el mapa antes de iniciar un nuevo dibujo
                    resetEditingZone()
                    setIsCreatingCustomZone(false)
                    setIsDrawingMode(true)
                    setIsSidebarOpen(true)
                  }}
                  className="bg-white text-stone-700 px-4 py-2.5 rounded-lg shadow-md border border-stone-200 hover:bg-stone-50 transition-all text-sm font-semibold"
                >
                  Dibujar zona
                </button>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push('/sign-in');
                    } else {
                      setIsMisZonasOpen(true);
                    }
                  }}
                  className="bg-white text-stone-700 px-4 py-2.5 rounded-lg shadow-md border border-stone-200 hover:bg-stone-50 transition-all text-sm font-semibold"
                >
                  Mis zonas
                </button>
              </div>
            )}

            {isDrawingMode && (
              <div className="flex flex-col items-end gap-2 pointer-events-auto">
                <div className="flex flex-row gap-2">
                  <button
                    onClick={() => {
                      if (currentPolygonPoints.length < 3) {
                        setDrawingError(true)
                        setTimeout(() => setDrawingError(false), 3000)
                      } else {
                        setDrawnPolygons((prev) => [...prev, currentPolygonPoints])
                        setCurrentPolygonPoints([])
                        setDrawingError(false)
                        setIsDrawingMode(false) // ✅ FIX: Detenemos el lápiz
                      }
                    }}
                    className="bg-[#ea580c] text-white px-4 py-2 rounded-lg shadow-md border border-orange-600 hover:bg-[#c2410c] transition-all text-sm font-semibold"
                  >
                    Finalizar dibujo
                  </button>
                  <button
                    onClick={resetDrawing}
                    className="bg-white text-red-600 px-4 py-2 rounded-lg shadow-md border border-stone-200 hover:bg-red-50 transition-all text-sm font-semibold"
                  >
                    Cancelar dibujo
                  </button>
                </div>

                {drawingError && (
                  <div className="bg-red-50 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-xs font-medium shadow-md max-w-[220px] text-right">
                    ⚠️ Debes marcar al menos 3 puntos para finalizar la zona.
                  </div>
                )}

                {!drawingError && (
                  <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md border border-stone-200 text-xs text-stone-600 max-w-[220px] text-right">
                    Haz clic en el mapa para marcar los vértices. Cierra la zona tocando el punto inicial.
                  </div>
                )}
              </div>
            )}

          </div>

          {/* CAMBIO: Se removió isCreatingCustomZone para que aparezca siempre que haya un polígono cerrado */}
          {drawnPolygons.length > 0 && !editingZoneId && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-row gap-3 pointer-events-auto">
              <button
                onClick={resetDrawing}
                className="bg-white text-stone-700 px-6 py-2.5 rounded-full shadow-lg border border-stone-200 hover:bg-stone-50 active:scale-95 transition-all text-sm font-bold tracking-wide"
              >
                Borrar dibujo
              </button>
              {/* ✅ AÑADIDO: Botón para reactivar el lápiz conscientemente */}
              {!isDrawingMode && (
                <button
                  onClick={() => setIsDrawingMode(true)}
                  className="bg-[#ea580c] text-white px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(234,88,12,0.4)] hover:bg-[#c2410c] active:scale-95 transition-all text-sm font-bold tracking-wide"
                >
                  Añadir dibujo
                </button>
              )}
            </div>
          )}
          {/* --- FIN BOTONES FLOTANTES HU8 --- */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <MapView
              properties={inmueblesOrdenados}
              selectedId={selectedPropertyId}
              searchOrigin={searchOrigin}
              onSelect={handleMapSelect}
              onClusterClick={handleClusterClick}
              onClusterDissolve={() => { setIsClusterView(false); setActiveClusterIds([]); setClusterProperties([]) }}
              activeClusterIds={activeClusterIds}
              isLoading={isLoading}
              error={error}
              zonas={zonasCombinadas}
              selectedZoneId={selectedZoneId}
              onZoneSelect={handleZoneSelect}
              onZoneCycle={handleZoneCycle}
              isDrawingMode={isDrawingMode}
              polygonPoints={currentPolygonPoints}
              isPolygonClosed={false}
              drawnPolygons={drawnPolygons}
              isZoneEditingMode={Boolean(editingZoneId)}
              editablePolygonPoints={editingPolygonPoints}
              onEditablePointDrag={(index, lat, lng) => {
                setEditingPolygonPoints((prev) =>
                  prev.map((point, pointIndex) =>
                    pointIndex === index ? [lat, lng] : point
                  )
                )
              }}
              onMapClick={(latlng) => {
                if (isDrawingMode) {
                  if (currentPolygonPoints.length >= 15) {
                    alert('Límite máximo de 15 vértices');
                    return;
                  }
                  setCurrentPolygonPoints((prev) => [...prev, [latlng.lat, latlng.lng]]);
                }
              }}
              onPointClick={(index) => {
                if (isDrawingMode && index === 0 && currentPolygonPoints.length >= 3) {
                  setDrawnPolygons((prev) => [...prev, currentPolygonPoints])
                  setCurrentPolygonPoints([])
                  setDrawingError(false)
                  setIsDrawingMode(false) // ✅ FIX: Detenemos el lápiz
                }
              }}
            />
          </div>
        </section>
        <MisZonasSidebar
          isOpen={isMisZonasOpen}
          onClose={() => setIsMisZonasOpen(false)}
          isAuthenticated={isAuthenticated} // Mapeado al estado que acabamos de crear
          zonas={zonasSidebar}
          editingZoneId={editingZoneId}
          editingZoneName={editingZoneName}
          isSavingEditZone={isSavingEditedZone}
          onEditingZoneNameChange={setEditingZoneName}
          onConfirmEditZone={saveEditedZone}
          onCancelEditZone={cancelEditZone}
          isDraftZoneVisible={isAuthenticated && isCreatingCustomZone && (currentPolygonPoints.length >= 3 || drawnPolygons.length > 0)}
          draftZoneName={newZoneName}
          isSavingDraftZone={isSavingNewZone}
          onDraftZoneNameChange={setNewZoneName}
          onConfirmDraftZone={saveDraftZone}
          onCancelDraftZone={cancelDraftZone}
          onAddZone={() => {
            setIsMisZonasOpen(true);
            resetEditingZone();
            setNewZoneName('Nueva zona');
            setIsCreatingCustomZone(true);
            setIsDrawingMode(true);
            setCurrentPolygonPoints([]);
            setDrawnPolygons([]);
            setIsSidebarOpen(false);
          }}
          onEditZone={startEditZone}
          onDeleteZone={deleteZone}
          onZoneSelect={(id) => {
            const zoneId = Number(id)
            if (Number.isNaN(zoneId)) return
            setSelectedZoneId(-zoneId)
          }}
        />
      </main>
      {/* MONTAJE DEL MODAL COMPARATIVO */}
      <ComparatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function BusquedaMapaPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-white text-gray-500 italic">
          Cargando buscador de PropBol...
        </div>
      }
    >
      <BusquedaMapaContent />
    </Suspense>
  )
}
