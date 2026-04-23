'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PlanModal from '../../components/ui/PlanModal'

// --- 🟢 IMPORTACIONES DE TU HU-5 (Fase 1 y Fase 2) ---
import { ErrorValidacion, EstadoPublicacion } from "../../types/publicacion";
import { validarFormulario } from "../../lib/publicarValidator";
import ErrorPanel from "../../components/publicacion/ErrorPanel";
import PublicarModal from "../../components/publicacion/PublicarModal";
// ----------------------------------------------------

type CampoError =
  | 'titulo'
  | 'descripcion'
  | 'direccion'
  | 'zona'
  | 'habitaciones'
  | 'banos'
  | 'precio'
  | 'area'
  | 'operacion'
  | null

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function MiRegistroPage() {
  const router = useRouter()
  const [mostrarPlanModal, setMostrarPlanModal] = useState(false)

  // 1. ESTADO ORIGINAL DE TU COMPAÑERO (Mantenido intacto)
  const [datos, setDatos] = useState({
    titulo: '',
    operacion: '',
    tipoInmueble: '',
    precio: '',
    area: '',
    habitaciones: '',
    banos: '',
    direccion: '',
    zona: '',
    ciudad: 'Cochabamba',
    descripcion: ''
  })

  const [estado, setEstado] = useState<'ninguno' | 'exito' | 'error'>('ninguno')
  const [mensajeError, setMensajeError] = useState('')
  const [campoError, setCampoError] = useState<CampoError>(null)

  // 2. NUEVOS ESTADOS PARA LA HU-5 (Añadidos)
  const [estadoPublicacion, setEstadoPublicacion] = useState<EstadoPublicacion>("idle")
  const [erroresHU5, setErroresHU5] = useState<ErrorValidacion[]>([])
  const [progreso, setProgreso] = useState(0)
  const [campoResaltado, setCampoResaltado] = useState<string | null>(null)

  // 3. REFERENCIAS PARA EL SCROLL AUTOMÁTICO DE LA HU-5 (Añadidos)
  const refs: Record<string, React.RefObject<any>> = {
    titulo: useRef<HTMLInputElement>(null),
    tipoPropiedad: useRef<HTMLSelectElement>(null),
    precio: useRef<HTMLInputElement>(null),
    superficie: useRef<HTMLInputElement>(null),
    habitaciones: useRef<HTMLInputElement>(null),
    banos: useRef<HTMLInputElement>(null),
    direccion: useRef<HTMLInputElement>(null),
    ciudad: useRef<HTMLInputElement>(null),
    codigoPostal: useRef<HTMLInputElement>(null),
    descripcion: useRef<HTMLTextAreaElement>(null),
  }

  // 4. VALIDACIÓN DE FLUJO DEL COMPAÑERO (Mantenido)
  useEffect(() => {
    const validarFlujo = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/sign-in') //entra al formulario solo si inicio sesion
        return
      }
      try {
        const response = await fetch(`${API_URL}/api/publicaciones/flujo`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (!response.ok && result.message === 'LIMIT_REACHED') {
          setMostrarPlanModal(true)
        }
      } catch (error) {
        console.error('Error validando flujo:', error)
      }
    }
    validarFlujo()
  }, [router])

  // 5. FUNCIONES DE LIMPIEZA Y FORMATEO DEL COMPAÑERO (Mantenido)
  const limpiarSoloNumeros = (valor: string) => valor.replace(/\D/g, '')
  const formatearNumero = (valor: string) => {
    const soloNumeros = limpiarSoloNumeros(valor)
    if (!soloNumeros) return ''
    return Number(soloNumeros).toLocaleString('es-BO')
  }

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Re-validación dinámica: borra los errores de la HU-5 mientras el usuario escribe
    if (erroresHU5.length > 0) {
      setErroresHU5(prev => prev.filter(err => err.campo !== name && err.campo !== (name === 'area' ? 'superficie' : name === 'zona' ? 'codigoPostal' : name)))
    }

    // Lógica de formateo de Precio y Área del compañero
    if (name === 'precio' || name === 'area') {
      const soloNumeros = limpiarSoloNumeros(value)
      if (soloNumeros === '') {
        setDatos({ ...datos, [name]: '' })
        return
      }
      const limite = name === 'precio' ? 999999999 : 10000000;
      const numeroLimitado = Math.min(Number(soloNumeros), limite)
      setDatos({ ...datos, [name]: formatearNumero(String(numeroLimitado)) })
      return
    }

    // Lógica de límites de Habitaciones y Baños del compañero
    if (name === 'habitaciones' || name === 'banos') {
      if (value === '') {
        setDatos({ ...datos, [name]: '' })
        return
      }
      const numero = Number(value)
      if (numero >= 50) {
        setDatos({ ...datos, [name]: '50' })
        return
      }
    }
    // Comportamiento por defecto
    setDatos({ ...datos, [name]: value })
  }

  // 6. LÓGICA DEL PANEL DE ERRORES DE LA HU-5 (Añadido)
  const handleClickError = (campo: string) => {
    const ref = refs[campo];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      ref.current.focus();
      setCampoResaltado(campo);
      setTimeout(() => setCampoResaltado(null), 2500);
    }
  }

  // 7. BOTÓN DE CONFIRMAR: INICIA FASE 1 (HU-5) (Inyectado)
  const handleConfirmarClick = () => {
    // Adaptamos los datos actuales al formato del validador de la HU-5
    const datosMapeadosParaHU5 = {
      titulo: datos.titulo,
      tipoPropiedad: datos.tipoInmueble,
      precio: limpiarSoloNumeros(datos.precio),
      superficie: limpiarSoloNumeros(datos.area),
      habitaciones: datos.habitaciones,
      banos: datos.banos,
      direccion: datos.direccion,
      ciudad: datos.ciudad,
      codigoPostal: datos.zona,
      descripcion: datos.descripcion
    }

    const erroresEncontrados = validarFormulario(datosMapeadosParaHU5);
    
    // Verificación de Operación del compañero (No contemplada en el validador base)
    if (!datos.operacion) {
      erroresEncontrados.push({ campo: "tipoPropiedad", seccion: "Información Básica", mensaje: "Debe seleccionar el tipo de operación" })
    }

    if (erroresEncontrados.length > 0) {
      setErroresHU5(erroresEncontrados);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Si no hay errores, pasamos a Fase 2: Confirmación
    setErroresHU5([]);
    setEstadoPublicacion("confirmando");
    setProgreso(0);
  }

  // 8. EJECUCIÓN CON LA API DEL COMPAÑERO + BARRA DE PROGRESO DE HU-5 (Fase 2 inyectada)
  const handlePublicarInmueble = async () => {
    setEstadoPublicacion("publicando");
    setProgreso(0);

    // Activamos la barra de progreso simulada (HU-5)
    const intervaloBarra = setInterval(() => {
      setProgreso(p => p >= 90 ? 90 : p + 10);
    }, 300);

    // PREPARACIÓN DEL PAYLOAD ORIGINAL DEL COMPAÑERO
    const payloadBackend = {
      titulo: datos.titulo.trim(),
      tipoAccion: datos.operacion,
      categoria: datos.tipoInmueble,
      precio: Number(limpiarSoloNumeros(datos.precio)),
      superficieM2: datos.area ? Number(limpiarSoloNumeros(datos.area)) : undefined,
      nroCuartos: datos.habitaciones ? Number(datos.habitaciones) : undefined,
      nroBanos: datos.banos ? Number(datos.banos) : 1,
      descripcion: datos.descripcion.trim(),
      direccion: datos.direccion.trim(),
      zona: datos.zona.trim(),
      ciudad: datos.ciudad
    }

    // LÓGICA FETCH ORIGINAL DEL COMPAÑERO
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payloadBackend)
      })
      const result = await response.json()

      // Detenemos la barra al recibir respuesta
      clearInterval(intervaloBarra);

      if (!response.ok) {
        // Manejo de límite de publicaciones del compañero (Mantenido)
        if (result.message === 'LIMIT_REACHED') {
          setEstadoPublicacion("idle"); // Cerramos tu modal para que el suyo aparezca
          setMostrarPlanModal(true)
          return
        }
        // Manejo genérico de error de API de tu HU-5
        setEstadoPublicacion("error_publicacion");
        return
      }

      // ÉXITO DEL COMPAÑERO
      const publicacionId = result?.property?.publicacion?.id
      if (publicacionId) {
        // Mostramos 100% éxito en tu HU-5 antes de redirigir
        setProgreso(100);
        setEstadoPublicacion("exito");
        setTimeout(() => {
          router.push(`/contenido-multimedia?publicacionId=${publicacionId}`)
        }, 2000);
      }
    } catch (error) {
      clearInterval(intervaloBarra);
      setEstadoPublicacion("error_publicacion");
    }
  }

  // 9. FUNCIONES DE ESTILOS VISUALES PARA LA HU-5 (Añadidos)
  const tieneError = (campoOriginal: string, campoValidador: string) => 
    erroresHU5.some(e => e.campo === campoOriginal || e.campo === campoValidador);

  const getEstilosInputs = (campoObj: string, campoVal: string) => {
    const errorH5 = tieneError(campoObj, campoVal);
    const resaltadoH5 = campoResaltado === campoVal;
    
    // Fusionamos estilos base del compañero con estados de error y resaltado de la HU-5
    return `w-full p-3 rounded-xl border bg-white/70 transition-all ${
      errorH5 ? 'border-red-500 bg-red-50 ring-2 ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
    } ${resaltadoH5 ? 'ring-4 ring-orange-400 border-orange-500' : ''}`;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-6xl mx-auto p-8 md:p-12">
        <h1 className="text-2xl font-bold mb-6 text-gray-950">Registro Inmueble</h1>

        {/* --- 🟢 COMPONENTE ERROR PANEL DE TU HU-5 (INYECTADO) --- */}
        <ErrorPanel errores={erroresHU5} onClickError={handleClickError} />
        {/* -------------------------------------------------------- */}

        <div className="bg-[#FAF4ED] rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-orange-100">
              <span className="text-orange-500 text-2xl">📋</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Registro de Inmueble</h2>
          </div>

          <p className="text-[14px] text-gray-500 mb-10 leading-relaxed">
            Completa el siguiente formulario con la información detallada del inmueble para su venta o alquiler.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            <div className="space-y-10">
              <section>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-200 pb-2 mb-6">
                  INFORMACION PRINCIPAL
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">Título del anuncio *</label>
                    <input
                      ref={refs.titulo} // 🟢 AÑADIDO REF HU-5
                      name="titulo"
                      value={datos.titulo}
                      onChange={manejarCambio}
                      maxLength={80}
                      className={getEstilosInputs("titulo", "titulo")}
                    />
                    <p className="text-xs text-gray-500 mt-1">{datos.titulo.length}/80 caracteres</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 mb-2">Tipo de operación *</label>
                      <select
                        name="operacion"
                        value={datos.operacion}
                        onChange={manejarCambio}
                        className={getEstilosInputs("operacion", "tipoPropiedad")}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="ANTICRETO">Anticreto</option>
                        <option value="VENTA">Venta</option>
                        <option value="ALQUILER">Alquiler</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-gray-900 mb-2">Tipo de Inmueble *</label>
                      <select
                        ref={refs.tipoPropiedad} // 🟢 AÑADIDO REF HU-5
                        name="tipoInmueble"
                        value={datos.tipoInmueble}
                        onChange={manejarCambio}
                        className={getEstilosInputs("tipoInmueble", "tipoPropiedad")}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="CASA">Casa</option>
                        <option value="DEPARTAMENTO">Departamento</option>
                        <option value="TERRENO">Terreno</option>
                        <option value="OFICINA">Oficina</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">Precio USD$ *</label>
                    <input
                      ref={refs.precio} // 🟢 AÑADIDO REF HU-5
                      name="precio"
                      type="text"
                      inputMode="numeric"
                      value={datos.precio}
                      onChange={manejarCambio}
                      placeholder="Ej: 350.000"
                      className={getEstilosInputs("precio", "precio")}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-200 pb-2 mb-6">
                  DETALLES DE LA PROPIEDAD
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[15px] font-bold mb-2">Área total (m²)</label>
                    <input
                      ref={refs.superficie} // 🟢 AÑADIDO REF HU-5
                      name="area"
                      type="text"
                      inputMode="numeric"
                      value={datos.area}
                      onChange={manejarCambio}
                      placeholder="Ej: 1.250"
                      className={getEstilosInputs("area", "superficie")}
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] font-bold mb-2">Habitaciones</label>
                    <input
                      ref={refs.habitaciones} // 🟢 AÑADIDO REF HU-5
                      name="habitaciones"
                      type="text"
                      inputMode="numeric"
                      value={datos.habitaciones}
                      onChange={manejarCambio}
                      className={getEstilosInputs("habitaciones", "habitaciones")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-[15px] font-bold mb-2">Baños</label>
                    <input
                      ref={refs.banos} // 🟢 AÑADIDO REF HU-5
                      name="banos"
                      type="text"
                      inputMode="numeric"
                      value={datos.banos}
                      onChange={manejarCambio}
                      className={getEstilosInputs("banos", "banos")}
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] font-bold mb-2">Dirección *</label>
                    <input
                      ref={refs.direccion} // 🟢 AÑADIDO REF HU-5
                      name="direccion"
                      value={datos.direccion}
                      onChange={manejarCambio}
                      maxLength={80}
                      className={getEstilosInputs("direccion", "direccion")}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-[15px] font-bold mb-2">Zona</label>
                  <input
                    ref={refs.codigoPostal} // 🟢 AÑADIDO REF HU-5
                    name="zona"
                    value={datos.zona}
                    onChange={manejarCambio}
                    maxLength={80}
                    className={getEstilosInputs("zona", "codigoPostal")}
                  />
                </div>
              </section>
            </div>

            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <label className="block text-[15px] font-bold text-gray-900 mb-2">DESCRIPCION DETALLADA *</label>
                <textarea
                  ref={refs.descripcion} // 🟢 AÑADIDO REF HU-5
                  name="descripcion"
                  value={datos.descripcion}
                  onChange={manejarCambio}
                  maxLength={300}
                  className={`${getEstilosInputs("descripcion", "descripcion")} h-72 resize-none`}
                  placeholder="Casa de dos plantas, amplia y moderna ubicada en una zona tranquila..."
                />
                <p className="text-xs text-gray-500 mt-1">{datos.descripcion.length}/300 caracteres</p>
              </div>

              <div className="mt-12 space-y-6">
                <div className="flex justify-center md:justify-end gap-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-12 py-3 rounded-full border border-gray-400 bg-[#D9D9D9]"
                  >
                    Cancelar
                  </button>

                  {/* CAMBIO DE COMPORTAMIENTO DEL BOTÓN PARA FASE 1 HU-5 */}
                  <button
                    onClick={handleConfirmarClick} 
                    className="px-12 py-3 rounded-full border-2 border-orange-400 bg-orange-50 hover:bg-orange-100 transition text-orange-700 font-semibold"
                  >
                    Continuar a Publicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {mostrarPlanModal && <PlanModal onClose={() => setMostrarPlanModal(false)} />}
      
      {/* --- 🟢 COMPONENTE MODAL DE TU HU-5 (FASE 2) (INYECTADO) --- */}
      {(estadoPublicacion !== "idle") && (
        <PublicarModal
          estado={estadoPublicacion as any} 
          progreso={progreso}
          onConfirmar={handlePublicarInmueble} // Llama a la API original fusionada
          onCancelar={() => setEstadoPublicacion("idle")}
          onReintentar={() => setEstadoPublicacion("confirmando")}
        />
      )}
      {/* ---------------------------------------------------------- */}
    </div>
  )
}