import { Zone } from '@/types/zone'

export const mockZones: Zone[] = [
  {
    id: 'zone-1',
    name: 'Zona Norte - Cochabamba',
    reference: 'Cochabamba, Bolivia',
    isActive: true,
    polygon: [
      { lat: -17.3701, lng: -66.1402 },
      { lat: -17.3655, lng: -66.1324 },
      { lat: -17.3728, lng: -66.1255 },
      { lat: -17.3792, lng: -66.1348 }
    ]
  },
  {
    id: 'zone-2',
    name: 'Cerca del Cristo de la Concordia',
    reference: 'Cochabamba, Bolivia',
    isActive: false,
    polygon: [
      { lat: -17.3841, lng: -66.1506 },
      { lat: -17.3807, lng: -66.1453 },
      { lat: -17.3862, lng: -66.1389 },
      { lat: -17.3905, lng: -66.1468 }
    ]
  },
  {
    id: 'zone-3',
    name: 'Cerca del Parque Fidel Anze',
    reference: 'Cochabamba, Bolivia',
    isActive: false,
    polygon: [
      { lat: -17.3668, lng: -66.1605 },
      { lat: -17.3629, lng: -66.1543 },
      { lat: -17.3694, lng: -66.1481 },
      { lat: -17.3736, lng: -66.1567 }
    ]
  }
]
