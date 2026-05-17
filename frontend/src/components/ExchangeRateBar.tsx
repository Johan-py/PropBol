import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  Info,
} from "lucide-react";

interface ExchangeRateBarProps {
  officialRate: number;
  referentialRate: number | null;
  updatedAt: string;
  isLoading?: boolean;
}

export default function ExchangeRateBar({
  officialRate,
  referentialRate,
  updatedAt,
  isLoading = false,
}: ExchangeRateBarProps) {
  const isHigher = referentialRate !== null && referentialRate > officialRate;
  const isLower = referentialRate !== null && referentialRate < officialRate;
  const TrendIcon = isHigher ? ArrowUpRight : ArrowDownRight;

  if (isLoading) {
    return (
      <section
        aria-label="Cargando tipo de cambio"
        className="w-full border-b border-stone-200 bg-white/95"
      >
        <div className="mx-auto flex max-w-[1600px] animate-pulse flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-4 w-64 rounded-full bg-stone-200" />
          <div className="h-4 w-36 rounded-full bg-stone-200" />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Barra referencial de tipo de cambio"
      className="w-full border-b border-stone-200 bg-white/95"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 text-sm text-stone-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex items-center gap-2 font-medium">
            <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
            Tipo de Cambio:
          </span>
          <span>
            Oficial:{" "}
            <strong className="text-stone-900">
              Bs {officialRate.toFixed(2)}
            </strong>
          </span>
          <span className="hidden text-stone-300 sm:inline">|</span>
          <span className="flex items-center gap-1 text-[#D97706]">
            Referencial:{" "}
            <strong>
              {referentialRate === null
                ? "No disponible"
                : `Bs ${referentialRate.toFixed(2)}`}
            </strong>
            {(isHigher || isLower) && <TrendIcon className="h-4 w-4" />}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 sm:text-sm">
          <div
            className="group relative flex items-center"
            aria-label="Información sobre tipo de cambio"
            title="Información sobre tipo de cambio"
          >
            <Info className="h-4 w-4" />
            <div className="pointer-events-none absolute right-0 top-6 z-10 hidden w-64 rounded-2xl bg-stone-900 px-4 py-3 text-left text-xs leading-5 text-white shadow-xl group-hover:block group-focus-within:block">
              El tipo oficial es el valor regulado. El referencial refleja un
              valor de mercado actualizado.
            </div>
          </div>
          <span>Actualizado al {updatedAt}</span>
        </div>
      </div>
    </section>
  );
}
