import { NextResponse } from 'next/server';

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Transacción cancelada correctamente' });
}
