'use client'

import { ExchangeRateBar } from '@/components/ExchangeRateBar'
import { useExchangeRate } from '@/hooks/useExchangeRate'

export default function HomeExchangeSection() {
  const exchangeRateState = useExchangeRate()

  return <ExchangeRateBar {...exchangeRateState} />
}
