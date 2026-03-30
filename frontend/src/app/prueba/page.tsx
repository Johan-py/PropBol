// app/pago/detalles/page.tsx
'use client';

import { useState } from 'react';

export default function DetallesPagoPage() {
  const [pasoActual, setPasoActual] = useState(1);

  const pasos = [
    { numero: 1, nombre: 'Resumen', estado: 'activo' },
    { numero: 2, nombre: 'Pagar', estado: 'inactivo' },
    { numero: 3, nombre: 'Confirmación', estado: 'inactivo' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Indicador de pasos */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {pasos.map((paso, index) => (
              <div key={paso.numero} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      ${paso.estado === 'activo' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                      }`}
                  >
                    {paso.numero}
                  </div>
                  <span className="text-sm mt-2 text-gray-600">{paso.nombre}</span>
                </div>
                {index < pasos.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Plan seleccionado</h2>
              <p className="text-gray-600">Aquí irá el plan seleccionado</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Método de pago</h2>
              <p className="text-gray-600">Aquí irá la lista de métodos de pago</p>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-right">Resumen de Compra</h1>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Detalle de Pago</h2>
              <p className="text-gray-600">Aquí irá el detalle de pago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}