// HU13 - Hook para detectar dispositivo y construir URL de redireccion a mapas
export function useMapRedirect() {
  const getMapUrl = (lat: number, lng: number, originLat?: number, originLng?: number): string => {
    // #74 - Testing: coordenadas usan punto como separador decimal para compatibilidad con APIs de mapas
    const latStr = lat.toFixed(6)
    const lngStr = lng.toFixed(6)
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua)
    const isAndroid = /Android/.test(ua)
    if (isAndroid) {
      return originLat && originLng
        ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${latStr},${lngStr}`
        : `geo:${latStr},${lngStr}?q=${latStr},${lngStr}`
    }
    if (isIOS) {
      return originLat && originLng
        ? `maps://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${latStr},${lngStr}`
        : `maps://maps.apple.com/?daddr=${latStr},${lngStr}`
    }
    return originLat && originLng
      ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${latStr},${lngStr}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latStr},${lngStr}`
  }
  const openMap = (lat: number, lng: number) => {
    // #74 - Testing: se verifica userAgent para detectar dispositivo correctamente
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua)
    const isAndroid = /Android/.test(ua)
    // #72 #73 - Obtener ubicacion real del usuario como origen de la ruta
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const url = getMapUrl(lat, lng, pos.coords.latitude, pos.coords.longitude)
          if (isAndroid || isIOS) {
            window.location.href = url
          } else {
            window.open(url, '_blank', 'noopener,noreferrer')
          }
        },
        () => {
          const url = getMapUrl(lat, lng)
          if (isAndroid || isIOS) {
            window.location.href = url
          } else {
            window.open(url, '_blank', 'noopener,noreferrer')
          }
        }
      )
    } else {
      const url = getMapUrl(lat, lng)
      if (isAndroid || isIOS) {
        window.location.href = url
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    }
  }
  return { openMap }
}
