
"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeOption = "light" | "dark";

const THEME_STORAGE_KEY = "propbol-theme";
const THEME_CLASSES = ["propbol-theme-light", "propbol-theme-dark"];

function isThemeOption(value: string | null): value is ThemeOption {
    return value === "light" || value === "dark";
}

function applyTheme(theme: ThemeOption) {
    const root = document.documentElement;

    root.classList.remove(...THEME_CLASSES);
    root.classList.add(`propbol-theme-${theme}`);

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    window.dispatchEvent(
        new CustomEvent("propbol-theme-change", {
            detail: theme,
        })
    );
}

export default function ThemeToggleButton() {
    const [theme, setTheme] = useState<ThemeOption>("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

        if (isThemeOption(savedTheme)) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
            return;
        }

        applyTheme("light");
    }, []);

    useEffect(() => {
        const handleThemeChange = (event: Event) => {
            const customEvent = event as CustomEvent<ThemeOption>;

            if (isThemeOption(customEvent.detail)) {
                setTheme(customEvent.detail);
            }
        };

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === THEME_STORAGE_KEY && isThemeOption(event.newValue)) {
                setTheme(event.newValue);
                applyTheme(event.newValue);
            }
        };

        window.addEventListener("propbol-theme-change", handleThemeChange);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("propbol-theme-change", handleThemeChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const handleToggleTheme = () => {
        const nextTheme: ThemeOption = theme === "dark" ? "light" : "dark";

        setTheme(nextTheme);
        applyTheme(nextTheme);
    };

    const isDarkMode = theme === "dark";

    return (
        <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={
                isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
            }
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-400 hover:text-orange-600"
        >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}

            <span>{isDarkMode ? "Modo claro" : "Modo oscuro"}</span>
        </button>
    );
}