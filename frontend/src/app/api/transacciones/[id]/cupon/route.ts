import { NextResponse } from 'next/server'

// Inicializar Prisma de forma dinámica para no romper el build
let prismaInstance: any = null

async function getPrisma() {
  if (prismaInstance) return prismaInstance

  try {
    const prismaModule = await import('@prisma/client')
    const PrismaClientCtor = (prismaModule as any).PrismaClient

    if (!PrismaClientCtor) {
      console.warn('⚠️ PrismaClient no disponible, usando modo mock')
      return null
    }

    prismaInstance = new PrismaClientCtor()
    return prismaInstance
  } catch (error) {
    console.warn('⚠️ No se pudo conectar a la base de datos para cupones, usando modo mock')
    return null
  }
}

// Cupones mock (fallback)
const cuponesMock: Record<
  string,
  { tipo: 'PORCENTAJE' | 'MONTO_FIJO'; valor: number; maxUsos: number; usosActuales: number }
> = {
  DESCUENTO10: { tipo: 'PORCENTAJE', valor: 10, maxUsos: 5, usosActuales: 2 },
  AHORRO20: { tipo: 'PORCENTAJE', valor: 20, maxUsos: 3, usosActuales: 1 },
  BS15: { tipo: 'MONTO_FIJO', valor: 15, maxUsos: 10, usosActuales: 4 }
}

// Almacén temporal para controlar cupones aplicados (mock)
const transaccionesCupon: Record<number, boolean> = {}

// Función para obtener cupón desde DB real
async function obtenerCuponDesdeDB(codigo: string) {
  const prisma = await getPrisma()
  if (!prisma) return null

  try {
    const cupon = await prisma.cupon.findUnique({
      where: { codigo: codigo.toUpperCase() }
    })
    return cupon
  } catch (error) {
    console.error('Error al consultar cupón en DB:', error)
    return null
  }
}

// Función para obtener transacción desde DB real
async function _obtenerTransaccionDesdeDB(transaccionId: number) {
  const prisma = await getPrisma()
  if (!prisma) return null

  try {
    const transaccion = await prisma.transacciones.findUnique({
      where: { id: transaccionId }
    })
    return transaccion
  } catch (error) {
    console.error('Error al consultar transacción en DB:', error)
    return null
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaccionId = parseInt(params.id, 10)
    const { codigo, totalOriginal } = await request.json()

    if (!codigo) {
      return NextResponse.json({ error: 'Ingresa un código' }, { status: 400 })
    }

    if (totalOriginal === undefined || isNaN(totalOriginal)) {
      return NextResponse.json({ error: 'Monto no válido' }, { status: 400 })
    }

    // 1. Intentar obtener cupón desde DB real
    const cuponDB = await obtenerCuponDesdeDB(codigo)
    let usandoMock = false
    let cuponValor = 0
    let cuponTipo: 'PORCENTAJE' | 'MONTO_FIJO' = 'PORCENTAJE'
    let maxUsos = 0
    let usosActuales = 0
    let cuponId: number | null = null

    if (cuponDB) {
      if (
        cuponDB.valor_descuento &&
        typeof cuponDB.valor_descuento === 'object' &&
        'toNumber' in cuponDB.valor_descuento
      ) {
        cuponValor = cuponDB.valor_descuento.toNumber()
      } else if (typeof cuponDB.valor_descuento === 'number') {
        cuponValor = cuponDB.valor_descuento
      } else {
        cuponValor = 0
      }

      cuponTipo = cuponDB.tipo_descuento as 'PORCENTAJE' | 'MONTO_FIJO'
      maxUsos = cuponDB.max_usos
      usosActuales = cuponDB.usos_actuales
      cuponId = cuponDB.id
    } else {
      console.warn(`⚠️ Cupón ${codigo} no encontrado en DB, usando mock`)

      const cuponMock = cuponesMock[codigo.toUpperCase()]
      if (!cuponMock) {
        return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
      }

      usandoMock = true
      cuponValor = cuponMock.valor
      cuponTipo = cuponMock.tipo
      maxUsos = cuponMock.maxUsos
      usosActuales = cuponMock.usosActuales
    }

    // 2. Verificar usos disponibles (solo si viene de DB real)
    if (!usandoMock && usosActuales >= maxUsos) {
      return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 })
    }

    // 3. Verificar que no se haya aplicado otro cupón
    if (transaccionesCupon[transaccionId]) {
      return NextResponse.json({ error: 'Ya se aplicó un descuento' }, { status: 400 })
    }

    // 4. Calcular descuento
    let montoDescuento = 0

    if (cuponTipo === 'PORCENTAJE') {
      montoDescuento = totalOriginal * (cuponValor / 100)
    } else {
      montoDescuento = cuponValor
      if (montoDescuento > totalOriginal) montoDescuento = totalOriginal
    }

    montoDescuento = Number(montoDescuento.toFixed(2))
    const nuevoTotal = totalOriginal - montoDescuento

    // 5. Guardar en memoria (mock) o en DB real
    transaccionesCupon[transaccionId] = true

    const prisma = await getPrisma()
    if (!usandoMock && prisma && cuponId) {
      try {
        await prisma.transacciones.update({
          where: { id: transaccionId },
          data: {
            cupon_id: cuponId,
            monto_descuento: montoDescuento,
            total: nuevoTotal
          }
        })
      } catch (dbError) {
        console.error('Error al actualizar transacción en DB:', dbError)
      }
    }

    return NextResponse.json({
      total: nuevoTotal,
      montoDescuento
    })
  } catch (error) {
    console.error('Error al aplicar cupón:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}