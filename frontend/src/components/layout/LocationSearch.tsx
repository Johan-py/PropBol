'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X } from 'lucide-react';

export function LocationSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/locations/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error conectando con el backend:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchLocations, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full relative" ref={containerRef}>
      <label className="block text-sm font-medium text-stone-700 mb-2 text-center uppercase tracking-wide font-montserrat">
        Ciudad / Zona
      </label>

      <div className={`h-[46px] rounded-xl border transition-all flex items-center gap-3 px-4 bg-white shadow-sm ${
        isOpen && suggestions.length > 0 ? 'border-amber-600 ring-2 ring-amber-100' : 'border-stone-300'
      }`}>
        <MapPin className={`w-5 h-5 ${query ? 'text-amber-600' : 'text-stone-400'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cochabamba, La Paz..."
          className="w-full bg-transparent outline-none text-sm text-stone-900 placeholder:text-stone-400 font-inter"
        />
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
        ) : query && (
          <button onClick={() => setQuery('')} type="button">
            <X className="w-4 h-4 text-stone-400 hover:text-red-500" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => { setQuery(loc.nombre); setIsOpen(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-amber-50 transition-colors text-left border-b border-stone-50 last:border-0"
            >
              <div className="bg-stone-100 p-1.5 rounded-lg">
                <Search className="w-3.5 h-3.5 text-stone-500" />
              </div>
              <div>
                <span className="block text-sm font-bold text-stone-900 font-inter">{loc.nombre}</span>
                <span className="block text-[10px] text-stone-500 uppercase">{loc.departamento}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}