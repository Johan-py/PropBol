import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useCancelPayment() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

<<<<<<< HEAD
  // Abrir/cerrar modal
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // Confirmar cancelación: navega al inicio
  const confirmCancel = () => {
    setIsModalOpen(false)
    router.push('/')
=======
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const confirmCancel = async () => {
    setIsModalOpen(false)

    try {
      const stored = localStorage.getItem('currentPayment')
      if (stored) {
        const payment = JSON.parse(stored)
        await fetch(`/api/transacciones/${payment.id}/cancelar`, { method: 'PATCH' })
        const planId = payment.planId
        localStorage.removeItem('currentPayment')
        router.push(planId ? `/pago/resumen?planId=${planId}` : '/cobros-suscripciones')
        return
      }
    } catch {
      // No bloqueamos la navegación si la llamada falla
    }

    router.push('/cobros-suscripciones')
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
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
