import { PropertyMapPin } from '@/types/property'

// Datos simulados de propiedades en Cochabamba.
// cuando el backend esté disponible. La estructura de cada objeto
// debe mantenerse igual para que MapView.tsx no necesite cambios.

export const MOCK_PROPERTIES: PropertyMapPin[] = [
  {
    id: 'prop-001',
    lat: -17.3895,
    lng: -66.1568,
    price: 85000,
    currency: 'USD',
    type: 'casa',
    title: 'Casa en Queru Queru'
  },
  {
    id: 'prop-002',
    lat: -17.378,
    lng: -66.152,
    price: 45000,
    currency: 'USD',
    type: 'departamento',
    title: 'Dpto. en el Centro'
  },
  {
    id: 'prop-003',
    lat: -17.402,
    lng: -66.161,
    price: 120000,
    currency: 'USD',
    type: 'casa',
    title: 'Casa en Temporal'
  },
  {
    id: 'prop-004',
    lat: -17.395,
    lng: -66.17,
    price: 30000,
    currency: 'USD',
    type: 'terreno',
    title: 'Terreno en Cala Cala'
  },
  {
    id: 'prop-005',
    lat: -17.372,
    lng: -66.148,
    price: 95000,
    currency: 'USD',
    type: 'casa',
    title: 'Casa en Sarco'
  },
  {
    id: 'prop-006',
    lat: -17.41,
    lng: -66.155,
    price: 55000,
    currency: 'USD',
    type: 'departamento',
    title: 'Dpto. en Alalay'
  },
  {
    id: 'prop-007',
    lat: -17.386,
    lng: -66.139,
    price: 200000,
    currency: 'USD',
    type: 'local',
    title: 'Local Comercial av. América'
  },
  {
    id: 'prop-008',
    lat: -17.4,
    lng: -66.145,
    price: 75000,
    currency: 'USD',
    type: 'casa',
    title: 'Casa en Mayorazgo'
  },
  {
    id: 'prop-009',
    lat: -17.369,
    lng: -66.16,
    price: 18000,
    currency: 'USD',
    type: 'terreno',
    title: 'Terreno en Villa Coronilla'
  },
  {
    id: 'prop-010',
    lat: -17.381,
    lng: -66.172,
    price: 62000,
    currency: 'USD',
    type: 'departamento',
    title: 'Dpto. en Lomas de Alata'
  }
]
