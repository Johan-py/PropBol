import { HomeBanner } from '@/components/home/HomeBanner'
import { HomeCarousel } from '@/components/home/HomeCarousel'
import ExploreSection from '@/components/layout/ExploreSection'
import FilterPanel from '@/components/rentals/FilterPanel'
interface BannerRaw {
  id: number
  url_imagen: string
  titulo?: string
  subtitulo?: string
}

interface BannerData {
  id: number
  urlImagen: string
  titulo?: string
  subtitulo?: string
}

const fetchBanners = async (): Promise<BannerData[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  try {
    const response = await fetch(`${apiUrl}/api/banners`, {
      // Revalidación ISR
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Error HTTP al obtener banners: ${response.status}`)
    }

    const data: BannerRaw[] = await response.json()

    // Mapear snake_case del backend → camelCase esperado por los componentes
    return data.map((b) => ({
      id: b.id,
      urlImagen: b.url_imagen,
      titulo: b.titulo,
      subtitulo: b.subtitulo
    }))
  } catch (error) {
    console.error('Error cargando el banner:', error)
    return []
  }
}

export default async function Home() {
  const banners = await fetchBanners()
  const mainBanner = banners[0] // Tomamos el primero de la base de datos
  // No toquen esto :v
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      {banners.length > 0 ? (
        <HomeCarousel banners={banners} />
      ) : (
        <div className="w-full h-[300px] flex items-center justify-center bg-gray-200">
          <p className="text-gray-600">No hay banners disponibles</p>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div className="w-full  max-w-[1600px] mx-auto px-0 md:px-4 py-4">
        <div className="flex flex-col gap-0">
          {/* EXPLORE SECTION */}
          <section className="w-full">
            <ExploreSection />
          </section>
        </div>
      </div>
    </main>
  )
}
