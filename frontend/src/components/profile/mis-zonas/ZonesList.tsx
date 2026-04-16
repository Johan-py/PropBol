interface ZonesListProps {
  zones: { id: string; name: string }[]
  onSelect: (zoneId: string) => void
}

export default function ZonesList({ zones, onSelect }: ZonesListProps) {
  if (!zones.length) {
    return <div>No hay zonas</div>
  }

  return (
    <div>
      {zones.map((zone) => (
        <button key={zone.id} onClick={() => onSelect(zone.id)}>
          {zone.name}
        </button>
      ))}
    </div>
  )
}
