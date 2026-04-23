<<<<<<< HEAD
import { HomeCarousel } from '@/components/home/HomeCarousel'
import FeaturedCitiesSection from '@/components/home/FeaturedCitiesSection'
import ExploreSection from '@/components/layout/ExploreSection'
import { getCities } from '@/services/city.service'
import dynamic from 'next/dynamic'

const TourGuiado = dynamic(() => import('@/components/ui/TourGuiado'), { ssr: false })

=======
import { HomeCarousel } from "@/components/home/HomeCarousel";
import FeaturedCitiesSection from "@/components/home/FeaturedCitiesSection";
import ExploreSection from "@/components/layout/ExploreSection";
import { getCities } from "@/services/city.service";
import VisualFiltersSection from "@/components/VisualFilters/VisualFiltersSection";
import HomeBlogsSection from "@/components/home/HomeBlogsSection";
>>>>>>> origin/develop
interface BannerRaw {
  id: number;
  url_imagen: string;
  titulo?: string;
  subtitulo?: string;
}

interface BannerData {
  id: number;
  urlImagen: string;
  titulo?: string;
  subtitulo?: string;
}

const fetchBanners = async (): Promise<BannerData[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${apiUrl}/api/banners`, {
<<<<<<< HEAD
      cache: 'no-store'
    })
=======
      // Revalidación ISR
      cache: "no-store",
    });
>>>>>>> origin/develop

    if (!response.ok) {
      throw new Error(`Error HTTP al obtener banners: ${response.status}`);
    }

    const data: BannerRaw[] = await response.json();

    // Mapear snake_case del backend → camelCase esperado por los componentes
    return data.map((b) => ({
      id: b.id,
      urlImagen: b.url_imagen,
      titulo: b.titulo,
      subtitulo: b.subtitulo,
    }));
  } catch (error) {
    console.error("Error cargando el banner:", error);
    return [];
  }
};

export default async function Home() {
  const banners = await fetchBanners();
  const cities = await getCities();

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      <TourGuiado />

      {banners.length > 0 ? (
        <HomeCarousel banners={banners} />
      ) : (
        <div className="w-full h-[300px] flex items-center justify-center bg-gray-200">
          <p className="text-gray-600">No hay banners disponibles</p>
        </div>
      )}

      <div className="w-full max-w-[1600px] mx-auto px-0 md:px-4 py-4">
        <div className="flex flex-col gap-0">
<<<<<<< HEAD
=======
          {/* EXPLORE SECTION */}
>>>>>>> origin/develop
          <section className="w-full">
            <ExploreSection />
          </section>

          {/* TU SECCIÓN DE FILTROS VISUALES */}
          <section className="w-full">
            <VisualFiltersSection />
          </section>

          <section className="w-full">
            <FeaturedCitiesSection cities={cities} />
          </section>

          <section className="w-full">
            <HomeBlogsSection />
          </section>
        </div>
      </div>
    </main>
  );
}
