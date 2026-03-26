'use client';
import { useState } from 'react';
import L from 'leaflet';

interface Props {
  map: L.Map | null;
  minZoom: number;
  maxZoom: number;
}

export default function ZoomControls({ map, minZoom, maxZoom }: Props) {
  const [active, setActive] = useState<'in' | 'out' | null>(null);

  const zoom = map?.getZoom() ?? 13;

  const handleZoomIn = () => {
    if (!map || zoom >= maxZoom) return;
    setActive('in');
    map.zoomIn();
    setTimeout(() => setActive(null), 300);
  };

  const handleZoomOut = () => {
    if (!map || zoom <= minZoom) return;
    setActive('out');
    map.zoomOut();
    setTimeout(() => setActive(null), 300);
  };

  const btnStyle = (type: 'in' | 'out', disabled: boolean) => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 22,
    fontWeight: 700,
    backgroundColor: active === type ? '#F97316' : disabled ? '#d1d5db' : '#ffffff',
    color: disabled ? '#9ca3af' : '#374151',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  });

  return (
    <div style={{ position: 'absolute', bottom: 32, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button style={btnStyle('in', zoom >= maxZoom)} onClick={handleZoomIn}>+</button>
      <button style={btnStyle('out', zoom <= minZoom)} onClick={handleZoomOut}>−</button>
    </div>
  );
}