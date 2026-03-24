'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import ZoomControls from '@/components/ZoomControls';
import { useProperties } from '@/hooks/useProperties';
import { PropertyMapPin } from '@/types/property';

// Fix para los íconos de leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Color de pin según tipo de propiedad
const PIN_COLORS: Record<PropertyMapPin['type'], string> = {
  casa:         '#2563EB',
  departamento: '#7C3AED',
  terreno:      '#D97706',
  local:        '#059669',
};

function createPinIcon(type: PropertyMapPin['type']): L.DivIcon {
  const color = PIN_COLORS[type] ?? '#6B7280';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

function formatPrice(price: number, currency: 'USD' | 'BOB'): string {
  return currency === 'USD'
    ? `$${price.toLocaleString('es-BO')} USD`
    : `Bs ${price.toLocaleString('es-BO')}`;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
}

export default function MapView({
  center = [-17.392418841841394, -66.1461583463333],
  zoom = 12,
}: MapViewProps) {
  const { properties, isLoading, error } = useProperties();

  return (
    <div className="relative w-full h-full">

      {/* Indicador de carga flotante sobre el mapa */}
      {isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow text-sm text-gray-600 flex items-center gap-2 pointer-events-none">
          <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full" />
          Cargando propiedades...
        </div>
      )}

      {/* Error flotante */}
      {error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 border border-red-200 px-4 py-2 rounded-full shadow text-sm text-red-600 pointer-events-none">
          ⚠️ {error}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ZoomControls debe estar dentro de MapContainer para usar useMap() */}
        <ZoomControls />

        {/* Pins de propiedades */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.lat, property.lng]}
            icon={createPinIcon(property.type)}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <p className="font-semibold text-gray-800 mb-1">{property.title}</p>
                <p className="font-bold" style={{ color: PIN_COLORS[property.type] }}>
                  {formatPrice(property.price, property.currency)}
                </p>
                <p className="text-gray-500 capitalize mt-1">{property.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
