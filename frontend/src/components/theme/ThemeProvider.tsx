'use client'

import {ThemeProvider as NextThemeProvider} from 'next-themes'
import type { PropsWithChildren } from 'react'

type ThemeProviderProps = PropsWithChildren<{
    defaultTheme?: 'ligth' | 'dark' | 'system'
}>

export default function ThemeProvider({ children, defaultTheme = 'system'}: ThemeProviderProps){
    return (
        <NextThemeProvider
        attribute="class"
        defaultTheme={defaultTheme}
        enableSystem
        disableTransitionOnChange
    >
        {children}
    </NextThemeProvider>
    )
}