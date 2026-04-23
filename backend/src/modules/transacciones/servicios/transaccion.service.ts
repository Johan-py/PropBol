import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Datos mock de planes (fallback si la DB no tiene datos)
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
       imagen_gr_url: '/qrs/estandar.png' 
       },
  3: { 
      nombre_plan: 'Pro',
       precio_plan: 199.0, 
       nro_publicaciones_plan: 100, 
       duración_plan_días: 30, 
       fotos_galeria: 30, 
       imagen_gr_url: '/qrs/pro.png'
      },
};

function convertirDecimalANumber(valor: any): number {
  if (!valor) return 0;
  if (typeof valor === 'object' && 'toNumber' in valor) return valor.toNumber();
  if (typeof valor === 'number') return valor;
  return 0;
}

export async function crearTransaccion(idUsuario: number, idSuscripcion: number) {
  // 1. Intentar obtener plan desde DB real
  let plan = await prisma.plan_suscripcion.findUnique({
    where: { id: idSuscripcion },
  }).catch(() => null);

  let usandoMock = false;

  // 2. Fallback a mock si no existe en DB
  if (!plan) {
    console.warn(`⚠️ Plan ${idSuscripcion} no encontrado en DB, usando mock`);
    plan = planesMock[idSuscripcion];
    usandoMock = true;
    if (!plan) {
      throw new Error('Plan no encontrado');
    }
  }

  // 3. Obtener precio como número
  const total = convertirDecimalANumber(plan.precio_plan);
  const subtotal = Number((total / 1.13).toFixed(2));
  const ivaMonto = Number((total - subtotal).toFixed(2));

  // 4. Crear transacción
  let transaccion;
  if (!usandoMock) {
    transaccion = await prisma.transacciones.create({
      data: {
        id_usuario: idUsuario,
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
      include: { plan_suscripcion: true },
    });
  } else {
    // Mock: generar ID temporal
    transaccion = {
      id: Math.floor(Math.random() * 10000),
      id_usuario: idUsuario,
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
    };
  }

  // 5. Registrar en bitácora (solo si es real)
  if (!usandoMock) {
    await prisma.bitacora_pagos.create({
      data: {
        id_usuario: idUsuario,
        id_suscripcion: idSuscripcion,
        evento: 'TRANSACCION_CREADA',
        mensaje: `Transacción creada para plan ${plan.nombre_plan}`,
      },
    }).catch(() => null);
  }

  return {
    ...transaccion,
    referencia: `REF-${transaccion.id}`,
    fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    qrContent: plan.imagen_gr_url,
  };
}
