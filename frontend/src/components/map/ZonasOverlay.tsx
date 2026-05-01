'use client'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Polygon, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { ZonaPredefinida } from '@/types/zona'

const MIN_ZOOM_LABELS = 13
const MAX_LABEL_CHARS = 32
const MAX_LABEL_CHARS_SELECTED = 44

function cerrarAnillo(coords: [number, number][]): [number, number][] {
  if (coords.length < 2) return coords

  const [firstLat, firstLng] = coords[0]
  const [lastLat, lastLng] = coords[coords.length - 1]

  if (firstLat === lastLat && firstLng === lastLng) {
    return coords
  }

  return [...coords, coords[0]]
}

function centroide(coords: [number, number][]): [number, number] {
  const ring = cerrarAnillo(coords)

  if (ring.length < 4) {
    return [
      coords.reduce((s, c) => s + c[0], 0) / coords.length,
      coords.reduce((s, c) => s + c[1], 0) / coords.length
    ]
  }

  let areaFactor = 0
  let centroidLat = 0
  let centroidLng = 0

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [lat1, lng1] = ring[index]
    const [lat2, lng2] = ring[index + 1]
    const cross = lng1 * lat2 - lng2 * lat1

    areaFactor += cross
    centroidLat += (lat1 + lat2) * cross
    centroidLng += (lng1 + lng2) * cross
  }

  if (Math.abs(areaFactor) < 1e-8) {
    return [
      coords.reduce((s, c) => s + c[0], 0) / coords.length,
      coords.reduce((s, c) => s + c[1], 0) / coords.length
    ]
  }

  const area = areaFactor * 0.5

  return [centroidLat / (6 * area), centroidLng / (6 * area)]
}

function dimensionarEtiqueta(
  nombre: string,
  zoom: number,
  isSelected: boolean
): {
  width: number
  height: number
  fontSize: number
  lineHeight: number
  paddingX: number
  paddingY: number
  maxCharsPorLinea: number
  lineas: number
} {
  const zoomFactor = Math.max(0, Math.min(1, (zoom - MIN_ZOOM_LABELS) / 5))
  const selectedBoost = isSelected ? 0.12 : 0
  const scale = Math.max(0.72, Math.min(1.15, 0.78 + zoomFactor * 0.37 + selectedBoost))

  const fontSize = Math.round((11.5 * scale) * 10) / 10
  const lineHeight = Math.round((fontSize * 1.18) * 10) / 10
  const paddingX = Math.round((8 * scale) * 10) / 10
  const paddingY = Math.round((4 * scale) * 10) / 10

  const maxCharsPorLineaBase = Math.max(8, Math.round(13 * scale))
  const maxCharsPorLinea = isSelected ? maxCharsPorLineaBase + 2 : maxCharsPorLineaBase
  const lineasTexto = construirLineasEtiqueta(nombre, maxCharsPorLinea)
  const lineas = lineasTexto.length
  const largoLineaMasLarga = lineasTexto.reduce((max, linea) => Math.max(max, linea.length), 0)
  const widthMin = Math.round(84 * scale)
  const widthMax = Math.round(142 * scale)
  const widthObjetivo = Math.round(largoLineaMasLarga * (fontSize * 0.62) + paddingX * 2 + 12)
  const width = Math.min(widthMax, Math.max(widthMin, widthObjetivo))
  const height = Math.max(
    Math.round(28 * scale),
    Math.round(lineas * lineHeight + paddingY * 2 + 4)
  )

  return { width, height, fontSize, lineHeight, paddingX, paddingY, maxCharsPorLinea, lineas }
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncarNombreEtiqueta(nombre: string, maxChars: number): string {
  const texto = nombre.replace(/\s+/g, ' ').trim()
  if (texto.length <= maxChars) return texto

  const limite = Math.max(4, maxChars - 3)
  return `${texto.slice(0, limite).trimEnd()}...`
}

function construirLineasEtiqueta(nombre: string, maxCharsPorLinea: number): string[] {
  const texto = nombre.replace(/\s+/g, ' ').trim()
  if (!texto) return ['']

  const palabras = texto.split(' ')
  const lineas: string[] = []
  let actual = ''

  for (const palabra of palabras) {
    const candidata = actual ? `${actual} ${palabra}` : palabra
    if (candidata.length <= maxCharsPorLinea) {
      actual = candidata
      continue
    }

    if (actual) {
      lineas.push(actual)
      actual = palabra
      continue
    }

    // Si una sola palabra es muy larga, se trocea para evitar desborde.
    let resto = palabra
    while (resto.length > maxCharsPorLinea) {
      lineas.push(resto.slice(0, maxCharsPorLinea))
      resto = resto.slice(maxCharsPorLinea)
    }
    actual = resto
  }

  if (actual) lineas.push(actual)
  return lineas.length ? lineas : ['']
}

function htmlEtiquetaConWrap(nombre: string, maxCharsPorLinea: number): string {
  const lineas = construirLineasEtiqueta(nombre, maxCharsPorLinea)
  return lineas.map((linea) => escaparHtml(linea)).join('<br/>')
}

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
function labelIcon(nombre: string, isSelected: boolean, zoom: number): L.DivIcon {
  const maxChars = isSelected ? MAX_LABEL_CHARS_SELECTED : MAX_LABEL_CHARS
  const nombreVisible = truncarNombreEtiqueta(nombre, maxChars)
  const {
    width,
    height,
    fontSize,
    lineHeight,
    paddingX,
    paddingY,
    maxCharsPorLinea
  } = dimensionarEtiqueta(nombreVisible, zoom, isSelected)
  const textoHtml = htmlEtiquetaConWrap(nombreVisible, maxCharsPorLinea)
  const nombreCompletoEscapado = escaparHtml(nombre)
  const color = isSelected ? '#ea580c' : '#1a1a1a'
  const shadow = isSelected
    ? '0 0 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.6)'
    : '0 1px 3px rgba(255,255,255,0.95), 0 -1px 3px rgba(255,255,255,0.95), 1px 0 3px rgba(255,255,255,0.95), -1px 0 3px rgba(255,255,255,0.95)'

  return L.divIcon({
    className: '',
    html: `<div
      aria-hidden="true"
      style="
        background: transparent;
        padding: ${paddingY}px ${paddingX}px;
        font-size: ${fontSize}px;
        line-height: ${lineHeight}px;
        font-weight: 700;
        font-family: 'Nunito', 'Quicksand', 'Inter', system-ui, sans-serif;
        color: ${color};
        letter-spacing: 0.04em;
        width: ${width}px;
        max-width: ${width}px;
        min-height: ${height}px;
        text-align: center;
        overflow: hidden;
        overflow-wrap: anywhere;
        word-break: break-word;
        hyphens: auto;
        white-space: normal;
        cursor: pointer;
        text-shadow: ${shadow};
        outline: 2px solid transparent;
        outline-offset: 2px;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
      <span title="${nombreCompletoEscapado}" aria-label="${nombreCompletoEscapado}" style="display:block;max-width:100%;white-space:normal;overflow-wrap:anywhere;word-break:break-word;">
        ${textoHtml}
      </span>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [Math.round(width / 2), Math.round(height / 2)]
  })
}

function ZonaInteractiva({
  zona,
  selected,
  zoom,
  onZoneSelect,
  onZoneCycle,
}: {
  zona: ZonaPredefinida
  selected: boolean
  zoom: number
  onZoneSelect: (id: number | null) => void
  onZoneCycle?: (direction: 1 | -1) => void
}) {
  const polygonRef = useRef<L.Polygon | null>(null)
  const center = centroide(zona.coordenadas)

  useEffect(() => {
    const element = polygonRef.current?.getElement() as SVGPathElement | null
    if (!element) return

    element.setAttribute('tabindex', '0')
    element.setAttribute('role', 'button')
    element.setAttribute('aria-label', `Zona ${zona.nombre}`)
    element.setAttribute('aria-pressed', String(selected))
    element.style.cursor = 'pointer'
    element.style.outline = 'none'
    element.style.boxShadow = 'none'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (!onZoneCycle) return
        event.preventDefault()
        onZoneCycle(event.shiftKey ? -1 : 1)
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onZoneSelect(selected ? null : zona.id)
      }
    }

    element.addEventListener('keydown', handleKeyDown)

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [selected, zona.nombre])

  useEffect(() => {
    if (!selected) return

    const element = polygonRef.current?.getElement() as SVGPathElement | null
    if (!element) return

    requestAnimationFrame(() => {
      element.focus({ preventScroll: true })
    })
  }, [selected])

  return (
    <Fragment>
      <Polygon
        ref={polygonRef}
        positions={zona.coordenadas}
        pathOptions={{
          color: selected ? '#ea580c' : '#64748b',
          weight: selected ? 2 : 1.8,
          dashArray: selected ? '6,6' : undefined,
          fillColor: selected ? '#ea580c' : '#94a3b8',
          fillOpacity: selected ? 0.25 : 0.10,
          lineJoin: 'round',
          lineCap: 'round'
        }}
        bubblingMouseEvents={false as any}
        eventHandlers={{
          add: () => {
            const element = polygonRef.current?.getElement() as SVGPathElement | null
            if (!element) return

            element.setAttribute('tabindex', '0')
            element.setAttribute('role', 'button')
            element.setAttribute('aria-label', `Zona ${zona.nombre}`)
            element.setAttribute('aria-pressed', String(selected))
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e)
            const element = polygonRef.current?.getElement() as SVGPathElement | null
            element?.focus({ preventScroll: true })
            onZoneSelect(selected ? null : zona.id)
          },
          mouseover: (e) => {
            const layer = e.target as L.Path
            const el = layer.getElement()

            if (el) (el as HTMLElement).style.cursor = 'pointer'

            if (!selected) {
              layer.setStyle({
                weight: 3,
                fillOpacity: 0.13
              })
            }
          },
          mouseout: (e) => {
            const layer = e.target as L.Path

            if (!selected) {
              layer.setStyle({
                weight: 1.8,
                fillOpacity: 0.10
              })
            }
          }
        }}
      />

      {(zoom >= MIN_ZOOM_LABELS || selected) && (
        <Marker
          position={center}
          icon={labelIcon(zona.nombre, selected, zoom)}
          interactive
          keyboard={false}
          zIndexOffset={-100}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e)
              onZoneSelect(selected ? null : zona.id)
            }
          }}
        />
      )}
    </Fragment>
  )
}

interface Props {
  zonas: ZonaPredefinida[]
  selectedZoneId: number | null
  onZoneSelect: (id: number | null) => void
  onZoneCycle?: (direction: 1 | -1) => void
}

export default function ZonasOverlay({ zonas, selectedZoneId, onZoneSelect, onZoneCycle }: Props) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
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

          return (
            <ZonaInteractiva
              key={zona.id}
              zona={zona}
              selected={sel}
              zoom={zoom}
              onZoneSelect={onZoneSelect}
              onZoneCycle={onZoneCycle}
            />
          )
        })}
    </>
  )
}
