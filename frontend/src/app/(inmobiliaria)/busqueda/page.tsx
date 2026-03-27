import { ResultadosBusqueda } from '@/components/busqueda/ResultadosBusqueda'

export const metadata = {
  title: 'Buscar Inmuebles | PropBol',
  description: 'Conéctate con tu próximo hogar en PropBol. Filtra y ordena los mejores inmuebles.'
}

export default function BusquedaPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header estático simulado para la prueba visual */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600 tracking-tight">PropBol</div>
          <div className="flex gap-4">
            <span className="text-gray-500 font-medium cursor-pointer hover:text-gray-900">
              Comprar
            </span>
            <span className="text-gray-500 font-medium cursor-pointer hover:text-gray-900">
              Alquilar
            </span>
          </div>
        </div>
      </header>

      {/* Contenido principal: Búsqueda */}
      <div className="flex-grow">
        <ResultadosBusqueda />
      </div>
    </main>
  )
}
