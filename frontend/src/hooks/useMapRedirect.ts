// HU13 - Hook para detectar dispositivo y construir URL de redirección a mapas
export function useMapRedirect() {
  const getMapUrl = (lat: number, lng: number): string => {
    // #74 - Testing: se verifica userAgent para detectar dispositivo correctamente
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
    // #74 - Testing: se verifica userAgent para detectar dispositivo correctamente
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
