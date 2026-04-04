import { Suspense } from 'react' // 1. Importamos Suspense
import { ResultadosBusqueda } from '../../components/busqueda/ResultadosBusqueda'

export default function BusquedaPage() {
  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo */}
      <div className="w-[310px] min-h-[651px] bg-white p-4 overflow-y-auto flex-shrink-0">
        {/* 2. Envolvemos en Suspense para que Vercel no de error de Prerender */}
        <Suspense fallback={<p className="p-4 text-gray-500">Cargando resultados...</p>}>
          <ResultadosBusqueda />
        </Suspense>
      </div>
      
      {/* Panel derecho */}
      <div className="flex-1 bg-gray-100">
        {/* Aquí irá el mapa */}
      </div>
    </div>
  )
}