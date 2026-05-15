'use client'

import { useMap } from 'react-leaflet'
import { useEffect, useState, useCallback } from 'react'

const MIN_ZOOM = 3
const MAX_ZOOM = 18

type ZoomAction = 'in' | 'out'

export default function ZoomControls() {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  const [active, setActive] = useState<ZoomAction | null>(null)

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom())

    map.on('zoomend', handleZoom)

    return () => {
      map.off('zoomend', handleZoom)
    }
  }, [map])

  const handleZoomIn = useCallback(() => {
    if (zoom < MAX_ZOOM) {
      setActive('in')
      map.zoomIn()
      setTimeout(() => setActive(null), 300)
    }
  }, [map, zoom])

  const handleZoomOut = useCallback(() => {
    if (zoom > MIN_ZOOM) {
      setActive('out')
      map.zoomOut()
      setTimeout(() => setActive(null), 300)
    }
  }, [map, zoom])

  const isMaxZoom = zoom >= MAX_ZOOM
  const isMinZoom = zoom <= MIN_ZOOM

  const btnStyle = (type: ZoomAction, disabled: boolean) => ({
    width: '36px',
    height: '36px',
    border: 'none',
    fontSize: '22px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    backgroundColor: disabled ? '#000000' : active === type ? '#ffffff' : '#000000',
    color: disabled ? '#6b7280' : active === type ? '#000000' : '#ffffff'
  })
  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '52px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000000',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        width: '36px'
      }}
    >
      <button
        onClick={handleZoomIn}
        disabled={isMaxZoom}
        aria-label="Zoom in"
        style={btnStyle('in', isMaxZoom)}
      >
        +
      </button>

      <div style={{ height: '1px', backgroundColor: '#374151', margin: '0 6px' }} />

      <button
        onClick={handleZoomOut}
        disabled={isMinZoom}
        aria-label="Zoom out"
        style={btnStyle('out', isMinZoom)}
      >
        -
      </button>
    </div>
  )
}
