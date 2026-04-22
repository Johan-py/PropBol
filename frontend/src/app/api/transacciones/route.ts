/*console.log('DATABASE_URL:', process.env.DATABASE_URL);
import { NextResponse } from 'next/server';
import { crearTransaccion } from '../../../../../backend/src/modules/transacciones/servicios/transaccionServicios';

export async function POST(request: Request) {
  try {
    const { idSuscripcion } = await request.json();
    if (!idSuscripcion) {
      return NextResponse.json({ error: 'Falta el ID del plan' }, { status: 400 });
    }
    const usuarioId = 1; // Usuario fijo para pruebas (debe existir en BD)
    const transaccion = await crearTransaccion(usuarioId, idSuscripcion);
    return NextResponse.json(transaccion, { status: 201 });
  } catch (error: any) {
    console.error('Error en API transacciones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}*/

import { NextResponse } from 'next/server';

// Datos mock de planes (simulan BD)
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

export async function POST(request: Request) {
  try {
    const { idSuscripcion } = await request.json();
    if (!idSuscripcion) {
      return NextResponse.json({ error: 'Falta el ID del plan' }, { status: 400 });
    }
    const plan = planesMock[idSuscripcion];
    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });
    }

    const total = plan.precio_plan;
    const subtotal = Number((total / 1.13).toFixed(2));
    const ivaMonto = Number((total - subtotal).toFixed(2));
    const transaccionId = Math.floor(Math.random() * 10000);

    const transaccion = {
      id: transaccionId,
      id_usuario: 1,
      id_suscripcion: idSuscripcion,
      subtotal,
      iva_porcentaje: 13,
      iva_monto: ivaMonto,
      total,
      metodo_pago: 'QR_BANCARIO',
      fecha_intento: new Date().toISOString(),
      estado: 'pendiente',                    // ← estado en minúscula como espera el hook
      verificacion_requerida: true,
      monto_descuento: 0,
      plan_suscripcion: plan,
      // Campos adicionales para la página QR
      referencia: `REF-${transaccionId}`,
      fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      monto: total,                          // ← alias de total
      qrContent: plan.imagen_gr_url,
    };
    return NextResponse.json(transaccion, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
