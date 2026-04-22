import { NextResponse } from 'next/server'

// Cupones de prueba
const cuponesMock: Record<
  string,
  { tipo: 'PORCENTAJE' | 'MONTO_FIJO'; valor: number; maxUsos: number; usosActuales: number }
> = {
  DESCUENTO10: { tipo: 'PORCENTAJE', valor: 10, maxUsos: 5, usosActuales: 2 },
  AHORRO20: { tipo: 'PORCENTAJE', valor: 20, maxUsos: 3, usosActuales: 1 },
  BS15: { tipo: 'MONTO_FIJO', valor: 15, maxUsos: 10, usosActuales: 4 }
}

// Simular usos por transacción (evita doble aplicación)
const transaccionesCupon: Record<number, boolean> = {}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const transaccionId = parseInt(params.id, 10)
    const { codigo, totalOriginal } = await request.json()

    if (!codigo) {
      return NextResponse.json({ error: 'Ingresa un código' }, { status: 400 })
    }
    if (totalOriginal === undefined || isNaN(totalOriginal)) {
      return NextResponse.json({ error: 'Monto no válido' }, { status: 400 })
    }
    if (transaccionesCupon[transaccionId]) {
      return NextResponse.json({ error: 'Ya se aplicó un descuento' }, { status: 400 })
    }

    const cupon = cuponesMock[codigo.toUpperCase()]
    if (!cupon) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }
    if (cupon.usosActuales >= cupon.maxUsos) {
      return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 })
    }

    let montoDescuento = 0
    if (cupon.tipo === 'PORCENTAJE') {
      montoDescuento = totalOriginal * (cupon.valor / 100)
    } else {
      montoDescuento = cupon.valor
      if (montoDescuento > totalOriginal) montoDescuento = totalOriginal
    }
    montoDescuento = Number(montoDescuento.toFixed(2))
    const nuevoTotal = totalOriginal - montoDescuento

    transaccionesCupon[transaccionId] = true

    return NextResponse.json({
      total: nuevoTotal,
      monto_descuento: montoDescuento
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
