'use client'; // <-- Importante en Next.js para usar useState y eventos

import React, { useState } from 'react';
import SecurityModal from './SecurityModal'; // <-- Importa tu nuevo Modal

export default function ProfileCard() {
  // 1. Estado para controlar si el modal está abierto o cerrado
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Estado para controlar si el campo de correo es editable o no
  const [isEmailEditable, setIsEmailEditable] = useState(false);

  // Esta función se ejecutará cuando el usuario ponga la contraseña en el modal
  const handlePasswordSubmit = (password: string) => {
    // Aquí es donde luego conectarás con el backend para verificar la contraseña.
    console.log("Validando contraseña:", password);

    // Por ahora, simulamos que es correcta: desbloqueamos el input y cerramos el modal.
    setIsEmailEditable(true);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gray-100 p-8 rounded-xl flex gap-10 items-center">

      {/* LADO IZQUIERDO (Sin cambios) */}
      <div className="flex flex-col items-center justify-center w-1/3">
        <div className="w-28 h-28 rounded-full bg-gray-300"></div>
        <p className="mt-4 font-semibold text-lg">Perfil1</p>
        <p className="text-sm text-gray-500">perfil1@gmail.com</p>
      </div>

      {/* LADO DERECHO */}
      <div className="w-2/3">
        <h2 className="text-xl font-bold mb-6">Datos Personales</h2>

        <div className="flex flex-col gap-4">

          {[
            "Nombre Completo",
            "E-mail", // <-- Este es nuestro campo objetivo
            "Teléfono",
            "Teléfono 2",
            "País",
            "Género",
            "Dirección",
          ].map((label, index) => {
            // Identificamos si este es el campo de E-mail
            const isEmailField = label === "E-mail";
            // El campo de E-mail estará bloqueado (sólo lectura) si aún no es editable
            const isLocked = isEmailField && !isEmailEditable;

            return (
              <div key={index} className="flex items-center gap-4">
                <label className="w-40 font-medium">{label}:</label>

                <input
                  type="text"
                  // 3. Añadimos lógica condicional para el input del E-mail
                  className={`flex-1 bg-gray-200 px-3 py-2 rounded focus:outline-none 
                    ${isLocked ? 'cursor-pointer hover:bg-gray-300' : ''}`} // Cambia el cursor para indicar que se puede hacer clic

                  // Propiedad readOnly: bloquea la escritura si isLocked es true
                  readOnly={isLocked}

                  // Propiedad onClick: abre el modal si el usuario hace clic en el campo bloqueado
                  onClick={isLocked ? () => setIsModalOpen(true) : undefined}

                  // Añadimos el valor por defecto para que coincida con el ejemplo
                  defaultValue={isEmailField ? 'perfil1@gmail.com' : ''}
                />

                <div className="w-10"></div>
              </div>
            );
          })}

        </div>
      </div>

      {/* 4. Colocamos el componente del Modal al final, pasándole las funciones que necesita */}
      <SecurityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handlePasswordSubmit} 
      />

    </div>
  );
}