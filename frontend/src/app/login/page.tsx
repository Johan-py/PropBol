"use client" // Necesario para manejar el formulario

import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault() // Evita que la página se recargue al enviar el formulario
    
    // 1. Simulamos guardar la sesión del usuario en el navegador
    localStorage.setItem('userSession', 'activa')
    
    // 2. Lo redirigimos al Home (o al flujo de publicación)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        
        <div className="text-4xl mb-4">🏢</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In / Sign Up</h2>
        <p className="text-sm text-gray-500 mb-8">
          Inicia sesión o regístrate para continuar con tu publicación
        </p>

        {/* Agregamos el evento onSubmit al formulario */}
        <form onSubmit={handleLogin} className="text-left flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico *
            </label>
            <input 
              type="email" 
              placeholder="tu@correo.com" 
              className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-3 border border-gray-300 rounded-md outline-none focus:border-orange-500"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-md hover:bg-orange-600 transition mt-4"
          >
            Continuar
          </button>
        </form>

      </div>
    </div>
  )
} 