import { useState, useEffect } from 'react'
import { PaymentData } from '@/types/payment'

export function useCurrentPayment() {
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        // Cambie el fetch me leia mal la ruta
        const response = await fetch('http://localhost:5000/api/transacciones/pendiente/1', {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) throw new Error('Error al obtener la transacción')

        const data = await response.json()

        const realPayment: PaymentData = {
          id: data.id,
          monto: data.monto,
          referencia: data.referencia,
          qrContent: data.qrContent,
          estado: data.estado,
          fechaExpiracion: data.fechaExpiracion
        }

        setPayment(realPayment)
<<<<<<< HEAD
      } catch (err) {
=======
      } catch (_err) {
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
        setError('Error al cargar el pago')
      } finally {
        setLoading(false)
      }
    }
<<<<<<< HEAD

    fetchPayment()
  }, [])

=======
    fetchPayment()
  }, [])
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  return { payment, loading, error }
}
