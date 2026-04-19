import { HomeBanner } from "@/components/home/HomeBanner";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import ExploreSection from "@/components/layout/ExploreSection";
import VisualFiltersSection from "@/components/VisualFilters/VisualFiltersSection";
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
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      throw new Error(`Error HTTP al obtener banners: ${response.status}`)
    }

    return await response.json()
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
        <div className="w-full px-2 md:px-6 py-12 flex flex-col items-center gap-12">
          {/* EXPLORE SECTION */}
           <section className="w-full flex justify-center">
             <ExploreSection />
             </section>

        {/* FILTROS VISUALES*/}
         <section className="w-full">
          <VisualFiltersSection />
          </section>
          </div>
    </main>
  )
}
