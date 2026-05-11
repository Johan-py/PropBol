
export default function AjustesVisualizacionPage() {
    return (
        <main className="min-h-screen bg-[#f8f6f1] px-4 py-8 text-gray-900">
            <section className="mx-auto w-full max-w-5xl">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
                    <p className="text-sm font-semibold text-orange-600">Mi Perfil</p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Ajustes de Visualización
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                        Personaliza la apariencia de la plataforma y configura opciones de
                        accesibilidad visual para mejorar tu experiencia de navegación.
                    </p>

                    <div className="mt-8 rounded-xl border border-dashed border-orange-300 bg-orange-50 p-5">
                        <p className="text-sm font-medium text-orange-700">
                            Vista base HU13 creada correctamente.
                        </p>
                        <p className="mt-1 text-sm text-orange-600">
                            En las siguientes subtareas agregaremos modo claro, modo oscuro y
                            accesibilidad para daltonismo.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}