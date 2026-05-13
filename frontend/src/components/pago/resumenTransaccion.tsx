interface Props {
  transaccion: any
}

export default function ResumenTransaccion({ transaccion }: Props) {
  const { subtotal, iva_monto, total, monto_descuento } = transaccion;

  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-lg bg-white">
      <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-100">Resumen de compra</h3>
      <div className="space-y-3 text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">Bs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA (13%)</span>
          <span className="font-semibold">Bs. {iva_monto.toFixed(2)}</span>
        </div>
        {monto_descuento > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento</span>
            <span>- Bs. {monto_descuento.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
          <span>Total a pagar</span>
          <span className="text-green-700">Bs. {total.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-6 bg-green-50 p-4 rounded-lg text-center border border-green-100">
        <p className="text-sm text-green-800 font-medium">Total a pagar</p>
        <p className="text-2xl font-bold text-green-700">Bs. {total.toFixed(2)}</p>
        <p className="text-xs text-green-600 mt-1">IVA incluido</p>
      </div>
    </div>
  );
}
