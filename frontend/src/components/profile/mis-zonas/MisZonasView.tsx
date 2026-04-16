'use client'

import ZonesList from '@/components/profile/mis-zonas/ZonesList'

export default function MisZonasView() {
  return (
    <section className="p-6">
      <h1>Mis Zonas</h1>
      <ZonesList zones={[]} onSelect={() => {}} />
    </section>
  )
}
