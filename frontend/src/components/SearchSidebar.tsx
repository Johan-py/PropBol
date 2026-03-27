import HeaderPanel from '@/components/galeria/HeaderPanel';

export default function SearchSidebar() {
  return (
    <div className="w-1/3 h-full bg-white shadow-xl overflow-y-auto z-10 relative flex flex-col">
      
      {/* AQUÍ ESTÁ LA MAGIA: Llamamos al componente de Rodrigo */}
      <HeaderPanel />
      
      {/* Área principal de resultados */}
      <div className="p-4 flex-1 bg-gray-50">
        <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center text-gray-400">
          Resultados de Inmuebles
        </div>
      </div>
    </div>
  );
}