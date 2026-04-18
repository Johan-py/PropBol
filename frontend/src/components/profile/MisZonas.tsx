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

  const getToken = () => localStorage.getItem('token')

  const cargarZonas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        setZonas([
          { id: 1, nombre: 'Zona Norte - Cochabamba', referencia: 'Cochabamba, Bolivia', activa: true, coordenadas: { lat: -17.3895, lng: -66.1568, zoom: 14 } },
          { id: 2, nombre: 'Cerca del Cristo de la Concordia', referencia: 'Cochabamba, Bolivia', activa: false, coordenadas: { lat: -17.4058, lng: -66.1423, zoom: 15 } },
          { id: 3, nombre: 'Cerca del Parque Fidel Anze', referencia: 'Cochabamba, Bolivia', activa: false, coordenadas: { lat: -17.3950, lng: -66.1600, zoom: 15 } },
        ])
        setIsLoading(false)
        return
      }
      const response = await fetch(`${API_URL}/api/perfil/zonas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.ok) {
        setZonas(data.zonas || [])
      } else {
        throw new Error(data.msg)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las zonas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarZonas() }, [])

  useEffect(() => {
    const activa = zonas.find(z => z.activa) || null
    setZonaActiva(activa)
  }, [zonas])

  const seleccionarZona = (zona: Zona) => {
    setZonaActiva(zona)
    localStorage.setItem('zonaSeleccionada', JSON.stringify(zona))
  }

  const guardarNuevaZona = async () => {
    if (!nombreNuevaZona.trim()) return
    setIsLoading(true)
    try {
      const token = getToken()
      const nuevaZona: Zona = {
        id: Date.now(),
        nombre: nombreNuevaZona,
        referencia: referenciaNuevaZona || 'Cochabamba, Bolivia',
        activa: false,
        coordenadas: { lat: -17.3895, lng: -66.1568, zoom: 14 }
      }
      if (token) {
        const response = await fetch(`${API_URL}/api/perfil/zonas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nombre: nombreNuevaZona, referencia: referenciaNuevaZona })
        })
        const data = await response.json()
        if (data.ok) nuevaZona.id = data.zona?.id || nuevaZona.id
      }
      setZonas(prev => [...prev, nuevaZona])
      setModalNuevaZona(false)
      setNombreNuevaZona('')
      setReferenciaNuevaZona('')
    } catch (err: any) {
      alert(err.message || 'Error al guardar zona')
    } finally {
      setIsLoading(false)
    }
  }

  const iniciarEdicion = (zona: Zona, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditandoId(zona.id)
    setNombreEditado(zona.nombre)
  }

  const guardarEdicion = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!nombreEditado.trim()) return
    setIsLoading(true)
    try {
      const token = getToken()
      if (token) {
        const response = await fetch(`${API_URL}/api/perfil/zonas/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nombre: nombreEditado })
        })
        const data = await response.json()
        if (!data.ok) throw new Error(data.msg)
      }
      setZonas(prev => prev.map(z => z.id === id ? { ...z, nombre: nombreEditado } : z))
      setEditandoId(null)
    } catch (err: any) {
      alert(err.message || 'Error al actualizar zona')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelarEdicion = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditandoId(null)
    setNombreEditado('')
  }

  const eliminarZona = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      const token = getToken()
      if (token) {
        const response = await fetch(`${API_URL}/api/perfil/zonas/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (!data.ok) throw new Error(data.msg)
      }
      setZonas(prev => prev.filter(z => z.id !== id))
      setConfirmandoEliminarId(null)
    } catch (err: any) {
      alert(err.message || 'Error al eliminar zona')
    } finally {
      setIsLoading(false)
    }
  }