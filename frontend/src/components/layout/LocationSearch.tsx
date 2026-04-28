'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { MapPin, Loader2, X, History, Search } from 'lucide-react'
import { usePopularidad } from '@/hooks/usePopularidad'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import { useDebounce } from 'use-debounce'

type LocationSearchProps = {
  value: string
  onChange: (data: string | { nombre: string, lat?: number, lng?: number }) => void
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const [isAuth, setIsAuth] = useState(false)
  const { updateFilters } = useSearchFilters()
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Estados para Mapbox
  const [inputValue, setInputValue] = useState(value)
  const [debouncedValue] = useDebounce(inputValue, 400)
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [isSearchingMapbox, setIsSearchingMapbox] = useState(false)

  const recalcDropdown = () => {
    if (!containerRef.current) return
    setDropdownStyle({
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      width: '100%',
      zIndex: 50
    })
  }

  useEffect(() => {
    if (!isOpen) return
    const frame1 = requestAnimationFrame(() => {
      requestAnimationFrame(recalcDropdown)
    })
    return () => cancelAnimationFrame(frame1)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('resize', recalcDropdown)
    window.addEventListener('scroll', recalcDropdown, true)
    return () => {
      window.removeEventListener('resize', recalcDropdown)
      window.removeEventListener('scroll', recalcDropdown, true)
    }
  }, [isOpen])

  // --- PERSISTENCIA: Sincronización robusta de historial ---
  useEffect(() => {
    const syncHistory = async () => {
      const token = localStorage.getItem("token")
      const saved = localStorage.getItem('searchHistory')
      if (saved) setHistory(JSON.parse(saved))

      if (!token) {
        setIsAuth(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/api/perfil/historial-busqueda`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (res.ok) {
          const data = await res.json()
          const remoteHistory = data
            .map((h: any) => typeof h === 'string' ? h : h.termino)
            .filter((item: string, index: number, self: string[]) => self.indexOf(item) === index)
          
          setHistory(remoteHistory)
          localStorage.setItem('searchHistory', JSON.stringify(remoteHistory))
          setIsAuth(true)
        } else if (res.status === 401 || res.status === 403) {
          setIsAuth(false)
        }
      } catch (error) {
        console.error("Error cargando historial remoto:", error)
      }
    }

    syncHistory()

    const handleSessionChange = () => syncHistory()
    window.addEventListener('propbol:session-changed', handleSessionChange)
    window.addEventListener('propbol:login', handleSessionChange)

    return () => {
      window.removeEventListener('propbol:session-changed', handleSessionChange)
      window.removeEventListener('propbol:login', handleSessionChange)
    }
  }, [])

  const saveToHistory = async (item: string) => {
    if (!item.trim()) return
    const updatedHistory = [item, ...history.filter((i) => i !== item)].slice(0, 20)
    setHistory(updatedHistory)
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))

    const token = localStorage.getItem("token")
    if (token) {
      try {
        await fetch(`${API_BASE}/api/perfil/historial-busqueda`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ termino: item })
        })
      } catch (error) {
        console.error("Error guardando en BD:", error)
      }
    }
  }

  const handleDeleteItem = async (e: React.MouseEvent, term: string) => {
    e.stopPropagation()
    const updated = history.filter((h) => h !== term)
    setHistory(updated)
    localStorage.setItem('searchHistory', JSON.stringify(updated))

    const token = localStorage.getItem("token")
    if (token) {
      try {
        await fetch(`${API_BASE}/api/perfil/historial-busqueda/${encodeURIComponent(term)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (error) {
        console.error("Error eliminando en BD:", error)
      }
    }
  }

 // 🚀 BÚSQUEDA HÍBRIDA: MAPBOX + INTERSECCIONES CON OVERPASS API (V2 MEJORADA)
  useEffect(() => {
    const searchLocation = async () => {
      if (!debouncedValue || debouncedValue.length < 3) {
        setSuggestions([])
        return
      }

      setIsSearchingMapbox(true)
      try {
        // 1. 🕵️‍♂️ Detectamos si hay una intersección (Ej: "Heroinas y Ayacucho")
        const matchInterseccion = debouncedValue.match(/(.+?)\s+y\s+(.+)/i);

        if (matchInterseccion) {
          const calle1 = matchInterseccion[1].trim();
          const calle2 = matchInterseccion[2].trim();
          
          console.log(`🛣️ Buscando intersección: [${calle1}] con [${calle2}]`);

          // Truco Tech Lead: Ignoramos si el usuario puso tilde o no
          const ignorarTildes = (str: string) => {
            return str
              .replace(/[aAáÁ]/g, '[aAáÁ]')
              .replace(/[eEéÉ]/g, '[eEéÉ]')
              .replace(/[iIíÍ]/g, '[iIíÍ]')
              .replace(/[oOóÓ]/g, '[oOóÓ]')
              .replace(/[uUúÚüÜ]/g, '[uUúÚüÜ]');
          };

          const r1 = ignorarTildes(calle1);
          const r2 = ignorarTildes(calle2);

          // Bounding Box estricto de la ciudad de Cochabamba (Sur, Oeste, Norte, Este)
          const bbox = "-17.519,-66.368,-17.288,-65.986";

          // Consulta optimizada para encontrar el vértice ("node") que comparten
          const overpassQuery = `
            [out:json][timeout:5];
            way["name"~"${r1}", i](${bbox})->.w1;
            way["name"~"${r2}", i](${bbox})->.w2;
            node(w.w1)(w.w2);
            out center;
          `;

          // Hacemos un POST en lugar de GET para que la URL no se rompa
          const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "data=" + encodeURIComponent(overpassQuery)
          });
          
          const data = await response.json();

          if (data.elements && data.elements.length > 0) {
            console.log("✅ ¡Cruce encontrado en OSM!");
            
            // Disfrazamos el resultado como si fuera Mapbox
            const intersecciones = data.elements.map((el: any, index: number) => ({
              id: `osm-${el.id || index}`,
              text: `${calle1.toUpperCase()} Y ${calle2.toUpperCase()}`,
              place_name: `Intersección (Cruce de calles), Cochabamba`,
              center: [el.lon, el.lat] // Mapbox usa longitud primero [lng, lat]
            }));
            
            setSuggestions(intersecciones);
            setIsSearchingMapbox(false);
            return; // 🛑 CORTAMOS AQUÍ para que Mapbox no sobreescriba esto
          } else {
            console.log("⚠️ OSM no encontró el cruce exacto, cayendo a Mapbox...");
          }
        }

        // 2. 🗺️ Si no buscó intersección (o si OSM no la encontró), usamos Mapbox
        const proximity = "-66.1568,-17.3937";
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedValue)}.json?access_token=${MAPBOX_TOKEN}&country=bo&bbox=-66.368,-17.519,-65.986,-17.288&types=address,poi,neighborhood,locality&proximity=${proximity}&language=es`
        
        const responseMapbox = await fetch(endpoint)
        const dataMapbox = await responseMapbox.json()
        
        if (dataMapbox.features) {
          setSuggestions(dataMapbox.features)
        }
      } catch (error) {
        console.error("❌ Error en búsqueda de ubicaciones:", error)
      } finally {
        setIsSearchingMapbox(false)
      }
    }

    searchLocation()
  }, [debouncedValue, MAPBOX_TOKEN])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    onChange(val)
    if (val.length > 0) setIsOpen(true)
    else setIsOpen(true) // Mostrar historial si está vacío
  }

  const handleSelectMapbox = (place: MapboxFeature) => {
    const lng = place.center[0]
    const lat = place.center[1]
    const nombre = place.text

    setInputValue(nombre)
    onChange({ nombre, lat, lng })
    saveToHistory(nombre)
    setIsOpen(false)

    setTimeout(() => {
      containerRef.current?.closest('form')?.requestSubmit()
    }, 100)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setInputValue(value)
  }, [value])

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className={`h-[40px] rounded-xl border transition-all flex items-center gap-3 px-4 bg-white shadow-sm ${isOpen ? 'border-orange-500 ring-1 ring-orange-500' : 'border-stone-200 hover:border-orange-500'}`}>
        <MapPin className={`w-5 h-5 flex-shrink-0 transition-colors ${inputValue ? 'text-orange-500' : 'text-stone-400'}`} />
        <div className="relative flex-1 flex items-center w-full h-full min-w-0">
          
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              setIsOpen(true)
              requestAnimationFrame(recalcDropdown)
            }}
            onKeyDown={(e) => e.key === 'Enter' && setIsOpen(false)}
            placeholder="Ej: Av. América, Plaza Colón, Cala Cala..."
            className="w-full bg-transparent outline-none text-sm text-stone-900 placeholder:text-stone-400 font-inter pr-[70px] h-full"
          />

          <div className="absolute right-0 flex items-center gap-2 bg-white pl-2 h-full">
            {typeof inputValue === 'string' && inputValue.includes('Bolivia') && <Image src="https://flagcdn.com/w20/bo.png" alt="BO" width={20} height={14} className="rounded-sm flex-shrink-0" />}
            {isSearchingMapbox ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500 flex-shrink-0" />
            ) : inputValue && (
              <button onClick={() => { onChange(''); setInputValue(''); setIsOpen(true); }} type="button" className="p-1 hover:bg-stone-100 rounded-full transition-colors flex-shrink-0 z-10">
                <X className="w-4 h-4 text-stone-400 hover:text-red-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div style={dropdownStyle} className="bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
          
          {/* HISTORIAL: Solo se muestra si no hay texto */}
          {inputValue === '' && history.length > 0 && (
            <div className="max-h-60 overflow-y-auto overscroll-contain">
              <div className="px-4 py-2 bg-stone-50 border-b border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Búsquedas recientes</span>
              </div>
              {(showAll ? history : history.slice(0, 5)).map((item, idx) => (
                <div key={`hist-${idx}`} className="group flex items-center justify-between hover:bg-orange-50 border-b border-stone-50 last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue(item)
                      onChange(item)
                      setIsOpen(false)
                      saveToHistory(item)
                      setTimeout(() => containerRef.current?.closest('form')?.requestSubmit(), 100)
                    }}
                    className="flex-1 px-4 py-3 flex items-center gap-3 text-left"
                  >
                    <History className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-sm text-stone-600">{item}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(e, item)}
                    className="pr-4 opacity-100 md:opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity p-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SUGERENCIAS DE MAPBOX */}
          {inputValue.length >= 3 && (
            <div className="max-h-[300px] overflow-y-auto">
              {suggestions.length > 0 ? (
                suggestions.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelectMapbox(place)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-50 transition-colors text-left border-b border-stone-50 last:border-0"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-stone-600 truncate">{place.text}</span>
                        <span className="text-xs text-stone-400 truncate">{place.place_name}</span>
                      </div>
                    </div>
                  </button>
                ))
              ) : !isSearchingMapbox ? (
                <div className="px-4 py-8 text-center bg-stone-50/50">
                  <p className="text-sm text-stone-600 font-medium">No se encontraron ubicaciones</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  )
}