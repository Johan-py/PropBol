import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function BusquedaMapa() {
  return (
    <div className="w-full h-screen">
      <MapView />
    </div>
  );
}
