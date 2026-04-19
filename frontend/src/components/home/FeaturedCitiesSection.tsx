export default function FeaturedCitiesSection() {
  return (
    <section className="px-6 py-10 sm:px-8 md:py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <h2 className="font-montserrat text-3xl font-bold text-stone-900 sm:text-4xl md:text-5xl">
          ¿Dónde quieres vivir?
        </h2>

        <p className="mt-3 max-w-2xl text-base text-stone-600 sm:text-lg">
          Explora las ciudades más buscadas
        </p>

        <div className="mt-8 w-full rounded-[2rem] border border-stone-200/80 bg-stone-50/60 px-6 py-12">
          {/* Carrusel va aquí */}
        </div>
      </div>
    </section>
  )
}
