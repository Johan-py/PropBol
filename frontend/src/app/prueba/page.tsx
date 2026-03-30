// app/pago/page.tsx
'use client';

import { useState } from 'react';

export default function ResumenCompra() {

  // Estado para controlar qué método de pago está seleccionado
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  
  return (
    <div>
      {/* ================ PARTE SUPERIOR ================ */}
       <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-500 mb-1">Resumen</div>
          <div className="w-8 h-8 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
            1
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-500 mb-1">Pagar</div>
          <div className="w-8 h-8 mx-auto rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
            2
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-500 mb-1">Confirmación</div>
          <div className="w-8 h-8 mx-auto rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
            3
          </div>
        </div>
      </div>
      {/* ================ FIN PARTE SUPERIOR ================ */}

      {/* ================ PARTE INTERMEDIA ================ */}
        {/* RESUMEN DE COMPRA */}
       <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-left">
          Resumen de compra
        </h1>
      </div>

       {/* METODOS DE PAGO */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-left mb-4">
          Métodos de pago
        </h2>
        
        {/* Lista de métodos de pago */}
        <div className="space-y-3">
          {/* Método de pago: QR Bancario */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              metodoSeleccionado === 'qr' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setMetodoSeleccionado('qr')}
          >
            <div className="flex items-center gap-3">
              {/* Radio button personalizado */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                metodoSeleccionado === 'qr' 
                  ? 'border-blue-500' 
                  : 'border-gray-300'
              }`}>
                {metodoSeleccionado === 'qr' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              
              {/* Icono y texto del método */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  <span className="font-semibold text-gray-800">QR Bancario</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Escanea desde tu app bancaria boliviana
                </p>
              </div>
            </div>
          </div>
          
          {/* Bloque desplegable cuando se selecciona QR */}
          {metodoSeleccionado === 'qr' && (
            <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-fadeIn">
              <div className="flex items-start gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-yellow-800 font-medium">Aquí va la factura</p>
                  <p className="text-yellow-600 text-sm mt-1">
                    Escanea el código QR con tu aplicación bancaria para realizar el pago
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Botón para continuar (opcional) */}
        <button
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!metodoSeleccionado}
          onClick={() => {
            if (metodoSeleccionado === 'qr') {
              // Aquí puedes redirigir al siguiente paso o procesar el pago
              console.log('Procesando pago con QR...');
            }
          }}
        >
          Continuar con el pago
        </button>
      </div>
      {/* ================ FIN PARTE INTERMEDIA ================ */}

      {/* ================ PARTE INFERIOR ================ */}
      <div>
      </div>
      {/* ================ FIN PARTE INFERIOR ================ */}
    </div>
  );
}