"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ResumenTransaccion from '@/components/pago/resumenTransaccion';
import Stepper from '@/components/ui/Stepper';

export default function ResumenCliente() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planIdParam = searchParams.get('planId');

  const [transaccion, setTransaccion] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [aplicandoCupon, setAplicandoCupon] = useState(false);
  const [mensajeCupon, setMensajeCupon] = useState<{ texto: string; error: boolean } | null>(null);

  const nombreMetodo: Record<string, string> = { qr: 'QR Bancario' };

  useEffect(() => {
    if (!planIdParam) {
      setError('No se especificó un plan');
      setCargando(false);
      return;
    }

    const idSuscripcion = parseInt(planIdParam, 10);
    if (isNaN(idSuscripcion)) {
      setError('ID inválido');
      setCargando(false);
      return;
    }

    async function iniciarTransaccion() {
      try {
        const res = await fetch('/api/transacciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idSuscripcion }),
        });

        if (!res.ok) throw new Error('Error al crear la transacción');

        const data = await res.json();
        setTransaccion(data);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setCargando(false);
      }
    }

    iniciarTransaccion();
  }, [planIdParam]);

  const manejarContinuar = () => {
    if (metodoSeleccionado && transaccion) {
      localStorage.setItem('currentPayment', JSON.stringify({
        id: transaccion.id,
        planId: planIdParam,
        monto: transaccion.total,
        referencia: transaccion.referencia || transaccion.id,
        estado: 'pendiente',
        fechaExpiracion:
          transaccion.fechaExpiracion ||
          new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        qrContent:
          transaccion.plan_suscripcion?.imagen_gr_url ||
          '/qrs/estandar.png',
        planNombre: transaccion.plan_suscripcion?.nombre_plan || null,
        subtotal: transaccion.subtotal ?? null,
        iva_monto: transaccion.iva_monto ?? null,
      }));

      router.push(`/pago/qr?transaccionId=${transaccion.id}`);
    }
  };

  const aplicarCupon = async () => {
    if (!codigoCupon.trim()) {
      setMensajeCupon({ texto: 'Ingresa un código', error: true });
      return;
    }

    setAplicandoCupon(true);

    try {
      const res = await fetch(`/api/transacciones/${transaccion.id}/cupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: codigoCupon.trim(),
          totalOriginal: transaccion.total,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al aplicar cupón');

      setTransaccion((prev: any) => ({
        ...prev,
        total: data.total,
        monto_descuento: data.monto_descuento,
      }));

      setMensajeCupon({ texto: '¡Cupón aplicado!', error: false });
      setCodigoCupon('');
    } catch (err: any) {
      setMensajeCupon({
        texto: err.message || 'Error desconocido',
        error: true,
      });
    } finally {
      setAplicandoCupon(false);
    }
  };

  if (cargando)
    return <div className="text-center py-10 text-gray-600">Cargando...</div>;

  if (error)
    return <div className="text-center py-10 text-red-600">Error: {error}</div>;

  if (!transaccion) return null;

  const plan = transaccion.plan_suscripcion;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white font-sans">
      <div className="flex justify-between items-center mb-6">
        <Stepper />
        <div className="text-gray-500 text-sm">PropBol Inmobiliaria</div>
      </div>

      <h1 className="text-3xl font-bold mb-2 text-gray-900">
        Resumen de compra
      </h1>
      <p className="text-gray-500 mb-6">
        Verifica tu pedido antes de realizar el pago
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* IZQUIERDA */}
        <div>
          <div className="border border-gray-200 rounded-lg p-6 mb-6 shadow-md">
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">🏠</span>
              <h2 className="text-xl font-bold">
                Plan {plan.nombre_plan}
              </h2>
            </div>
            <p className="text-gray-600">
              {plan.nro_publicaciones_plan} publicaciones activas · Vigencia{' '}
              {plan.duración_plan_días} días · Galería {plan.fotos_galeria} fotos
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              MÉTODO DE PAGO
            </h3>

            <div
              className={`flex items-start p-3 border rounded-lg cursor-pointer transition ${
                metodoSeleccionado === 'qr'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setMetodoSeleccionado('qr')}
            >
              <span className="text-2xl mr-4">📱</span>
              <div>
                <div className="font-bold">Pago por QR</div>
                <div className="text-sm text-gray-500">
                  Escanea con tu app bancaria
                </div>
              </div>
            </div>

            <button
              onClick={manejarContinuar}
              disabled={!metodoSeleccionado}
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition shadow-md ${
                metodoSeleccionado
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continuar con{' '}
              {metodoSeleccionado
                ? nombreMetodo[metodoSeleccionado]
                : 'un método'}
            </button>

            <Link
              href="/cobros-suscripciones"
              className="block w-full text-center mt-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              ← Volver a planes
            </Link>
          </div>
        </div>

        {/* DERECHA */}
        <div>
          <ResumenTransaccion transaccion={transaccion} />

          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Tienes un código de descuento?
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={codigoCupon}
                onChange={(e) => setCodigoCupon(e.target.value)}
                placeholder="Ej: DESCUENTO10"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />

              <button
                onClick={aplicarCupon}
                disabled={aplicandoCupon}
                className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:bg-orange-300"
              >
                {aplicandoCupon ? 'Aplicando...' : 'Aplicar'}
              </button>
            </div>

            {mensajeCupon && (
              <p
                className={`text-xs mt-2 ${
                  mensajeCupon.error
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {mensajeCupon.texto}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-400">
        Pago seguro: SSI, 256-bit · Encriptado
      </div>
    </div>
  );
}