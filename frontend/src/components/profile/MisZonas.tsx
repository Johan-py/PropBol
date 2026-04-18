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

export default function MisZonas() {
  const [zonas, setZonas] = useState<Zona[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nombreEditado, setNombreEditado] = useState('')
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<number | null>(null)
  const [zonaActiva, setZonaActiva] = useState<Zona | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalNuevaZona, setModalNuevaZona] = useState(false)
  const [nombreNuevaZona, setNombreNuevaZona] = useState('')
  const [referenciaNuevaZona, setReferenciaNuevaZona] = useState('')