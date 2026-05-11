// frontend/src/hooks/useExchangeRate.ts
import { useState, useEffect } from 'react'

// T8: Tipo explícito sin "any"
export type ExchangeRateState = {
  officialRate: number
  referentialRate: number | null
  updatedAt: string
  isLoading: boolean
  isError: boolean
}

/**
 * Hook personalizado para obtener el tipo de cambio oficial y referencial.
 * Maneja el estado de carga y errores para el componente ExchangeRateBar.
 * @returns {ExchangeRateState} El estado actual del tipo de cambio.
 */
export const useExchangeRate = (): ExchangeRateState => {
  const [state, setState] = useState<ExchangeRateState>({
    officialRate: 6.96,
    referentialRate: null,
    updatedAt: '',
    isLoading: true, // T8: Inicia cargando para mostrar el Skeleton
    isError: false
  })

  useEffect(() => {
    const fetchRates = async () => {
      // COMENTAMOS EL FETCH REAL TEMPORALMENTE HASTA QUE ADRIAN TERMINE LA T3
      /*
      try {
        const res = await fetch('/api/exchange-rate');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        setState({
          officialRate: data.official || 6.96,
          referentialRate: data.referential, // Puede ser null si P2P falla
          updatedAt: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : '',
          isLoading: false,
          isError: false,
        });
      } catch (error) {
        setState(prev => ({ ...prev, isLoading: false, isError: true }));
      }
      */

      // SIMULAMOS UNA RESPUESTA EXITOSA PARA PROBAR LA UI (T8)
      setTimeout(() => {
        setState({
          officialRate: 6.96,
          referentialRate: 11.5, // Simulamos que Binance nos devolvió 11.50
          updatedAt: new Date().toLocaleTimeString(),
          isLoading: false,
          isError: false
        })
      }, 1500) // Le ponemos 1 segundo de retraso para que veas el Skeleton de carga
    }

    fetchRates()
  }, [])

  return state
}
