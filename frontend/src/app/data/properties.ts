export interface PropertyMapPin {
  id: string
  title: string
  price: number
  type: 'casa' | 'departamento' | 'terreno' | 'local'
  operation: 'venta' | 'alquiler' | 'anticretico'
  rooms: number
  bathrooms: number
  lat: number
  lng: number
}
