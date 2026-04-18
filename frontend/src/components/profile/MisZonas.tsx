'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Pencil, Check, X, Loader2, MapPin, Plus } from 'lucide-react'
import nextDynamic from 'next/dynamic'

const MapaZonas = nextDynamic(() => import('./MapaZonas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-100 animate-pulse flex items-center justify-center text-stone-400 text-sm">
      Cargando mapa...
    </div>
  ),
})

interface Zona {
  id: number
  nombre: string
  referencia: string
  activa: boolean
  coordenadas?: { lat: number; lng: number; zoom: number }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'