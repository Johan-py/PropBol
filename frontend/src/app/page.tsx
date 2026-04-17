import { HomeBanner } from "@/components/home/HomeBanner";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import ExploreSection from "@/components/layout/ExploreSection";
import FilterPanel from "@/components/rentals/FilterPanel";
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
      // Revalidación ISR
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP al obtener banners: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error cargando el banner:", error);
    return [];
  }
};

export default async function Home() {
  const banners = await fetchBanners();
  // const mainBanner = banners[0]; // Tomamos el primero de la base de datos - This was removed as it's no longer used.
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

      {/* CONTENEDOR PRINCIPAL REORGANIZADO */}
      <div className="w-full max-w-screen-4xl mx-auto px-8 md:px-4 py-4">
        {/* Cambiamos a flex-col para que ExploreSection esté arriba y FilterPanel abajo */}
        <div className="flex flex-col gap-0">

          {/* EXPLORE SECTION (Ocupa el espacio superior y todo el ancho) */}
          <section className="w-full">
            <ExploreSection />
          </section>

          {/* FILTER PANEL (Se ubica debajo de los resultados) */}
          <div className="w-full border-t border-gray-200 pt-8">
            <FilterPanel />
          </div>
        </div>
      </div>
    </main>
  )
}
