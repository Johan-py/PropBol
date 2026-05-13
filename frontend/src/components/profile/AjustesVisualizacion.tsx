"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAccessibility } from "@/hooks/useAccessibility";
import type { AccessibilityOption } from "@/hooks/useAccessibility";

type ThemeOption = "light" | "dark";

type ThemeCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  preview: "light" | "dark";
};

type AccessibilityCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  colors: string[];
  icon: string;
};

function MiniBrowserPreview({ mode }: { mode: "light" | "dark" }) {
  const isDark = mode === "dark";
  return (
    <div
      className={`visual-option-preview w-full overflow-hidden rounded-xl border ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 px-3 py-2 ${
          isDark ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div
          className={`ml-2 h-2 w-24 rounded-full ${
            isDark ? "bg-gray-600" : "bg-gray-300"
          }`}
        />
      </div>
      <div className="space-y-2 p-4">
        <div
          className={`h-3 w-3/4 rounded-full ${
            isDark ? "bg-gray-700" : "bg-gray-200"
          }`}
        />
        <div
          className={`h-2 w-full rounded-full ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        />
        <div
          className={`h-2 w-5/6 rounded-full ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        />
        <div className="mt-3 flex gap-2">
          <div className="h-6 w-16 rounded-lg bg-orange-400" />
          <div
            className={`h-6 w-16 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ title, description, selected, onClick, preview }: ThemeCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`group flex flex-col gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md ${
        selected
          ? "border-orange-500 bg-orange-50/60"
          : "border-gray-200 bg-white hover:border-orange-200"
      }`}
    >
      <MiniBrowserPreview mode={preview} />
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            selected
              ? "border-orange-500 bg-orange-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {selected && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </span>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-0.5 text-sm leading-5 text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
}


            /*
            className={`rounded-2xl border p-5 text-left shadow-sm transition hover:border-orange-300 ${selected
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white"
                }`}
        >
            <div
                className={`visual-option-preview mb-4 flex h-24 items-center justify-center rounded-xl ${previewClassName}`}
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
        const handleThemeChangeFromNavbar = (event: Event) => {
            const customEvent = event as CustomEvent<ThemeOption>;

            if (isThemeOption(customEvent.detail)) {
                setTheme(customEvent.detail);
            }
        };

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === THEME_STORAGE_KEY && isThemeOption(event.newValue)) {
                setTheme(event.newValue);
            }
        };

        window.addEventListener("propbol-theme-change", handleThemeChangeFromNavbar);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener(
                "propbol-theme-change",
                handleThemeChangeFromNavbar
            );
            window.removeEventListener("storage", handleStorageChange);
        };
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

        window.dispatchEvent(
            new CustomEvent("propbol-theme-change", {
                detail: selectedTheme,
            })
        );
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
}*/