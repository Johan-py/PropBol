"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Polyline,
  Polygon,
  useMapEvents,
  useMap,
} from "react-leaflet";

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
  vertices: [number, number][];
  onVerticesChange: (v: [number, number][]) => void;
  poligonoCerrado: boolean;
  onPoligonoCerrar: () => void;
  modoDifuminadoActivo: boolean;
}

function MapControles({
  modoPinActivo,
  modoDifuminadoActivo,
}: {
  modoPinActivo: boolean;
  modoDifuminadoActivo: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor =
      modoPinActivo || modoDifuminadoActivo ? "crosshair" : "";

    if (modoDifuminadoActivo) {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }
  }, [modoPinActivo, modoDifuminadoActivo, map]);

  return null;
}

function MapEventos({
  modoPinActivo,
  modoDifuminadoActivo,
  onPinChange,
  vertices,
  onVerticesChange,
  poligonoCerrado,
}: {
  modoPinActivo: boolean;
  modoDifuminadoActivo: boolean;
  onPinChange: (coords: PinCoords) => void;
  vertices: [number, number][];
  onVerticesChange: (v: [number, number][]) => void;
  poligonoCerrado: boolean;
}) {
  useMapEvents({
    click(e) {
      if (modoPinActivo) {
        onPinChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      } else if (modoDifuminadoActivo && !poligonoCerrado) {
        onVerticesChange([...vertices, [e.latlng.lat, e.latlng.lng]]);
      }
    },
  });
  return null;
}

const COCHABAMBA: [number, number] = [-17.3895, -66.1568];

export default function MapaPinSelector({
  pinCoords,
  onPinChange,
  modoPinActivo,
  vertices,
  onVerticesChange,
  poligonoCerrado,
  onPoligonoCerrar,
  modoDifuminadoActivo,
}: Props) {
  const puedesCerrar = vertices.length >= 3 && !poligonoCerrado;

  const instruccion =
    vertices.length === 0
      ? "Haz clic para agregar el primer vértice"
      : vertices.length < 3
        ? `${vertices.length} vértice${vertices.length > 1 ? "s" : ""} — agrega al menos 3`
        : "Haz clic en el punto verde para cerrar el polígono";

  return (
    <div className="relative">
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
        <MapControles
          modoPinActivo={modoPinActivo}
          modoDifuminadoActivo={modoDifuminadoActivo}
        />
        <MapEventos
          modoPinActivo={modoPinActivo}
          modoDifuminadoActivo={modoDifuminadoActivo}
          onPinChange={onPinChange}
          vertices={vertices}
          onVerticesChange={onVerticesChange}
          poligonoCerrado={poligonoCerrado}
        />

        {/* Pin mode */}
        {pinCoords && (
  <Marker
    position={[pinCoords.lat, pinCoords.lng]}
    icon={pinIcon}
    draggable
    eventHandlers={{
      drag(e) {
        const marker = e.target as L.Marker;
        const map = (marker as any)._map;

        const bounds = map.getBounds();
        const pos = marker.getLatLng();

        const nuevaLat = Math.max(
          bounds.getSouth(),
          Math.min(bounds.getNorth(), pos.lat)
        );

        const nuevaLng = Math.max(
          bounds.getWest(),
          Math.min(bounds.getEast(), pos.lng)
        );

        marker.setLatLng([nuevaLat, nuevaLng]);
      },

      dragend(e) {
        const pos = (e.target as L.Marker).getLatLng();

        onPinChange({
          lat: pos.lat,
          lng: pos.lng,
        });
      },
    }}
  />
)}

        {/* Difuminado — polígono en construcción */}
        {modoDifuminadoActivo && vertices.length > 0 && !poligonoCerrado && (
          <>
            {vertices.length >= 2 && (
              <Polyline
                positions={vertices}
                pathOptions={{ color: "#f97316", weight: 2, dashArray: "5,5" }}
              />
            )}

            {/* Primer vértice — verde cuando se puede cerrar */}
            <CircleMarker
              center={vertices[0]}
              radius={8}
              pathOptions={{
                color: puedesCerrar ? "#22c55e" : "#f97316",
                fillColor: puedesCerrar ? "#22c55e" : "#f97316",
                fillOpacity: 1,
              }}
              eventHandlers={{
                click(e) {
                  (e as any).originalEvent?.stopPropagation();
                  if (puedesCerrar) onPoligonoCerrar();
                },
              }}
            />

            {/* Vértices intermedios */}
            {vertices.slice(1).map((v, i) => (
              <CircleMarker
                key={i + 1}
                center={v}
                radius={5}
                pathOptions={{
                  color: "#f97316",
                  fillColor: "#f97316",
                  fillOpacity: 1,
                }}
              />
            ))}
          </>
        )}

        {/* Polígono cerrado */}
        {poligonoCerrado && vertices.length >= 3 && (
          <Polygon
            positions={vertices}
            pathOptions={{
              color: "#f97316",
              fillColor: "#f97316",
              fillOpacity: 0.3,
              weight: 2,
            }}
          />
        )}
      </MapContainer>

      {/* Instrucciones */}
      {modoDifuminadoActivo && !poligonoCerrado && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none z-[1000] whitespace-nowrap">
          {instruccion}
        </div>
      )}
    </div>
  );
}
