import { NextResponse } from 'next/server'

// Siempre usa el backend local en el servidor — sin problema de CORS
const BACKEND = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000'

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/estadisticas-zona/zonas`, {
      cache: 'no-store'
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('[API/estadisticas-zona/zonas] Error:', error)
    return NextResponse.json(
      { ok: false, mensaje: 'No se pudo conectar al servicio de zonas.' },
      { status: 502 }
    )
  }
}
