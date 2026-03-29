"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

import ZoomControls from "@/components/ZoomControls";
import { createGpsIcon } from "@/components/GpsPin";
import { createClusterIcon, CLUSTER_CONFIG } from "@/lib/clusterIcon";

import type { PropertyMapPin } from "@/data/properties";

// Fix Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

//COLOR SEGÚN TIPO
function getColorByType(type: string) {
  switch (type) {
    case "casa":
      return "#3b82f6";
    case "departamento":
      return "#10b981";
    case "terreno":
      return "#f59e0b";
    case "local":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

//PIN estilo portal
function createPinIcon(
  property: PropertyMapPin,
  isSelected: boolean,
): L.DivIcon {
  const color = getColorByType(property.type);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${isSelected ? color : "white"};
        color:${isSelected ? "white" : color};
        padding:4px 8px;
        border-radius:12px;
        font-size:12px;
        font-weight:bold;
        border:2px solid ${color};
        box-shadow:0 2px 6px rgba(0,0,0,0.2);
      ">
        $${property.price.toLocaleString()}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });
}

//Centrar mapa
function FlyToSelected({ property }: { property?: PropertyMapPin }) {
  const map = useMap();

  useEffect(() => {
    if (property) {
      map.flyTo([property.lat, property.lng], 15, { duration: 1.5 });
    }
  }, [property, map]);

  return null;
}

interface MapViewProps {
  properties: PropertyMapPin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export default function MapView({
  properties,
  selectedId,
  onSelect,
}: MapViewProps) {
  const center: [number, number] = [-17.39, -66.15];

  return (
    <div className="w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ZoomControls />

        <FlyToSelected property={properties.find((p) => p.id === selectedId)} />

        <Marker position={center} icon={createGpsIcon()}>
          <Popup>Tu ubicación</Popup>
        </Marker>

        <MarkerClusterGroup
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={CLUSTER_CONFIG.maxClusterRadius}
        >
          {properties.map((property) => {
            const isSelected = property.id === selectedId;

            return (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                icon={createPinIcon(property, isSelected)}
                eventHandlers={{
                  click: () => onSelect?.(property.id),
                }}
              >
                <Popup>
                  <b>{property.title}</b>
                  <br />${property.price.toLocaleString()} USD
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
