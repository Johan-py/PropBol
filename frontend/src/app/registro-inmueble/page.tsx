'use client'
import { useState } from 'react'
import HeaderPropio from '@/components/HeaderPropio'

export default function MiRegistroPage() {
  // Estado del formulario
  const [datos, setDatos] = useState({
    titulo: 'Tropico 6 Federaciones',
    operacion: 'Anticretico',
    tipoInmueble: '',
    precio: '',
    area: '',
    habitaciones: '',
    descripcion: ''
  })

  // Estados de validación
  const [estado, setEstado] = useState<'ninguno' | 'exito' | 'error'>('ninguno')
  const [mensajeError, setMensajeError] = useState('')

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    // Validar solo números positivos
    if (['precio', 'area', 'habitaciones'].includes(name)) {
      if (value !== '' && Number(value) < 0) return
    }
    setDatos({ ...datos, [name]: value })
  }

  const validarYContinuar = () => {
    // 1. Verificar vacíos
    const incompleto =
      !datos.titulo ||
      !datos.tipoInmueble ||
      !datos.precio ||
      !datos.area ||
      !datos.habitaciones ||
      !datos.descripcion

    if (incompleto) {
      setMensajeError('DEBE LLENAR TODOS LOS CAMPOS OBLIGATORIAMENTE')
      setEstado('error')
      return
    }

    // 2. Validar longitudes (Criterios de ingeniería)
    if (datos.titulo.length < 20 || datos.titulo.length > 80) {
      setMensajeError('EL TÍTULO DEBE TENER ENTRE 20 Y 80 CARACTERES')
      setEstado('error')
      return
    }

    if (datos.descripcion.length < 50 || datos.descripcion.length > 300) {
      setMensajeError('LA DESCRIPCIÓN DEBE TENER ENTRE 50 Y 300 CARACTERES')
      setEstado('error')
      return
    }

    setEstado('exito')
    setMensajeError('')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeaderPropio />

      <main className="max-w-6xl mx-auto p-8 md:p-12">
        <h1 className="text-2xl font-bold mb-6 text-gray-950">Registro Inmueble</h1>

        {/* Contenedor Beige Principal */}
        <div className="bg-[#FAF4ED] rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
          {/* Cabecera interna */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-orange-100">
              <span className="text-orange-500 text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Registro de Inmueble</h2>
          </div>

          {/* Texto descriptivo corregido */}
          <p className="text-[14px] text-gray-500 mb-10 leading-relaxed">
            Completa el siguiente formulario con la información detallada del inmueble para su venta
            o alquiler. Los campos marcados con <span className="text-red-500 font-bold">*</span>{' '}
            son obligatorio.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-10">
              {/* Sección: INFORMACIÓN PRINCIPAL */}
              <section>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-200 pb-2 mb-6">
                  INFORMACION PRINCIPAL
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">
                      Título del anuncio <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="titulo"
                      value={datos.titulo}
                      onChange={manejarCambio}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-white/70 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        Tipo de operacion <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="operacion"
                        value={datos.operacion}
                        onChange={manejarCambio}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="Anticretico">Anticretico</option>
                        <option value="Venta">Venta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        Tipo Inmueble <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="tipoInmueble"
                        value={datos.tipoInmueble}
                        onChange={manejarCambio}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Casa">Casa</option>
                        <option value="Departamento">Departamento</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">
                      Precio USD$ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-400">$</span>
                      <input
                        name="precio"
                        type="number"
                        value={datos.precio}
                        onChange={manejarCambio}
                        className="w-full p-3 pl-10 rounded-xl border border-gray-200"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Sección: Detalles de la Propiedad */}
              <section>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-200 pb-2 mb-6">
                  DETALLES DE LA PROPIEDAD
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2 text-red-500">
                      Area total (m²) *
                    </label>
                    <input
                      name="area"
                      type="number"
                      value={datos.area}
                      onChange={manejarCambio}
                      className="w-full p-3 rounded-xl border border-red-200"
                      placeholder="0"
                    />
                    <p className="text-red-400 text-[10px] mt-1 italic">El Area es obligatorio</p>
                  </div>
                  <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2 text-red-500">
                      Habitaciones *
                    </label>
                    <input
                      name="habitaciones"
                      type="number"
                      value={datos.habitaciones}
                      onChange={manejarCambio}
                      className="w-full p-3 rounded-xl border border-red-200"
                      placeholder="0"
                    />
                    <p className="text-red-400 text-[10px] mt-1 italic">Indica la cantidad</p>
                  </div>
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <label className="block text-[15px] font-bold text-gray-900 mb-2 text-red-500">
                  DESCRIPCION DETALLADA *
                </label>
                <textarea
                  name="descripcion"
                  value={datos.descripcion}
                  onChange={manejarCambio}
                  className="w-full p-4 rounded-2xl border border-gray-300 h-72 bg-white text-sm outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="Casa de dos plantas..."
                ></textarea>
                <p className="text-red-400 text-[11px] mt-2 italic">
                  La descripcion es obligatoria
                </p>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex justify-center md:justify-end gap-6">
                  <button
                    onClick={() => setEstado('ninguno')}
                    className="px-12 py-3 rounded-full border border-gray-400 bg-[#D9D9D9] text-gray-800 font-bold hover:bg-gray-300 transition shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={validarYContinuar}
                    className="px-12 py-3 rounded-full border-2 border-orange-400 bg-[#D9D9D9] text-gray-800 font-bold hover:bg-orange-50 transition shadow-sm"
                  >
                    Continuar
                  </button>
                </div>

                {/* Mensaje ERROR */}
                {estado === 'error' && (
                  <div className="flex items-center gap-4 bg-white border-2 border-red-400 rounded-2xl p-4 shadow-md animate-bounce max-w-md ml-auto">
                    <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-black">
                      X
                    </div>
                    <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight">
                      {mensajeError}
                    </span>
                  </div>
                )}

                {/* Mensaje ÉXITO */}
                {estado === 'exito' && (
                  <div className="flex items-center gap-4 bg-white border-2 border-orange-400 rounded-2xl p-4 shadow-md max-w-md ml-auto">
                    <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl">
                      ✓
                    </div>
                    <span className="text-[14px] font-medium text-gray-700 italic">
                      Datos completados correctamente
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
