'use client'

import { useAccessibility } from '@/hooks/useAccessibility'
import {ThemeProvider as NextThemeProvider} from 'next-themes'
import { useEffect } from 'react'
import type { PropsWithChildren } from 'react'

type ThemeProviderProps = PropsWithChildren<{
    defaultTheme?: 'light' | 'dark' | 'system'
}>

function AccessibilityProvider({ children }: { children: React.ReactNode}) {
    useAccessibility()
    return <>{children}</>
}  
 
export default function ThemeProvider({ children, defaultTheme = 'light'}: ThemeProviderProps) {
    return (
        <NextThemeProvider
        attribute="class"
        defaultTheme={defaultTheme}
        storageKey="propbol-theme"
        enableSystem={false}
        disableTransitionOnChange
    >
        <AccessibilityProvider>
            {children}
            {/* Ensure legacy CSS selectors that expect `propbol-theme-dark` stay in sync with `dark` class */}
            <ThemeClassAlias />
        </AccessibilityProvider>
    </NextThemeProvider>
    )
}

function ThemeClassAlias() {
    useEffect(() => {
        const sync = () => {
            const hasDark = document.documentElement.classList.contains('dark');
            if (hasDark) document.documentElement.classList.add('propbol-theme-dark');
            else document.documentElement.classList.remove('propbol-theme-dark');
        };

        sync();
        const obs = new MutationObserver(sync);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);
    return null;
}