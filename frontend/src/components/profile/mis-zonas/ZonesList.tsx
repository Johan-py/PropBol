import ZoneItem from '@/components/profile/mis-zonas/ZoneItem'
import { Zone } from '@/types/zone'

interface ZonesListProps {
  zones: Zone[]
  onSelect: (zoneId: string) => void
}

export default function ZonesList({ zones, onSelect }: ZonesListProps) {
  if (!zones.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No hay zonas
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {zones.map((zone) => (
        <ZoneItem key={zone.id} zone={zone} onSelect={onSelect} />
      ))}
    </div>
  )
}
