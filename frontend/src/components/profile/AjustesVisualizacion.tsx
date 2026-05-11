"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type ThemeOption = "light" | "dark";
type AccessibilityOption = "none" | "deuteranopia";

type VisualOptionCardProps = {
    title: string;
    description: string;
    icon: ReactNode;
    previewClassName: string;
    selected: boolean;
    onClick: () => void;
};

const THEME_STORAGE_KEY = "propbol-theme";
const ACCESSIBILITY_STORAGE_KEY = "propbol-accessibility";

const THEME_CLASSES = ["propbol-theme-light", "propbol-theme-dark"];
const ACCESSIBILITY_CLASSES = [
    "propbol-accessibility-none",
    "propbol-accessibility-deuteranopia",
];

function isThemeOption(value: string | null): value is ThemeOption {
    return value === "light" || value === "dark";
}

function isAccessibilityOption(
    value: string | null
): value is AccessibilityOption {
    return value === "none" || value === "deuteranopia";
}

function VisualOptionCard({
    title,
    description,
    icon,
    previewClassName,
    selected,
    onClick,
}: VisualOptionCardProps) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onClick}
            className={`rounded-2xl border p-5 text-left shadow-sm transition hover:border-orange-300 ${selected
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white"
                }`}
        >
            <div
                className={`mb-4 flex h-24 items-center justify-center rounded-xl ${previewClassName}`}
            >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-3xl">
                    {icon}
                </div>
            </div>

            <div className="flex items-start gap-3">
                <span
                    className={`mt-1 h-4 w-4 rounded-full border ${selected
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300 bg-white"
                        }`}
                />

                <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
                </div>
            </div>
        </button>
    );
}

export default function AjustesVisualizacion() {
    const [theme, setTheme] = useState<ThemeOption>("light");
    const [accessibility, setAccessibility] =
        useState<AccessibilityOption>("none");

    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        const savedAccessibility = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);

        if (isThemeOption(savedTheme)) {
            setTheme(savedTheme);
        }

        if (isAccessibilityOption(savedAccessibility)) {
            setAccessibility(savedAccessibility);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        root.classList.remove(...THEME_CLASSES);
        root.classList.add(`propbol-theme-${theme}`);

        root.classList.remove(...ACCESSIBILITY_CLASSES);
        root.classList.add(`propbol-accessibility-${accessibility}`);
    }, [theme, accessibility]);

    const handleThemeChange = (selectedTheme: ThemeOption) => {
        setTheme(selectedTheme);
        localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
    };

    const handleAccessibilityChange = (
        selectedAccessibility: AccessibilityOption
    ) => {
        setAccessibility(selectedAccessibility);
        localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, selectedAccessibility);
    };

    return (
        <main className="propbol-visual-settings-page min-h-screen bg-[#f8f6f1] px-4 py-8 text-gray-900">
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
                            <VisualOptionCard
                                title="Modo claro"
                                description="Interfaz con fondo claro, ideal para ambientes bien iluminados durante el día."
                                icon="☀️"
                                previewClassName="bg-white"
                                selected={theme === "light"}
                                onClick={() => handleThemeChange("light")}
                            />

                            <VisualOptionCard
                                title="Modo oscuro"
                                description="Interfaz con fondo oscuro, ideal para reducir el cansancio visual en ambientes con poca luz."
                                icon="🌙"
                                previewClassName="bg-gray-900"
                                selected={theme === "dark"}
                                onClick={() => handleThemeChange("dark")}
                            />
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
                            <VisualOptionCard
                                title="Sin filtro"
                                description="Mantiene los colores originales de la plataforma."
                                icon="👁️"
                                previewClassName="bg-white"
                                selected={accessibility === "none"}
                                onClick={() => handleAccessibilityChange("none")}
                            />

                            <VisualOptionCard
                                title="Deuteranopia"
                                description="Ajuste visual orientado a mejorar la distinción de ciertos tonos para usuarios con daltonismo."
                                icon="🎨"
                                previewClassName="bg-amber-50"
                                selected={accessibility === "deuteranopia"}
                                onClick={() => handleAccessibilityChange("deuteranopia")}
                            />
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}