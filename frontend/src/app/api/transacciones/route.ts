import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Inicializar Prisma (si falla, usaremos mock)
let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.warn('⚠️ No se pudo conectar a la base de datos, usando modo mock');
}

// Datos mock de planes (fallback)
const planesMock: Record<number, any> = {
  1: { 
       nombre_plan: 'Básico',
       precio_plan: 0.0, 
       nro_publicaciones_plan: 3, 
       duración_plan_días: 30, 
       fotos_galeria: 5, 
       imagen_gr_url: '/qrs/basico.png' 
      },
  2: {
       nombre_plan: 'Estándar',
       precio_plan: 99.0,
       nro_publicaciones_plan: 10,
       duración_plan_días: 30,
       fotos_galeria: 15,
       imagen_gr_url: 'TT3HfmhicyLGB7DsszTMD0ayhkdaDCksBPXNzTV5jSfRx7ZZoEqhjqNJY/EKhN11XVStPpLWzxkKDLREBFDL063hBFqV/yyuT3m6bz9I8DgFIk9qclw05CnmXEcY83ojlo9J3rLmtk4t6VFugFqt8lu42y8sguScwt3CXqCDVRlbNuN3DXDxtrPk5FezHuda0nSyXJjXCwcpEQteO8QGTxL6kiBIg1rUE8VHva+xzCkZw6kL1b/bZbGou+rPAglwsWmdtrml0mLqYoIWM18Kll9V/dhNNNGOATfJnMBKPVfr2pAFKSJFQsrHdSbQ3PlfrnzTTNKUTYwNJw1jJINtvw==|772E2FC6B3BAA5262DA3FE4B'
       },
  3: {
      nombre_plan: 'Pro',
       precio_plan: 199.0,
       nro_publicaciones_plan: 100,
       duración_plan_días: 30,
       fotos_galeria: 30,
       imagen_gr_url: 'i9wvnM89po4tY2maQFw7QUpqdIsVpIWU2GSEkhllTejx9c3c0549XbomghsgXZRzeem9mHIUsSlyJdFVKk8hhCij7TyThkDo1pFGMatRWA3NxvjmsqQ3rjSebUVC8GzCwO1nk2b5UvWrIRcnNISHK0WMIEnbDd4hiE5DwPgkJoqspwtEe/W3u4olIIBStoGNEk7bdvuWRkGfP1mwXgPMowEDEg/w6AGdDZEzypxFkW+mOnyWS2DgnmbTZ7OBM7A7Ci2pKReW5vOPKerV+jm9aB1HMh3v9iv2TlLU+4cys0G35KBr15waiAN0lTDCYI6ngHQ29ZK9UPoVUkNKXJur0g==|772E2FC6B3BAA5262DA3FE4B'
      },
};

async function obtenerPlanDesdeDB(idSuscripcion: number) {
  if (!prisma) return null;
  try {
    const plan = await prisma.plan_suscripcion.findUnique({
      where: { id: idSuscripcion },
    });
    return plan;
  } catch (error) {
    console.error('Error al consultar plan en DB:', error);
    return null;
  }
}

function crearTransaccionMock(idSuscripcion: number, plan: any) {
  const total = plan.precio_plan;
  const subtotal = Number((total / 1.13).toFixed(2));
  const ivaMonto = Number((total - subtotal).toFixed(2));
  const transaccionId = Math.floor(Math.random() * 10000);

  return {
    id: transaccionId,
    id_usuario: 1,
    id_suscripcion: idSuscripcion,
    subtotal,
    iva_porcentaje: 13,
    iva_monto: ivaMonto,
    total,
    metodo_pago: 'QR_BANCARIO',
    fecha_intento: new Date().toISOString(),
    estado: 'pendiente',
    verificacion_requerida: true,
    monto_descuento: 0,
    plan_suscripcion: plan,
    referencia: `REF-${transaccionId}`,
    fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    qrContent: plan.imagen_gr_url,
  };
}

export async function POST(request: Request) {
  try {
    const { idSuscripcion } = await request.json();
    if (!idSuscripcion) {
      return NextResponse.json({ error: 'Falta el ID del plan' }, { status: 400 });
    }

    // 1. Intentar obtener el plan desde la base de datos
    let plan = await obtenerPlanDesdeDB(idSuscripcion);
    let usandoMock = false;

    // 2. Si no se encontró en DB o hubo error, usar mock
    if (!plan) {
      console.log(`⚠️ Plan ${idSuscripcion} no encontrado en DB, usando mock`);
      plan = planesMock[idSuscripcion];
      usandoMock = true;
      if (!plan) {
        return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
      }
    }

    // CONVERSIÓN: Decimal → number (si viene de Prisma)
    let total: number;
    if (plan.precio_plan && typeof plan.precio_plan === 'object' && 'toNumber' in plan.precio_plan) {
      total = plan.precio_plan.toNumber(); // Decimal de Prisma
    } else if (typeof plan.precio_plan === 'number') {
      total = plan.precio_plan; // Número normal (mock)
    } else {
      total = 0;
      console.error('Precio del plan no válido:', plan.precio_plan);
    }

    // 3. Calcular subtotal e IVA (usando 'total' como number)
    const subtotal = Number((total / 1.13).toFixed(2));
    const ivaMonto = Number((total - subtotal).toFixed(2));

    // 4. Crear la transacción
    let transaccion;

    if (!usandoMock && prisma) {
      try {
        const transaccionReal = await prisma.transacciones.create({
          data: {
            id_usuario: 1,
            id_suscripcion: idSuscripcion,
            subtotal,
            iva_porcentaje: 13,
            iva_monto: ivaMonto,
            total,
            metodo_pago: 'QR_BANCARIO',
            fecha_intento: new Date(),
            estado: 'pendiente',
            verificacion_requerida: true,
            monto_descuento: 0,
          },
          include: {
            plan_suscripcion: true,
          },
        });

        transaccion = {
          ...transaccionReal,
          referencia: `REF-${transaccionReal.id}`,
          fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          qrContent: plan.imagen_gr_url,
        };
      } catch (dbError) {
        console.error('Error al guardar transacción en DB, usando mock:', dbError);
        transaccion = crearTransaccionMock(idSuscripcion, plan);
      }
    } else {
      transaccion = crearTransaccionMock(idSuscripcion, plan);
    }

    return NextResponse.json(transaccion, { status: 201 });
  } catch (error: any) {
    console.error('Error en API transacciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
