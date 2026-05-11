// HU13 - Hook para detectar dispositivo y construir URL de redirección a mapas

// CA-09 - Calcula el centroide de un polígono para zona difuminada
export function calcularCentroide(coordenadas: [number, number][]): [number, number] {
  const lat = coordenadas.reduce((s, c) => s + c[0], 0) / coordenadas.length
  const lng = coordenadas.reduce((s, c) => s + c[1], 0) / coordenadas.length
  return [lat, lng]
}
export function useMapRedirect() {
  const getMapUrl = (lat: number, lng: number): string => {
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua)
    const isAndroid = /Android/.test(ua)

    if (isAndroid) {
      return `geo:${lat},${lng}?q=${lat},${lng}`
    }
    if (isIOS) {
      return `maps://maps.apple.com/?daddr=${lat},${lng}`
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }

  const openMap = (lat: number, lng: number) => {
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua)
    const isAndroid = /Android/.test(ua)
    const url = getMapUrl(lat, lng)

    if (isAndroid || isIOS) {
      window.location.href = url
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return { openMap }
}
