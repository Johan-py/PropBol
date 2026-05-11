
"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeOption = "light" | "dark";

const THEME_STORAGE_KEY = "propbol-theme";
const THEME_CLASSES = ["propbol-theme-light", "propbol-theme-dark"];

function isThemeOption(value: string | null): value is ThemeOption {
    return value === "light" || value === "dark";
}

function applyThemeClass(selectedTheme: ThemeOption) {
    const root = document.documentElement;

    root.classList.remove(...THEME_CLASSES);
    root.classList.add(`propbol-theme-${selectedTheme}`);
}

export default function ThemeToggleButton() {
    const [theme, setTheme] = useState<ThemeOption>("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

        if (isThemeOption(savedTheme)) {
            setTheme(savedTheme);
            applyThemeClass(savedTheme);
            return;
        }

        applyThemeClass("light");
    }, []);

    const handleToggleTheme = () => {
        const nextTheme: ThemeOption = theme === "dark" ? "light" : "dark";

        setTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyThemeClass(nextTheme);
    };

    const isDarkMode = theme === "dark";

    return (
        <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
        >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}

            <span>{isDarkMode ? "Modo claro" : "Modo oscuro"}</span>
        </button>
    );
}