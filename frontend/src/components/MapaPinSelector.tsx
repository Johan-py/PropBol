"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

const pinIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
      background: #f97316;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    ">
      <div style="
        position: absolute;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        top: 6px;
        left: 6px;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

type Props = {
  pinCoords: { lat: number; lng: number } | null;
  setPinCoords: (v: { lat: number; lng: number } | null) => void;

  vertices: [number, number][];
  setVertices: (v: [number, number][]) => void;

  modoPinActivo: boolean;
  modoDifuminadoActivo: boolean;
};

function EventosMapa({
  modoPinActivo,
  modoDifuminadoActivo,
  setPinCoords,
  vertices,
  setVertices,
}: any) {
  useMapEvents({
    click(e) {
      if (modoPinActivo) {
        setPinCoords({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      }

      if (modoDifuminadoActivo) {
        setVertices([...vertices, [e.latlng.lat, e.latlng.lng]]);
      }
    },
  });

  return null;
}

export default function MapaPinSelector({
  pinCoords,
  setPinCoords,
  vertices,
  setVertices,
  modoPinActivo,
  modoDifuminadoActivo,
}: Props) {
  return (
    <MapContainer
      center={[-17.3895, -66.1568]}
      zoom={13}
      scrollWheelZoom
      style={{ height: "320px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <EventosMapa
        modoPinActivo={modoPinActivo}
        modoDifuminadoActivo={modoDifuminadoActivo}
        setPinCoords={setPinCoords}
        vertices={vertices}
        setVertices={setVertices}
      />

      {pinCoords && (
        <Marker position={[pinCoords.lat, pinCoords.lng]} icon={pinIcon} />
      )}

      {vertices.length >= 3 && (
        <Polygon
          positions={vertices}
          pathOptions={{
            color: "#f97316",
            fillOpacity: 0.3,
          }}
        />
      )}

      {vertices.map((p, i) => (
        <CircleMarker
          key={i}
          center={p}
          radius={5}
          pathOptions={{
            color: "#f97316",
            fillColor: "#f97316",
            fillOpacity: 1,
          }}
        />
      ))}
    </MapContainer>
  );
}
