// WelcomeForm.tsx
import { useState } from "react";

export default function WelcomeForm() {
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6">
          Bienvenido todos
        </h1>

        <form className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Nombre
            </label>

            <input
              type="text"
              placeholder="Ingresa tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>

        {name && (
          <p className="mt-4 text-center text-gray-700">
            Hola, <span className="font-bold">{name}</span> 👋
          </p>
        )}
      </div>
    </div>
  );
}