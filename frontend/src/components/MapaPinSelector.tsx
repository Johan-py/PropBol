"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
}

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:20px;height:20px;
    background:#f97316;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:2px solid white;
    box-shadow:0 2px 5px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

interface PinCoords {
  lat: number;
  lng: number;
}

interface Props {
  pinCoords: PinCoords | null;
  onPinChange: (coords: PinCoords) => void;
  modoPinActivo: boolean;
}

function MapEventos({
  modoPinActivo,
  onPinChange,
}: {
  modoPinActivo: boolean;
  onPinChange: (coords: PinCoords) => void;
}) {
  const map = useMapEvents({
    click(e) {
      if (modoPinActivo) {
        onPinChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = modoPinActivo ? "crosshair" : "";
  }, [modoPinActivo, map]);

  return null;
}

const COCHABAMBA: [number, number] = [-17.3895, -66.1568];

export default function MapaPinSelector({
  pinCoords,
  onPinChange,
  modoPinActivo,
}: Props) {
  return (
    <MapContainer
      center={COCHABAMBA}
      zoom={14}
      style={{ height: "220px", width: "100%", borderRadius: "12px" }}
      zoomControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapEventos modoPinActivo={modoPinActivo} onPinChange={onPinChange} />
      {pinCoords && (
        <Marker
          position={[pinCoords.lat, pinCoords.lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const pos = (e.target as L.Marker).getLatLng();
              onPinChange({ lat: pos.lat, lng: pos.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
