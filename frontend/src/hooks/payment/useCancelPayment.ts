import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useCancelPayment() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const confirmCancel = async () => {
    setIsModalOpen(false)
    try {
      const raw = localStorage.getItem('currentPayment')
      const payment = raw ? JSON.parse(raw) : null
      const planId = payment?.planId

      if (payment?.id) {
        await fetch(`http://localhost:5000/api/transacciones/${payment.id}/estado`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nuevoEstado: 'CANCELADO' }),
        })
      }

      localStorage.removeItem('currentPayment')
      router.push(planId ? `/pago/resumen?planId=${planId}` : '/')
    } catch {
      router.push('/')
    }
  }

  useEffect(() => {
    if (!isModalOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isModalOpen])

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  return { isModalOpen, openModal, closeModal, confirmCancel }
}
