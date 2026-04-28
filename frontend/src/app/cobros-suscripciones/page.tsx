import React from 'react';
import { CheckCircle2, Calendar, CreditCard, Building2, ExternalLink } from 'lucide-react';

interface PaymentSuccessProps {
  userName: string;
  planName: string;
  amount: number;
  orderNumber: string;
  date: string;
  nextBillingDate: string;
}

export default function PaymentSuccessEmail({
  userName = "Usuario",
  planName = "Estándar",
  amount = 99,
  orderNumber = "PB-88234",
  date = new Date().toLocaleDateString(),
  nextBillingDate = "28/05/2026"
}: PaymentSuccessProps) {
  return (
    <div className="bg-stone-50 p-4 md:p-8 font-inter flex justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200">
        {/* Cabecera con Branding */}
        <div className="bg-amber-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <CheckCircle2 className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">¡Pago Confirmado!</h1>
          <p className="text-amber-100 mt-1">Gracias por confiar en PropBol</p>
        </div>

        {/* Cuerpo del Mensaje */}
        <div className="p-8">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Hola {userName},</h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            Tu suscripción al plan <span className="font-bold text-stone-900">{planName}</span> ha sido procesada con éxito. 
            Ya puedes disfrutar de todos los beneficios para potenciar tus propiedades.
          </p>

          {/* Tarjeta de Detalles del Cobro */}
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 mb-6">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 border-b border-stone-200 pb-2">
              Resumen de la Transacción
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Orden:</span>
                <span className="font-mono font-medium text-stone-900">#{orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500 flex items-center gap-2"><Building2 className="w-4 h-4"/> Plan:</span>
                <span className="font-medium text-stone-900">{planName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Próximo cobro:</span>
                <span className="font-medium text-stone-900">{nextBillingDate}</span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between items-end">
                <span className="text-stone-900 font-bold">Total Pagado:</span>
                <span className="text-2xl font-black text-amber-600">Bs. {amount}</span>
              </div>
            </div>
          </div>

          {/* Botón de Acción */}
          <button className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-stone-200">
            Ir a mis publicaciones
            <ExternalLink className="w-4 h-4" />
          </button>

          <p className="text-center text-stone-400 text-xs mt-8">
            Si no reconoces este cargo, por favor contacta a soporte@propbol.com
          </p>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 p-6 text-center border-t border-stone-200">
          <p className="text-stone-500 text-sm font-medium">PropBol - El mercado inmobiliario de Bolivia</p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-[10px] text-stone-400">Términos y Condiciones</span>
            <span className="text-[10px] text-stone-400">Privacidad</span>
          </div>
        </div>
      </div>
    </div>
  );
}
