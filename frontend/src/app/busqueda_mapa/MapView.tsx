'use client'

//import 'leaflet/dist/leaflet.css'
//import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css' // MAPAS HU11
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  CircleMarker,
  Circle
} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'

import ZoomControls from '@/components/ZoomControls'
import { createGpsIcon, createSearchOriginIcon } from '@/components/GpsPin'
import { createClusterIcon, CLUSTER_CONFIG } from '@/lib/clusterIcon'
import ZonasOverlay from '@/components/map/ZonasOverlay'

import type { PropertyMapPin } from '@/types/property'
import type { ZonaPredefinida } from '@/types/zona'

// Fix íconos default de Leaflet en Next.js (guard SSR)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  })
  //Agregamos el plugin de gesture handling para moviles MAPAS HU11
  const { GestureHandling } = require('leaflet-gesture-handling')
  L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
}

const PIN_FILL: Record<PropertyMapPin['type'], string> = {
  casa: '#3b82f6',
  departamento: '#8b5cf6',
  terreno: '#f59e0b',
  oficina: '#10b981',
  cuarto: '#ec4899',
  cementerio: '#64748b',
  espacios: '#06b6d4'
}

const PIN_HALO: Record<PropertyMapPin['type'], string> = {
  casa: 'rgba(59,  130, 246, 0.25)',
  departamento: 'rgba(139, 92,  246, 0.25)',
  terreno: 'rgba(245, 158, 11,  0.25)',
  oficina: 'rgba(16,  185, 129, 0.25)',
  cuarto: 'rgba(236, 72,  153, 0.25)',
  cementerio: 'rgba(100, 116, 139, 0.25)',
  espacios: 'rgba(6,   182, 212, 0.25)'
}

// Color sólido para el texto del precio en el popup
const PIN_LABEL: Record<PropertyMapPin['type'], string> = {
  casa: '#2563eb',
  departamento: '#7c3aed',
  terreno: '#d97706',
  oficina: '#059669',
  cuarto: '#db2777',
  cementerio: '#475569',
  espacios: '#0891b2'
}

const SELECTED_ICONS: Record<PropertyMapPin['type'], string> = {
  casa: '/house.svg',
  departamento: '/department.svg',
  terreno: '/land.svg',
  oficina: '/office.svg',
  cuarto: '/house.svg',
  cementerio: '/land.svg',
  espacios: '/office.svg'
}

function createPinIcon(type: PropertyMapPin['type']): L.DivIcon {
  const fill = PIN_FILL[type] ?? '#6b7280'
  const halo = PIN_HALO[type] ?? 'rgba(107,114,128,0.25)'

  const outer = 28
  const inner = 20
  const half = outer / 2

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${outer}px;
        height: ${outer}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Halo -->
        <div style="
          position: absolute;
          width: ${outer}px;
          height: ${outer}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background-color: ${halo};
        "></div>
        <!-- Gota sólida -->
        <div style="
          position: relative;
          width: ${inner}px;
          height: ${inner}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background-color: ${fill};
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 1px 4px rgba(0,0,0,0.20);
        "></div>
      </div>
    `,
    iconSize: [outer, outer],
    iconAnchor: [half, outer],
    popupAnchor: [0, -outer]
  })
}

function MapClickHandler({ onMapClick, isDrawingMode }: {
  onMapClick: (latlng: L.LatLng) => void
  isDrawingMode: boolean
}) {
  const map = useMap()

  // AÑADIDO: Control nativo del cursor y bloqueo de arrastre (Criterios 2 y 20)
  useEffect(() => {
    if (isDrawingMode) {
      map.dragging.disable() // Bloquea el movimiento del mapa
      map.getContainer().style.cursor = 'crosshair' // Fuerza la cruz
    } else {
      map.dragging.enable() // Restaura el movimiento
      map.getContainer().style.cursor = '' // Restaura la manito
    }
  }, [isDrawingMode, map])

useEffect(() => {
  const handleClick = (e: L.LeafletMouseEvent) => {
    onMapClick(e.latlng)
  }
  map.on('click', handleClick)

  return () => {
    map.off('click', handleClick)
  }
}, [map, onMapClick])

return null
}

function MapMouseHandler({ onMouseLeave }: { onMouseLeave: () => void }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const handleMouseOut = () => {
      onMouseLeave()
    }

    map.on('mouseout', handleMouseOut)

    return () => {
      map.off('mouseout', handleMouseOut)
    }
  }, [map, onMouseLeave])

  return null
}

function createSelectedIcon(type: PropertyMapPin['type'], isHover: boolean = false): L.DivIcon {
  const iconPath = SELECTED_ICONS[type]
  const scale = isHover ? 1.8 : 1.6
  const shadowIntensity = isHover ? '0 6px 16px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.35)'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(${scale});
        transition: all 0.15s ease;
      ">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: ${shadowIntensity};
          border: 2px solid white;
        ">
          <img 
            src="${iconPath}" 
            style="
              width:20px;
              height:20px;
              object-fit: contain;
              display: block;
            " 
          />
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  })
}

function formatPrice(price: number, currency: 'USD' | 'BOB'): string {
  return currency === 'USD'
    ? `$${price.toLocaleString('es-BO')} USD`
    : `Bs ${price.toLocaleString('es-BO')}`
}

interface MapViewProps {
  properties: PropertyMapPin[]
  searchOrigin?: [number, number] | null
  zonas?: ZonaPredefinida[]
  selectedZoneId?: number | null
  onZoneSelect?: (id: number | null) => void
  onZoneCycle?: (direction: 1 | -1) => void
  center?: [number, number]
  zoom?: number
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  onClusterClick?: (properties: PropertyMapPin[]) => void
  activeClusterIds?: string[]
  isDrawingMode?: boolean
   polygonPoints?: [number, number][]
  isPolygonClosed?: boolean
  drawnPolygons?: [number, number][][]
  isZoneEditingMode?: boolean
  editablePolygonPoints?: [number, number][]
  onEditablePointDrag?: (index: number, lat: number, lng: number) => void
  onMapClick?: (latlng: L.LatLng) => void
  onPointClick?: (index: number) => void
  isLoading?: boolean
  error?: string | null
  onClusterDissolve?: () => void
}

const vertexHandleIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 12px;
      height: 12px;
      border-radius: 9999px;
      background: #ffffff;
      border: 2px solid #ea580c;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
})
function ZoomHandler({ onClusterDissolve }: { onClusterDissolve?: () => void }) {
  const map = useMap()
  useEffect(() => {
    const handler = () => onClusterDissolve?.()
    map.on('zoomend', handler)
    return () => { map.off('zoomend', handler) }
  }, [map, onClusterDissolve])
  return null
}

export default function MapView({
  properties = [],
  searchOrigin = null,
  center = [-17.392418841841394, -66.1461583463333],
  zoom = 12,
  selectedId,
  onSelect,
  onClusterClick,
  activeClusterIds = [],
  isLoading = false,
  error = null,
  isDrawingMode = false,
  polygonPoints = [],
  isPolygonClosed = false,
  drawnPolygons = [],
  isZoneEditingMode = false,
  editablePolygonPoints = [],
  onEditablePointDrag,
  onMapClick,
  onPointClick,
  zonas = [],
  selectedZoneId = null,
  onClusterDissolve,
  onZoneSelect,
  onZoneCycle
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null)
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({})

  useEffect(() => {
    // Cerrar popup del marker anterior
    Object.entries(markerRefs.current).forEach(([id, marker]) => {
      if (marker && id !== hoveredPinId && marker.isPopupOpen()) {
        marker.closePopup()
      }
    })

    // Abrir popup del marker en hover
    if (hoveredPinId && markerRefs.current[hoveredPinId]) {
      markerRefs.current[hoveredPinId]?.openPopup()
    }
  }, [hoveredPinId])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Evita hydration mismatch: renderiza skeleton hasta que el cliente monte
  if (!isMounted) return <div className="w-full h-full bg-gray-100 animate-pulse" />

  const selectedProperty = properties.find((p) => p.id === selectedId)

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow text-sm text-gray-600 flex items-center gap-2 pointer-events-none">
          <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full" />
          Cargando propiedades...
        </div>
      )}

      {error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 px-4 py-2 rounded-full shadow text-sm text-red-600 pointer-events-none">
          ⚠️ {error}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        touchZoom={true}
        dragging={true}
        style={{ height: '100%', width: '100%' }}
        className={`z-0 ${isDrawingMode && !isPolygonClosed ? '[&.leaflet-container]:cursor-crosshair [&_.leaflet-interactive]:cursor-crosshair' : ''}`}
        // Agregado: Control nativo del cursor y bloqueo de arrastre en modo dibujo MAPAS HU11
        {...({ 
          gestureHandling: true,
          gestureHandlingOptions: {
            text: {
              touch: "Usa dos dedos para mover el mapa",
              scroll: "Usa ctrl + scroll para hacer zoom en el mapa",
              scrollMac: "Usa \u2318 + scroll para hacer zoom en el mapa"
            }
          }
        } as any)} //FIN AGREGADO MAPAS HU11
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControls />
        <FlyToOrigin origin={searchOrigin} />
        <ZoomHandler onClusterDissolve={onClusterDissolve} />
        <MapMouseHandler onMouseLeave={() => setHoveredPinId(null)} />
        <MapClickHandler
          onMapClick={(latlng) => {
            if (isDrawingMode && onMapClick) {
              onMapClick(latlng)
            } else if (!isDrawingMode && !isZoneEditingMode) {
              onSelect?.(null)
              onZoneSelect?.(null) // criterio 10: clic neutral desactiva zona
            }
          }}
          isDrawingMode={isDrawingMode}
        />

        <ZonasOverlay
          zonas={zonas}
          selectedZoneId={selectedZoneId}
          onZoneSelect={onZoneSelect ?? (() => {})}
          onZoneCycle={onZoneCycle}
        />

        {/* --- INICIO CÓDIGO HU8 --- */}
        {polygonPoints && polygonPoints.length > 0 && !isPolygonClosed && (
          <>
            <Polyline
              positions={polygonPoints}
              pathOptions={{ color: '#ea580c', weight: 3, dashArray: '5, 10' }}
            />
            {polygonPoints.map((pt, index) => (
              <CircleMarker
                key={index}
                center={pt}
                radius={5}
                pathOptions={{
                  color: index === 0 ? '#ef4444' : '#ea580c',
                  fillColor: 'white',
                  fillOpacity: 1
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e)
                    if (onPointClick) onPointClick(index)
                  }
                }}
              />
            ))}
          </>
        )}

        {isPolygonClosed && polygonPoints && polygonPoints.length >= 3 && (
          <Polygon
            positions={polygonPoints}
            pathOptions={{
              color: '#ea580c',
              fillColor: '#ea580c',
              fillOpacity: 0.2,
              weight: 2
            }}
          />
        )}

        {isZoneEditingMode && editablePolygonPoints.length >= 3 && (
          <>
            <Polygon
              positions={editablePolygonPoints}
              pathOptions={{
                color: '#ea580c',
                fillColor: '#ea580c',
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '6, 6'
              }}
            />
            {editablePolygonPoints.map((point, index) => (
              <Marker
                key={`editable-point-${index}`}
                position={point}
                draggable
                icon={vertexHandleIcon}
                eventHandlers={{
                  dragend: (event) => {
                    const latlng = event.target.getLatLng()
                    onEditablePointDrag?.(index, latlng.lat, latlng.lng)
                  }
                }}
              />
            ))}
          </>
        )}
        {/* --- FIN CÓDIGO HU8 --- */}
        {/* --- POLÍGONOS CERRADOS ACUMULADOS --- */}
        {drawnPolygons.map((poly, i) => (
          <Polygon
            key={`drawn-${i}`}
            positions={poly}
            pathOptions={{
              color: '#ea580c',
              fillColor: '#ea580c',
              fillOpacity: 0.15,
              weight: 2
            }}
          />
        ))}
        {/* --- FIN CÓDIGO HU8 --- */}
        
        {selectedProperty && (
          <FlyToSelected
            id={selectedProperty.id}
            lat={selectedProperty.lat}
            lng={selectedProperty.lng}
          />
        )}

        <Marker position={center} icon={createGpsIcon()}>
          <Popup>Tu ubicación actual</Popup>
        </Marker>

        {/* NUEVO: Marcador de Origen y Círculo de Radio */}
        {searchOrigin && (
          <>
            <Circle 
              center={searchOrigin} 
              radius={1000} // 1000 metros = 1km
              pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.12, weight: 2, dashArray: '5, 5' }} 
            />
            <Marker position={searchOrigin} icon={createSearchOriginIcon()} zIndexOffset={1000}>
              <Popup>
                <div className="text-center min-w-[120px]">
                  <p className="font-bold text-blue-600 mb-1">Centro de búsqueda</p>
                  <p className="text-xs text-stone-500">Mostrando radio de 1km</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        <MarkerClusterGroup
          key={activeClusterIds.join(',')}
          iconCreateFunction={(cluster: any) => {
            const markers = cluster.getAllChildMarkers()
            const ids = markers.map((m: any) => String(m.options.alt ?? '')).filter(Boolean)
            const isActive = ids.some((id: string) => activeClusterIds.includes(id))
            return createClusterIcon(cluster, isActive)
          }}
          maxClusterRadius={CLUSTER_CONFIG.maxClusterRadius}
          disableClusteringAtZoom={CLUSTER_CONFIG.disableClusteringAtZoom}
          animate={false}
          preferCanvas={true}
          animateAddingMarkers={false}
          chunkedLoading={true}
          tap={true}
          tapTolerance={15}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={false}
          spiderfyOnMaxZoom={false}
          spiderfyDistanceMultiplier={2}
          removeOutsideVisibleBounds={false}
          clusterPane="markerPane"
          eventHandlers={{
            clusterclick: (cluster: any) => {
              const markers = cluster.layer.getAllChildMarkers()
              const ids = markers.map((m: any) => m.options.alt).filter(Boolean)
              const props = properties.filter((p) => ids.includes(p.id))
              onClusterClick?.(props)
            }
          }}
        >
          {properties.map((property) => {
            const isSelected = property.id === selectedId
            const isHovered = property.id === hoveredPinId

            // Prioridad: selected > hovered > normal
            let icon
            if (isSelected) {
              icon = createSelectedIcon(property.type, false)
            } else if (isHovered) {
              icon = createSelectedIcon(property.type, true) // Hover usa mismo estilo pero más grande
            } else {
              icon = createPinIcon(property.type)
            }
            return (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                alt={property.id}
                icon={icon}
                ref={(el) => {
                  if (el) markerRefs.current[property.id] = el
                }}
                eventHandlers={{
                  click: () => onSelect?.(property.id),
                  mouseover: () => setHoveredPinId(property.id),
                  mouseout: () => setHoveredPinId(null)
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <p className="font-semibold text-gray-800 mb-1">{property.title}</p>
                    <p className="font-bold" style={{ color: PIN_LABEL[property.type] }}>
                      {formatPrice(property.price, property.currency)}
                    </p>
                    <p className="text-gray-500 capitalize mt-1">{property.type}</p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}

function FlyToSelected({ lat, lng, id }: { lat: number; lng: number; id: string }) {
  const map = useMap()
  const [lastId, setLastId] = useState<string | null>(null)

  useEffect(() => {
    if (!lat || !lng || lastId === id) return

    const currentCenter = map.getCenter()
    const distance = currentCenter.distanceTo([lat, lng])

    const targetZoom = 16
    const isFar = distance > 1000

    if (isFar) {
      map.flyTo([lat, lng], targetZoom, {
        duration: 0.8,
        easeLinearity: 0.25
      })
    } else {
      map.setView([lat, lng], targetZoom)
    }

    setLastId(id)
  }, [lat, lng, id, map, lastId])

  return null
}
// NUEVO: Componente para volar al punto de búsqueda
function FlyToOrigin({ origin }: { origin: [number, number] | null }) {
  const map = useMap()
  
  // Extraemos las coordenadas como números primitivos para el array de dependencias
  const lat = origin?.[0]
  const lng = origin?.[1]

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      // Solo volamos si la latitud o longitud REALMENTE cambian en la URL
      map.flyTo([lat, lng], 15, { duration: 1.2, easeLinearity: 0.25 })
    }
  }, [lat, lng, map]) 

  return null
}
