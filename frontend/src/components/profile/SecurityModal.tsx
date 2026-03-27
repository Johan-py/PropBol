'use client'; // <-- Mantenemos la directiva de cliente

import React, { useState } from 'react';
// Importamos el icono de Candado (Lock) de lucide-react
import { Lock } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

export default function SecurityModal({ isOpen, onClose, onSubmit }: SecurityModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, ingresa tu contraseña para continuar.');
      return;
    }
    setError('');
    onSubmit(password);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* 1. CAMBIO: border-orange-500 -> border-blue-600 (Grosor de borde de 4px) */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 border-t-4 border-blue-600">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Seguridad Requerida</h2>
        <p className="text-sm text-gray-600 mb-4">
          Para editar tu correo electrónico, necesitamos verificar tu identidad.
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* Contenedor relativo para posicionar el candado dentro */}
          <div className="relative mb-1">
            
            {/* Inyectamos el icono del Candado */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" /> {/* Tamaño y color gris suave */}
            </div>

            {/* Input para la contraseña */}
            <input
              type="password"
              // Hemos mantenido 'pl-10' (padding-left) para el espacio del icono
              // 2. CAMBIO: focus:ring-orange-500 -> focus:ring-blue-600 (Anillo de enfoque azul al escribir)
              className="w-full border border-gray-300 p-2 pl-10 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Ingresa tu contraseña actual"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          
          <div className="flex justify-end gap-3 mt-5">
            {/* El botón Cancelar se mantiene con un color neutro (gris) para mejor jerarquía visual */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            {/* El botón principal de confirmación ahora es azul */}
            {/* 3. CAMBIO: bg-orange-500 -> bg-blue-600, hover:bg-orange-600 -> hover:bg-blue-700 */}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Verificar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}