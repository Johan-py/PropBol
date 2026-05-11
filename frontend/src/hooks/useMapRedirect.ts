// HU13 - Hook para detectar dispositivo y construir URL de redireccion a mapas
export function useMapRedirect() {
  const getMapUrl = (lat: number, lng: number, originLat?: number, originLng?: number): string => {
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua)
    const isAndroid = /Android/.test(ua)
    if (isAndroid) {
      return originLat && originLng
        ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${lat},${lng}`
        : `geo:${lat},${lng}?q=${lat},${lng}`
    }
    if (isIOS) {
      return originLat && originLng
        ? `maps://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${lat},${lng}`
        : `maps://maps.apple.com/?daddr=${lat},${lng}`
    }
    return originLat && originLng
      ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
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
