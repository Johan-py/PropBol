// frontend/src/components/ExchangeRateBar.tsx
import { ExchangeRateState } from '../hooks/useExchangeRate'

// T8: Variables sin strings hardcodeados en el render
const LABELS = {
  title: 'Tipo de Cambio:',
  notAvailable: 'No disponible',
  official: 'Oficial: Bs',
  referential: 'Referencial:'
}

export const ExchangeRateBar = (props: ExchangeRateState) => {
  const { officialRate, referentialRate, updatedAt, isLoading, isError } = props

  // T8 (b): Skeleton de carga
  if (isLoading) {
    return (
      <div
        className="h-6 w-full max-w-md animate-pulse rounded bg-stone-200"
        aria-label="Cargando..."
      />
    )
  }

  // T8 (c): Lógica del ícono de tendencia
  const showIcon = referentialRate !== null && referentialRate !== officialRate
  const trendIcon = referentialRate && referentialRate > officialRate ? '↗' : '↘'

  // T8 (a): Manejo estricto del estado de error y fallback
  const refDisplay =
    isError || !referentialRate ? LABELS.notAvailable : `Bs ${referentialRate.toFixed(2)}`

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600" aria-live="polite">
      <span className="font-semibold text-stone-500">$ {LABELS.title}</span>
      <span>
        {LABELS.official} {officialRate.toFixed(2)}
      </span>
      <span className="text-stone-300">|</span>
      <span className="text-amber-600 font-medium">
        {LABELS.referential} {refDisplay} {showIcon && trendIcon}
      </span>
      {!isError && updatedAt && (
        <span className="ml-auto text-xs text-stone-400 cursor-help" title="Última actualización">
          ⓘ Actualizado al {updatedAt}
        </span>
      )}
    </div>
  )
}
