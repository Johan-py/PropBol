import { Zone } from '@/types/zone'

interface ZoneItemProps {
  zone: Zone
  onSelect: (zoneId: string) => void
}

export default function ZoneItem({ zone, onSelect }: ZoneItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(zone.id)}
      className={`w-full rounded-xl border p-4 text-left transition ${
        zone.isActive
          ? 'border-amber-500 bg-amber-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{zone.name}</h3>
          <p className="mt-1 text-xs text-gray-500">{zone.reference}</p>
        </div>

        {zone.isActive && (
          <span className="rounded-full bg-amber-500 px-2 py-1 text-[10px] font-semibold text-white">
            Activa
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <span className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600">
          Editar
        </span>
        <span className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600">
          Eliminar
        </span>
      </div>
    </button>
  )
}
