'use client';
import React, { useState } from 'react';

interface GuestPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuestPreferencesModal: React.FC<GuestPreferencesModalProps> = ({ isOpen, onClose }) => {
  const [genero, setGenero] = useState('');
  const [edad, setEdad] = useState('');
  const [zona, setZona] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    // Aquí guardamos los datos temporalmente en localStorage
    // El backend los tomará de aquí para guardarlos en el meta_data del modelo Visitor
    const preferencias = { genero, edad, zona };
    localStorage.setItem('guest_preferences', JSON.stringify(preferencias));
    console.log("Preferencias de invitado guardadas:", preferencias);
    
    alert('¡Preferencias guardadas! Te mostraremos mejores resultados.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-500">
      {/* Usamos el mismo color de fondo crema de tu ProfileCard */}
      <div className="bg-[#fdf6e6] rounded-xl shadow-2xl max-w-md w-full p-7 m-4 border border-[#e5dfd7]">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#292524]">
            Tus Preferencias
          </h2>
          <p className="text-sm text-stone-500 mt-2">Ayúdanos a filtrar lo mejor para ti.</p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          {/* GÉNERO - Ajustado al Enum de Prisma */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Género:</label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="px-3 py-2 rounded text-sm bg-white border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Seleccione...</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="OTRO">Otro</option>
              <option value="PREFIERO_NO_DECIR">Prefiero no decirlo</option>
            </select>
          </div>

          {/* EDAD */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Rango de Edad:</label>
            <select
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className="px-3 py-2 rounded text-sm bg-white border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Seleccione...</option>
              <option value="18-25">18 - 25 años</option>
              <option value="26-35">26 - 35 años</option>
              <option value="36-45">36 - 45 años</option>
              <option value="46-60">46 - 60 años</option>
              <option value="60+">Más de 60 años</option>
            </select>
          </div>

          {/* ZONA DE INTERÉS */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Zona de interés:</label>
            <input
              type="text"
              placeholder="Ej. Zona Norte, Cala Cala..."
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="px-3 py-2 rounded text-sm bg-white border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 font-semibold">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-stone-500 hover:text-stone-700 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button 
            className="px-5 py-2 bg-[#D97706] text-white rounded-md hover:bg-[#b45309] transition-all shadow-md active:scale-95 text-sm"
            onClick={handleSave}
          >
            Guardar preferencias
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestPreferencesModal;