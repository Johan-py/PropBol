import { useState, useEffect } from 'react'
import { PaymentData } from '@/types/payment'

export function useCurrentPayment() {
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentPayment')
      if (!stored) {
        setError('No hay pago en curso')
        setLoading(false)
        return
      }
      const data = JSON.parse(stored) as PaymentData
      setPayment(data)
    } catch {
      setError('Error al leer el pago')
    } finally {
      setLoading(false)
    }
  }, [])

  return { payment, loading, error }
}
