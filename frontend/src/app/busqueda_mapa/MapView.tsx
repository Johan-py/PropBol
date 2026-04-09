"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";

import ZoomControls from "@/components/ZoomControls";
import { createGpsIcon } from "@/components/GpsPin";
import { createClusterIcon, CLUSTER_CONFIG } from "@/lib/clusterIcon";

import type { PropertyMapPin } from "@/types/property";

<<<<<<< HEAD
// Fix íconos default de Leaflet en Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
=======
// Fix íconos default de Leaflet en Next.js (guard SSR)
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
>>>>>>> b9cba58 (fix(HU2): cambios en MapView para responsive movil)
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

<<<<<<< HEAD
// soporta oficina y local
const PIN_FILL: Record<string, string> = {
  casa: '#3b82f6',
  departamento: '#8b5cf6',
  terreno: '#f59e0b',
  oficina: '#10b981',
  local: '#10b981'
}

const PIN_HALO: Record<string, string> = {
  casa: 'rgba(59,130,246,0.25)',
  departamento: 'rgba(139,92,246,0.25)',
  terreno: 'rgba(245,158,11,0.25)',
  oficina: 'rgba(16,185,129,0.25)',
  local: 'rgba(16,185,129,0.25)'
}

const PIN_LABEL: Record<string, string> = {
  casa: '#2563eb',
  departamento: '#7c3aed',
  terreno: '#d97706',
  oficina: '#059669',
  local: '#059669'
}

const SELECTED_ICONS: Record<string, string> = {
  casa: '/house.svg',
  departamento: '/department.svg',
  terreno: '/land.svg',
  oficina: '/office.svg',
  local: '/local.svg'
}

function createPinIcon(type: string): L.DivIcon {
  const fill = PIN_FILL[type] ?? '#6b7280'
  const halo = PIN_HALO[type] ?? 'rgba(107,114,128,0.25)'

  const outer = 28
  const inner = 20
  const half = outer / 2
=======
const PIN_FILL: Record<string, string> = {
  casa: "#3b82f6",
  departamento: "#8b5cf6",
  terreno: "#f59e0b",
  local: "#10b981",
};

const PIN_HALO: Record<string, string> = {
  casa: "rgba(59,  130, 246, 0.25)",
  departamento: "rgba(139, 92,  246, 0.25)",
  terreno: "rgba(245, 158, 11,  0.25)",
  local: "rgba(16,  185, 129, 0.25)",
};

const PIN_LABEL: Record<string, string> = {
  casa: "#2563eb",
  departamento: "#7c3aed",
  terreno: "#d97706",
  local: "#059669",
};

const SELECTED_ICONS: Record<string, string> = {
  casa: "/house.svg",
  departamento: "/department.svg",
  terreno: "/land.svg",
  local: "/local.svg",
};

function createPinIcon(type: string): L.DivIcon {
  const fill = PIN_FILL[type] ?? "#6b7280";
  const halo = PIN_HALO[type] ?? "rgba(107,114,128,0.25)";
  const outer = 28;
  const inner = 20;
  const half = outer / 2;
>>>>>>> b9cba58 (fix(HU2): cambios en MapView para responsive movil)

  return L.divIcon({
    className: "",
    html: `
      <div style="width:${outer}px;height:${outer}px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:${outer}px;height:${outer}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background-color:${halo};"></div>
        <div style="position:relative;width:${inner}px;height:${inner}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background-color:${fill};border:2px solid rgba(255,255,255,0.9);box-shadow:0 1px 4px rgba(0,0,0,0.20);"></div>
      </div>`,
    iconSize: [outer, outer],
    iconAnchor: [half, outer],
    popupAnchor: [0, -outer],
  });
}

<<<<<<< HEAD
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap()

  useEffect(() => {
    map.on('click', onMapClick)
    return () => map.off('click', onMapClick)
  }, [map, onMapClick])

  return null
}

function MapMouseHandler({ onMouseLeave }: { onMouseLeave: () => void }) {
  const map = useMap()

  useEffect(() => {
    map.on('mouseout', onMouseLeave)
    return () => map.off('mouseout', onMouseLeave)
  }, [map, onMouseLeave])

  return null
}

function createSelectedIcon(type: string, isHover: boolean = false): L.DivIcon {
  const iconPath = SELECTED_ICONS[type]
  const scale = isHover ? 1.8 : 1.6

=======
function createSelectedIcon(type: PropertyMapPin["type"]): L.DivIcon {
  const iconPath = SELECTED_ICONS[type];
>>>>>>> b9cba58 (fix(HU2): cambios en MapView para responsive movil)
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;align-items:center;justify-content:center;transform:scale(${scale});">
        <div style="width:36px;height:36px;border-radius:50%;background-color:#ef4444;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2px solid white;">
          <img src="${iconPath}" style="width:20px;height:20px;object-fit:contain;display:block;" />
        </div>
      </div>`,
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

// fix mobile resize
function MapResizer() {
  const map = useMap()

  useEffect(() => {
    const handler = () => map.invalidateSize({ animate: false })
    window.addEventListener('resize', handler)
    handler()
    return () => window.removeEventListener('resize', handler)
  }, [map])

  return null
}

interface MapViewProps {
  properties: PropertyMapPin[]
  center?: [number, number]
  zoom?: number
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  isLoading?: boolean
  error?: string | null
}

export default function MapView({
  properties = [],
  center = [-17.392418841841394, -66.1461583463333],
  zoom = 12,
  selectedId,
  onSelect
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null)

  useEffect(() => setIsMounted(true), [])

  if (!isMounted) return <div className="w-full h-full bg-gray-100 animate-pulse" />

  const selectedProperty = properties.find((p) => p.id === selectedId)

  return (
    <div className="relative w-full h-full">
      <MapContainer center={center} zoom={zoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapResizer />
        <ZoomControls />

        <MapMouseHandler onMouseLeave={() => setHoveredPinId(null)} />
        <MapClickHandler onMapClick={() => onSelect?.(null)} />

        {selectedProperty &&
          Number.isFinite(Number(selectedProperty.lat)) &&
          Number.isFinite(Number(selectedProperty.lng)) && (
            <FlyToSelected
              lat={Number(selectedProperty.lat)}
              lng={Number(selectedProperty.lng)}
            />
          )}

        <Marker position={center} icon={createGpsIcon()}>
          <Popup>Tu ubicación actual</Popup>
        </Marker>

        <MarkerClusterGroup
          iconCreateFunction={(cluster: any) => createClusterIcon(cluster)}
          maxClusterRadius={CLUSTER_CONFIG.maxClusterRadius}
          disableClusteringAtZoom={CLUSTER_CONFIG.disableClusteringAtZoom}
          animate
          animateAddingMarkers
          chunkedLoading
          showCoverageOnHover={false}
          polygonOptions={{ opacity: 0 }}
          zoomToBoundsOnClick
          spiderfyOnMaxZoom
          spiderfyDistanceMultiplier={2}
          removeOutsideVisibleBounds={false}
          clusterPane="markerPane"
          eventHandlers={{
            clusterclick: (e: any) => {
              e.layer.zoomToBounds({ padding: [20, 20] })
            }
          }}
        >
          {properties.map((property) => {
            const isSelected = property.id === selectedId
            const isHovered = property.id === hoveredPinId

            let icon = createPinIcon(property.type)
            if (isSelected) icon = createSelectedIcon(property.type)
            else if (isHovered) icon = createSelectedIcon(property.type, true)

            return (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                icon={icon}
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

function FlyToSelected({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    if (!lat || !lng) return

    const targetZoom = 18
    map.flyTo([lat, lng], targetZoom, { duration: 1.2 })

    const timeout = setTimeout(() => {
      map.setView([lat, lng], targetZoom)
    }, 1200)

    return () => clearTimeout(timeout)
  }, [lat, lng, map])

  return null
}