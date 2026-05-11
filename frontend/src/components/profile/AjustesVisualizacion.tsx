
"use client";

export default function AjustesVisualizacion() {
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

                    <section className="mt-8">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Modo de apariencia
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Elige el tema visual que prefieras.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <article className="rounded-2xl border border-orange-500 bg-orange-50 p-5 shadow-sm">
                                <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-white">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-3xl">
                                        ☀️
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="mt-1 h-4 w-4 rounded-full border border-orange-500 bg-orange-500" />

                                    <div>
                                        <h3 className="font-semibold text-gray-900">Modo claro</h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Interfaz con fondo claro, ideal para ambientes bien
                                            iluminados durante el día.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300">
                                <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-gray-900">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-3xl">
                                        🌙
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="mt-1 h-4 w-4 rounded-full border border-gray-300 bg-white" />

                                    <div>
                                        <h3 className="font-semibold text-gray-900">Modo oscuro</h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Interfaz con fondo oscuro, ideal para reducir el cansancio
                                            visual en ambientes con poca luz.
                                        </p>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="mt-10">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Accesibilidad - Daltonismo
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Aplica un filtro de color para mejorar la experiencia visual
                                según tu tipo de visión.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <article className="rounded-2xl border border-orange-500 bg-orange-50 p-5 shadow-sm">
                                <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-white">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-3xl">
                                        👁️
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="mt-1 h-4 w-4 rounded-full border border-orange-500 bg-orange-500" />

                                    <div>
                                        <h3 className="font-semibold text-gray-900">Sin filtro</h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Mantiene los colores originales de la plataforma.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300">
                                <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-amber-50">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl">
                                        🎨
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="mt-1 h-4 w-4 rounded-full border border-gray-300 bg-white" />

                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Deuteranopia
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            Ajuste visual orientado a mejorar la distinción de ciertos
                                            tonos para usuarios con daltonismo.
                                        </p>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>

                    <div className="mt-8 rounded-xl border border-dashed border-orange-300 bg-orange-50 p-5">
                        <p className="text-sm font-medium text-orange-700">
                            Subtarea 4 completada: componente de ajustes de visualización.
                        </p>
                        <p className="mt-1 text-sm text-orange-600">
                            En la siguiente subtarea agregaremos selección visual al hacer
                            clic en las opciones.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}