import { NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:5000'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${BACKEND}/api/transacciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Error al conectar con el servidor' }, { status: 502 })
  }
}
