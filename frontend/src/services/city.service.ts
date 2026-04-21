import { City } from "@/types/city"

const buildUnsplashUrl = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`

const cochabambaImages = [
  buildUnsplashUrl("photo-1460317442991-0ec209397118"),
  buildUnsplashUrl("photo-1448630360428-65456885c650"),
  buildUnsplashUrl("photo-1501594907352-04cda38ebc29"),
]

const santaCruzImages = [
  buildUnsplashUrl("photo-1431576901776-e539bd916ba2"),
  buildUnsplashUrl("photo-1494526585095-c41746248156"),
  buildUnsplashUrl("photo-1519501025264-65ba15a82390"),
]

const laPazImages = [
  buildUnsplashUrl("photo-1477959858617-67f85cf4f1df"),
  buildUnsplashUrl("photo-1500530855697-b586d89ba3ee"),
  buildUnsplashUrl("photo-1480714378408-67cf0d13bc1b"),
]

const staticCities: City[] = [
  {
    id: 1,
    name: "Cochabamba",
    slug: "cochabamba",
    locationReference: "Tupuraya, El Paso",
    description: "Zona con alta demanda de alquileres y residencias modernas.",
    images: cochabambaImages,
  },
  {
    id: 2,
    name: "Santa Cruz",
    slug: "santa-cruz",
    locationReference: "Urubó, La Guardia",
    description: "Ciudad vibrante con áreas comerciales y barrios en auge.",
    images: santaCruzImages,
  },
  {
    id: 3,
    name: "La Paz",
    slug: "la-paz",
    locationReference: "Calacoto, Zona Norte",
    description: "Oferta variada en alquiler y venta con vistas espectaculares.",
    images: laPazImages,
  },
]

export async function getCities(): Promise<City[]> {
  // Integracion temporal para HU-04.
  // Cuando el backend exponga /api/cities, reemplazar este retorno estatico
  // por una llamada desde app/page.tsx o desde este servicio.
  return staticCities
}
