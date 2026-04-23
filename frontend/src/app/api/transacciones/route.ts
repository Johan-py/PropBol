<<<<<<< HEAD
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Body recibido:', body)

    // Datos mock de respuesta
    const mockTransaccion = {
      id: 123,
      total: 66.67,
      plan_suscripcion: {
        nombre_plan: 'Estándar',
        nro_publicaciones_plan: 10,
        duración_plan_días: 60,
        imagen_gr_url: '/qrs/estandar.png'
      },
      subtotal: 59.0,
      iva_monto: 7.67
    }

    return NextResponse.json(mockTransaccion, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
=======
import { NextResponse } from 'next/server';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
export async function POST(request: Request) {
  try {
    const { idSuscripcion } = await request.json();
    if (!idSuscripcion) {
      return NextResponse.json({ error: 'Falta el ID del plan' }, { status: 400 });
    }
    const response = await fetch(`${BACKEND_URL}/api/transacciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idSuscripcion, idUsuario: 1 }), // TODO: obtener usuario autenticado
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear transacción');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error en API transacciones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  }
}