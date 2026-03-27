import dynamic from 'next/dynamic';
import SearchSidebar from '@/components/SearchSidebar';

// El mapa del otro equipo (lo mantenemos intacto)
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function BusquedaMapa() {
  return (
    // Contenedor Flex para dividir la pantalla
    <div className="flex w-full h-screen overflow-hidden">
      
      {/* Tu componente (Panel izquierdo) */}
      <SearchSidebar />

      {/* El componente del otro equipo (Mapa a la derecha) */}
      <div className="w-2/3 h-full relative z-0">
        <MapView />
      </div>

    </div>
  );
}