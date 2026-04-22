import { HomeCarousel } from '@/components/home/HomeCarousel'
import FeaturedCitiesSection from '@/components/home/FeaturedCitiesSection'
import ExploreSection from '@/components/layout/ExploreSection'
import { getCities } from '@/services/city.service'
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
  const cities = await getCities()

  /*
    Integración futura:
    Cuando el backend exponga /api/cities con datos reales,
    la sección FeaturedCitiesSection seguirá consumiendo desde getCities().
  */

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

          <section className="w-full">
            <FeaturedCitiesSection cities={cities} />
          </section>
        </div>
      </div>
    </main>
  )
}
