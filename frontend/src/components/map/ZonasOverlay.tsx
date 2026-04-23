'use client'
import { Fragment, useEffect, useState } from 'react'
import { Polygon, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { ZonaPredefinida } from '@/types/zona'

const MIN_ZOOM_LABELS = 13 // criterio 15: ocultar labels en zoom-out

function centroide(coords: [number, number][]): [number, number] {
  return [
    coords.reduce((s, c) => s + c[0], 0) / coords.length,
    coords.reduce((s, c) => s + c[1], 0) / coords.length
  ]
}

// criterio 21: ignorar coordenadas inválidas silenciosamente
function esValido(coords: unknown): coords is [number, number][] {
  if (!Array.isArray(coords) || coords.length < 3) return false
  return coords.every(
    (c) =>
      Array.isArray(c) &&
      c.length === 2 &&
      typeof c[0] === 'number' &&
      typeof c[1] === 'number' &&
      !isNaN(c[0]) &&
      !isNaN(c[1]) &&
      c[0] >= -90 &&
      c[0] <= 90 &&
      c[1] >= -180 &&
      c[1] <= 180
  )
}

// criterio 20: word-wrap; criterio 8: cursor pointer; criterio 23: tabindex + keydown→click
function labelIcon(nombre: string, isSelected: boolean): L.DivIcon {
  const color = isSelected ? '#ea580c' : '#1a1a1a'
  const shadow = isSelected
    ? '0 0 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.6)'
    : '0 1px 3px rgba(255,255,255,0.95), 0 -1px 3px rgba(255,255,255,0.95), 1px 0 3px rgba(255,255,255,0.95), -1px 0 3px rgba(255,255,255,0.95)'

  return L.divIcon({
    className: '',
    html: `<div
      tabindex="0"
      role="button"
      aria-label="Zona ${nombre}"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}"
      style="
        background: transparent;
        padding: 2px 4px;
        font-size: 11.5px;
        font-weight: 700;
        font-family: 'Nunito', 'Quicksand', 'Inter', system-ui, sans-serif;
        color: ${color};
        letter-spacing: 0.04em;
        max-width: 140px;
        text-align: center;
        word-break: break-word;
        white-space: normal;
        cursor: pointer;
        text-shadow: ${shadow};
        outline: 2px solid transparent;
        outline-offset: 2px;
        user-select: none;
      ">
      ${nombre}
    </div>`,
    iconSize: [140, 28],
    iconAnchor: [70, 14]
  })
}

interface Props {
  zonas: ZonaPredefinida[]
  selectedZoneId: number | null
  onZoneSelect: (id: number | null) => void
}

export default function ZonasOverlay({ zonas, selectedZoneId, onZoneSelect }: Props) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())

  // criterio 15: escuchar cambios de zoom
  useEffect(() => {
    const handler = () => setZoom(map.getZoom())
    map.on('zoomend', handler)
    return () => {
      map.off('zoomend', handler)
    }
  }, [map])

  return (
    <>
      {zonas
        .filter((z) => esValido(z.coordenadas))
        .map((zona) => {
          const sel = zona.id === selectedZoneId
          const c = centroide(zona.coordenadas)

          return (
            <Fragment key={zona.id}>
              {/*
              criterio 6/7: borde punteado + relleno naranja al seleccionar
              criterio 11: Polygon en overlayPane (z=400) < markerPane (z=600) → clusters encima
              criterio 14: bubblingMouseEvents no interfiere con wheel
              criterio 13: clusters en markerPane capturan click primero → no disparan zona
            */}
              <Polygon
                positions={zona.coordenadas}
                pathOptions={{
                  color: sel ? '#ea580c' : '#64748b',
                  weight: sel ? 2 : 1.8, // criterio 16
                  dashArray: sel ? '6,6' : undefined, // criterio 6
                  fillColor: sel ? '#ea580c' : '#94a3b8',
                  fillOpacity: sel ? 0.25 : 0.10, // criterio 7
                  lineJoin: 'round',
                  lineCap: 'round'
                }}
                // criterio 13/14: no capturar eventos de mapa accidentalmente
                bubblingMouseEvents={false as any}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e)
                    onZoneSelect(sel ? null : zona.id)
                  },
                  // criterio 8: cursor pointer
                  mouseover: (e) => {
                     const layer = e.target as L.Path
                     const el = layer.getElement()

                    if (el) (el as HTMLElement).style.cursor = 'pointer'

                     if (!sel) {
                      layer.setStyle({
                        weight: 3,
                        fillOpacity: 0.13
                      })
                    }
                  },

                  mouseout: (e) => {
                    const layer = e.target as L.Path

                    if (!sel) {
                       layer.setStyle({
                         weight: 1.8,
                         fillOpacity: 0.10
                       })
                    }
                  }
               }}
              />

              {/* criterio 15: ocultar labels en zoom-out */}
              {zoom >= MIN_ZOOM_LABELS && (
                <Marker
                  position={c}
                  icon={labelIcon(zona.nombre, sel)}
                  interactive
                  keyboard
                  zIndexOffset={-100} // criterio 11/12: labels bajo clusters y GPS
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e)
                      onZoneSelect(sel ? null : zona.id)
                    }
                  }}
                />
              )}
            </Fragment>
          )
        })}
    </>
  )
}
