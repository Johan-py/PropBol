import { useState, useEffect } from 'react'
import { PaymentData } from '@/types/payment'

export function useCurrentPayment() {
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentPayment')
      if (!raw) throw new Error('No hay pago en curso')
      const data = JSON.parse(raw) as PaymentData
      setPayment(data)
    } catch {
      setError('Error al cargar el pago')
    } finally {
      setLoading(false)
    }
  }, [])

  return { payment, loading, error }
}
