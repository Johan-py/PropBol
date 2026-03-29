"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { mockProperties } from "@/data/properties";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function BusquedaMapaPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  const [selectedType, setSelectedType] = useState("todos");
  const [operationType, setOperationType] = useState("todos");
  const [rooms, setRooms] = useState("todos");
  const [bathrooms, setBathrooms] = useState("todos");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 🔍 FILTRO COMPLETO
  const filteredProperties = mockProperties.filter((p) => {
    if (selectedType !== "todos" && p.type !== selectedType) return false;
    if (operationType !== "todos" && p.operation !== operationType)
      return false;
    if (rooms !== "todos" && p.rooms < Number(rooms)) return false;
    if (bathrooms !== "todos" && p.bathrooms < Number(bathrooms)) return false;
    return true;
  });

  // scroll automático
  useEffect(() => {
    if (selectedPropertyId && itemRefs.current[selectedPropertyId]) {
      itemRefs.current[selectedPropertyId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedPropertyId]);

  // limpiar selección
  useEffect(() => {
    setSelectedPropertyId(null);
  }, [selectedType, operationType, rooms, bathrooms]);

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <aside
        className={`bg-white border-r overflow-y-auto transition-all ${isSidebarOpen ? "w-[30%]" : "w-0"}`}
      >
        {/* HEADER */}
        <div className="p-3 border-b sticky top-0 bg-white z-10">
          {/* BUSCADOR */}
          <div className="flex gap-2">
            <input
              placeholder="Busca por ubicación o palabra clave"
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button className="bg-orange-400 text-white px-3 py-2 rounded">
              Buscar
            </button>
          </div>

          {/* FILTROS */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="todos">Operación</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
              <option value="anticretico">Anticrético</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="todos">Tipo</option>
              <option value="casa">Casa</option>
              <option value="departamento">Departamento</option>
              <option value="terreno">Terreno</option>
              <option value="local">Local</option>
            </select>

            <select
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="todos">Habitaciones</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>

            <select
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="todos">Baños</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>
        </div>

        {/* LISTA */}
        <div className="p-3 space-y-3">
          {filteredProperties.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              😕 Sin resultados encontrados
            </div>
          )}

          {filteredProperties.map((property) => (
            <div
              key={property.id}
              ref={(el) => (itemRefs.current[property.id] = el)}
              onClick={() => setSelectedPropertyId(property.id)}
              className={`flex gap-3 p-2 rounded-xl border cursor-pointer transition hover:shadow-md ${
                selectedPropertyId === property.id
                  ? "bg-green-200 border-green-500"
                  : "bg-white"
              }`}
            >
              <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-200">
                <img
                  src="https://picsum.photos/200/150"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="font-bold text-sm">
                  US$ {property.price.toLocaleString()}
                </p>

                <p className="text-xs text-gray-500">{property.title}</p>

                <p className="text-xs text-gray-400 capitalize">
                  {property.type} • {property.operation}
                </p>

                <div className="flex gap-3 text-xs mt-1 text-gray-500">
                  <span>🛏 {property.rooms}</span>
                  <span>🛁 {property.bathrooms}</span>
                  <span>📐 110m²</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAPA */}
      <div className="flex-1 relative">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 left-0 z-[1000] bg-white shadow-md px-3 py-2 rounded-r-xl border"
        >
          {isSidebarOpen ? "←" : "→"}
        </button>

        <MapView
          properties={filteredProperties}
          selectedId={selectedPropertyId}
          onSelect={setSelectedPropertyId}
        />
      </div>
    </div>
  );
}
