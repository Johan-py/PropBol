export interface ZoneCoordinate {
  lat: number
  lng: number
}

export interface Zone {
  id: string
  name: string
  reference: string
  polygon: ZoneCoordinate[]
  isActive?: boolean
}
