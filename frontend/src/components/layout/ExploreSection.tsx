"use client";

import { useState } from 'react';
import { ComboBox } from "../ui/ComboBox";
import { Home, Square } from "lucide-react"; 

const searchOptions = [
  { id: "venta", name: "Venta" },
  { id: "alquiler", name: "Alquiler" },
  { id: "anticretico", name: "Anticrético" },
];

export default function ExploreSection() {
  const [selectedOption, setSelectedOption] = useState<string>("venta");

  const propertyTypes = ["Casas", "Departamentos", "Cuartos", "Terrenos", "Espacios Cementerio"];

  return (
    <section className="bg-white py-10 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="rounded-2xl bg-white p-6 shadow-xl border border-stone-100 flex flex-col gap-6">
          
          {/* Fila de Venta, Alquiler, Anticrético*/}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {searchOptions.map((option) => {
              const isSelected = selectedOption === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className="flex items-center gap-2.5 transition-colors duration-200 group focus:outline-none"
                >
                  <Square 
                    className={`w-5 h-5 transition-colors ${
                      isSelected 
                        ? 'text-amber-600 fill-amber-50' 
                        : 'text-stone-300 group-hover:text-amber-400'
                    }`} 
                  />
                  <span className={`font-semibold font-montserrat text-lg transition-colors ${
                    isSelected
                      ? 'text-amber-700' 
                      : 'text-stone-900 group-hover:text-amber-600'
                  }`}>
                    {option.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selector de tipo de inmueble */}
          <div className="w-full md:w-1/3">
            <ComboBox
              label="Tipo de Inmueble"
              placeholder="Cualquier tipo"
              options={propertyTypes}
              icon={Home} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}