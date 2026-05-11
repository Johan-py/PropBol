'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Plus, Trash2, Pencil, Camera, Loader2, User } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import SecurityModal from './SecurityModal'
import OtpModal from './OtpModal'

interface Telefono {
  id: number
  numero: string
  pais: string
  codigo: string
}

interface PerfilData {
  id: number
  nombre: string
  correo: string
  avatar: string | null
  pais: string | null
  genero: string | null
  direccion: string | null
  fecha_nacimiento: string | null // ✅ UNA SOLA VARIABLE, exactamente como la base de datos
  telefonos: any[] | null
}

const PAISES = [
  { nombre: 'Bolivia', codigo: '+591', flag: '🇧🇴', digitos: 8 },
  { nombre: 'Argentina', codigo: '+54', flag: '🇦🇷', digitos: 10 },
  { nombre: 'Chile', codigo: '+56', flag: '🇨🇱', digitos: 9 },
  { nombre: 'Perú', codigo: '+51', flag: '🇵🇪', digitos: 9 }
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const ofuscarEmail = (email: string) => {
  if (!email || !email.includes('@')) return email
  const [usuario, dominio] = email.split('@')
  if (usuario.length <= 2) return `**@${dominio}`
  return `${usuario.substring(0, 2)}***@${dominio}`
}

function ProfileCardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusParam = searchParams ? searchParams.get('focus') : null
  const [highlightedFields, setHighlightedFields] = useState<string[]>([])

  const [campoEditando, setCampoEditando] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [perfilData, setPerfilData] = useState<PerfilData | null>(null)
  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState('')
  const [genero, setGenero] = useState('')
  const [direccion, setDireccion] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [tempAvatar, setTempAvatar] = useState<File | null>(null)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  // Estados para validaciones de error
  const [errorNombre, setErrorNombre] = useState("");
  const [errorFechaNacimiento, setErrorFechaNacimiento] = useState("");

  const [originalNombre, setOriginalNombre] = useState("");
  const [originalPais, setOriginalPais] = useState("");
  const [originalGenero, setOriginalGenero] = useState("");
  const [originalDireccion, setOriginalDireccion] = useState("");
  const [originalFechaNacimiento, setOriginalFechaNacimiento] = useState("");

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isEmailEditable, setIsEmailEditable] = useState(false)
  const [originalEmail, setOriginalEmail] = useState('')
  const [tempEmail, setTempEmail] = useState('')
  const [otpError, setOtpError] = useState('')
  const [emailToUpdate, setEmailToUpdate] = useState('')

  const [telefonos, setTelefonos] = useState<Telefono[]>([
    { id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }
  ])

  const soloLetras = (value: string) => value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  const getToken = () => localStorage.getItem('token')

  // BUG 1 CORREGIDO: Disparamos un StorageEvent real y refrescamos el layout para el Navbar
  const syncNavbar = (key?: string, value?: string) => {
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new Event('profileUpdated'))

    if (key && value) {
      window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: value,
        url: window.location.href,
        storageArea: localStorage
      }))
    }
    
    // Fuerza a los componentes del servidor (como layouts) a reevaluarse
    router.refresh()
  }

  const cargarPerfil = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`${API_URL}/api/perfil/usuario`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.ok && data.perfil) {
        const perfil = data.perfil
        const foto = perfil.avatar || perfil.fotoPerfil || null
        setPerfilData(perfil)

        setNombre(perfil.nombre || '')
        setOriginalNombre(perfil.nombre || '')

        setPais(perfil.pais || '')
        setOriginalPais(perfil.pais || '')

        setGenero(perfil.genero || '')
        setOriginalGenero(perfil.genero || '')

        setDireccion(perfil.direccion || '')
        setOriginalDireccion(perfil.direccion || '')

        // ✅ Lógica de Develop: FORMATEAR LA FECHA PARA EL INPUT DATE
        const fechaFormateada = perfil.fecha_nacimiento
          ? new Date(perfil.fecha_nacimiento).toISOString().split('T')[0]
          : ''
        setFechaNacimiento(fechaFormateada)
        setOriginalFechaNacimiento(fechaFormateada)

        setAvatar(foto)
        setOriginalEmail(perfil.correo || '')
        setTempEmail(perfil.correo || '')

        localStorage.setItem('nombre', perfil.nombre || '')
        localStorage.setItem('correo', perfil.correo || '')
        
        // BUG 1 CORREGIDO: Sincronización robusta al cargar
        if (foto) {
          const absoluteAvatar = foto.startsWith('http') ? foto : `${API_URL}${foto}`;
          localStorage.setItem('avatar', absoluteAvatar)
          syncNavbar('avatar', absoluteAvatar)
        } else {
          syncNavbar()
        }

        if (perfil.telefonos && Array.isArray(perfil.telefonos) && perfil.telefonos.length > 0) {
          setTelefonos(perfil.telefonos.map((tel: any, i: number) => ({
            id: Date.now() + i,
            numero: tel.numero,
            pais: PAISES.find(p => tel.codigoPais === p.codigo)?.nombre || 'Bolivia',
            codigo: tel.codigoPais
          })))
        } else {
          setTelefonos([{ id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarPerfil() }, [])

  // BUG 2 CORREGIDO: Resaltado visual EXCLUSIVO para los campos vacíos
  useEffect(() => {
    if (focusParam === 'personal-data' && perfilData) {
      const el = document.getElementById('personal-data-form')
      el?.scrollIntoView({ behavior: 'smooth' })

      // Evaluamos únicamente los campos que faltan por llenar
      const fieldsToHighlight: string[] = []

      if (!perfilData.fecha_nacimiento) fieldsToHighlight.push('fechaNacimiento') // ✅ Lógica limpia
      if (!perfilData.pais) fieldsToHighlight.push('pais')
      if (!perfilData.genero) fieldsToHighlight.push('genero')
      if (!perfilData.direccion) fieldsToHighlight.push('direccion')
      
      setHighlightedFields(fieldsToHighlight)
      
      // Apagamos el resaltado después de 6 segundos
      setTimeout(() => setHighlightedFields([]), 6000)
    }
  }, [focusParam, perfilData])

  const clearHighlight = (field: string) => {
    if (highlightedFields.includes(field)) {
      setHighlightedFields(prev => prev.filter(f => f !== field))
    }
  }

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const hasEmailChanged = tempEmail !== originalEmail && isValidEmail(tempEmail)

  const guardarNombre = async () => {
    try {
      await fetch(`${API_URL}/api/perfil/usuario/nombre`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ nombre })
      })
      setOriginalNombre(nombre)
      localStorage.setItem('nombre', nombre)
      syncNavbar('nombre', nombre)
    } catch (error: any) {
      console.error(error.message)
    }
  }

  const guardarPais = async () => {
    try {
      await fetch(`${API_URL}/api/perfil/usuario/pais`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ pais })
      })
      setOriginalPais(pais)
    } catch (error: any) {
      console.error(error.message)
    }
  }

  const guardarGenero = async () => {
    try {
      await fetch(`${API_URL}/api/perfil/usuario/genero`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ genero })
      })
      setOriginalGenero(genero)
    } catch (error: any) {
      console.error(error.message)
    }
  }

  const guardarDireccion = async () => {
    try {
      await fetch(`${API_URL}/api/perfil/usuario/direccion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ direccion })
      })
      setOriginalDireccion(direccion)
    } catch (error: any) {
      console.error(error.message)
    }
  }

  const guardarFechaNacimiento = async () => {
    try {
      await fetch(`${API_URL}/api/perfil/usuario/fecha-nacimiento`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ fecha_nacimiento: fechaNacimiento })
      })
      setOriginalFechaNacimiento(fechaNacimiento)
    } catch (error: any) {
      console.error(error.message)
    }
  }

  const guardarTelefonos = async () => {
    const numerosLimpios = telefonos.map((t) => t.numero.trim()).filter((num) => num !== '');
    const tieneDuplicados = new Set(numerosLimpios).size !== numerosLimpios.length;

    if (tieneDuplicados) {
      alert('No puedes guardar números de teléfono duplicados. Por favor, verifica la información.');
      return;
    }

    try {
      const token = getToken();
      const body = {
        telefonos: telefonos
          .filter((t) => t.numero.trim() !== '')
          .map((t, index) => ({
            codigoPais: t.codigo,
            numero: t.numero,
            principal: index === 0
          }))
      };

      await fetch(`${API_URL}/api/perfil/usuario/telefonos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
    } catch (error: any) {
      console.error(error.message)
    }
  };

  const subirFoto = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('foto', file)
      const response = await fetch(`${API_URL}/api/perfil/usuario/foto-perfil`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      })
      const data = await response.json()
      if (data.ok) {
        const nuevaFoto = data.fotoPerfil || data.avatar
        const absoluteAvatar = nuevaFoto.startsWith('http') ? nuevaFoto : `${API_URL}${nuevaFoto}`;
        
        setAvatar(nuevaFoto)
        localStorage.setItem('avatar', absoluteAvatar)
        
        // BUG 1 CORREGIDO: Notificamos inmediatamente a la Navbar la nueva foto
        syncNavbar('avatar', absoluteAvatar) 
        cargarPerfil()
      } else {
        throw new Error(data.msg)
      }
    } catch (error: any) {
      alert(error.message || 'Error al subir foto')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePasswordSubmit = async (passwordActual: string) => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) throw new Error('No hay sesión activa')

      const verifyRes = await fetch(`${API_URL}/api/perfil/verificar-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ passwordActual })
      })

      const verifyData = await verifyRes.json()
      if (!verifyData.ok) throw new Error(verifyData.msg)

      setIsSecurityModalOpen(false)
      setIsEmailEditable(true)
      setTempEmail(originalEmail)
    } catch (error: any) {
      alert(error.message || 'Contraseña incorrecta')
    } finally {
      setIsLoading(false)
    }
  }

  const solicitarCambioEmail = async (nuevoEmail: string) => {
    setIsLoading(true)
    try {
      const token = getToken()
      const solicitarRes = await fetch(`${API_URL}/api/perfil/solicitar-cambio-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emailNuevo: nuevoEmail })
      })

      const solicitarData = await solicitarRes.json()
      if (!solicitarData.ok) throw new Error(solicitarData.msg)

      setEmailToUpdate(nuevoEmail)
      setIsOtpModalOpen(true)
      setOtpError('')
    } catch (error: any) {
      alert(error.message || 'Error al solicitar cambio de email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (otp: string) => {
    setIsLoading(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/perfil/confirmar-cambio-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      })

      const data = await response.json()
      if (!data.ok) throw new Error(data.msg)

      localStorage.setItem('correo', emailToUpdate)
      setOriginalEmail(emailToUpdate)
      setTempEmail(emailToUpdate)
      setIsEmailEditable(false)
      setIsOtpModalOpen(false)
      setEmailToUpdate('')
      setOtpError('')
      
      syncNavbar('correo', emailToUpdate)
      alert('Correo actualizado y cambios guardados exitosamente')
      cargarPerfil()
    } catch (error: any) {
      setOtpError(error.message || 'Error al verificar código')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const emailNuevo = emailToUpdate || tempEmail

      const response = await fetch(`${API_URL}/api/perfil/solicitar-cambio-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emailNuevo })
      })

      const data = await response.json()
      if (!data.ok) throw new Error(data.msg)

      setOtpError('')
      alert('Se ha enviado un nuevo código a tu correo')
    } catch (error: any) {
      setOtpError(error.message || 'Error al reenviar código')
    } finally {
      setIsLoading(false)
    }
  }

  const agregarTelefono = () => {
    if (telefonos.length < 3) {
      setTelefonos([...telefonos, { id: Date.now(), numero: '', pais: 'Bolivia', codigo: '+591' }])
    }
  }

  const eliminarTelefono = (id: number) => {
    if (telefonos.length > 1) {
      setTelefonos(telefonos.filter((t) => t.id !== id))
    }
  }

  const actualizarTelefono = (id: number, valor: string) => {
    setTelefonos(
      telefonos.map((t) => {
        if (t.id === id) {
          const configPais = PAISES.find(p => p.nombre === t.pais);
          const maxDigitos = configPais?.digitos || 15;
          const soloNumerosYCortados = valor.replace(/\D/g, '').slice(0, maxDigitos);
          return { ...t, numero: soloNumerosYCortados };
        }
        return t;
      })
    )
  }

  const handleSaveAll = async () => {
    setIsLoading(true);
    let isWaitingForEmailOTP = false;
    
    if (tempAvatar) {
      await subirFoto(tempAvatar)
      setTempAvatar(null)
      setPreviewAvatar(null)
    }

    if (nombre !== originalNombre) await guardarNombre();
    if (pais !== originalPais) await guardarPais();
    if (genero !== originalGenero) await guardarGenero();
    if (direccion !== originalDireccion) await guardarDireccion();
    if (fechaNacimiento !== originalFechaNacimiento) await guardarFechaNacimiento();
    await guardarTelefonos();

    if (isEmailEditable && hasEmailChanged) {
      isWaitingForEmailOTP = true;
      await solicitarCambioEmail(tempEmail)
    } else if (isEmailEditable && !hasEmailChanged) {
      setIsEmailEditable(false)
    }

    setCampoEditando(null);
    setIsLoading(false);

    if (!isWaitingForEmailOTP) {
      alert('Cambios guardados exitosamente');
    }
  }

  const handleCancelAll = () => {
    setCampoEditando(null)
    setNombre(originalNombre)
    setPais(originalPais)
    setGenero(originalGenero)
    setDireccion(originalDireccion)
    setFechaNacimiento(originalFechaNacimiento)
    setTempEmail(originalEmail)
    setIsEmailEditable(false)
    setErrorNombre("")
    setErrorFechaNacimiento("")
    setHighlightedFields([])
  }

  const handleEditEmailClick = () => {
    setIsSecurityModalOpen(true)
  }

  const hayCambios =
    nombre !== originalNombre ||
    pais !== originalPais ||
    genero !== originalGenero ||
    direccion !== originalDireccion ||
    fechaNacimiento !== originalFechaNacimiento ||
    tempEmail !== originalEmail ||
    tempAvatar !== null;

  if (isLoading && !perfilData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div
      id="personal-data-form"
      className="propbol-profile-card bg-[#fdf6e6] border border-[#e5dfd7] p-5 md:p-8 rounded-xl flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start transition-all duration-700 shadow-sm"
    >
      {/* PERFIL */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/3 md:mt-4">
        <div className="relative mb-6 md:mb-10">
          <div className="w-28 h-28 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm overflow-hidden">
              {(previewAvatar || (avatar && avatar.trim() !== "")) ? (
              <img
                src={previewAvatar || (avatar?.startsWith('http') ? avatar : `${API_URL}${avatar}`)}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute right-0 top-1/2 translate-x-1/3 -translate-y-1/2 md:right-1/2 md:translate-x-1/2 md:top-full md:mt-6 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const preview = URL.createObjectURL(file)
                setTempAvatar(file)
                setPreviewAvatar(preview)
              }
            }}
          />
        </div>

        <p className="mt-2 md:mt-4 font-semibold text-lg text-center">{nombre}</p>
        <p className="text-sm text-gray-500 text-center">{isEmailEditable ? originalEmail : ofuscarEmail(originalEmail)}</p>
      </div>

      {/* FORMULARIO */}
      <div className="w-full md:w-2/3">
        <h2 className="text-xl font-bold mb-6 text-stone-900 text-center md:text-left">Datos Personales</h2>

        <div className="flex flex-col gap-4">

          {/* NOMBRE */}
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700 mb-1 md:mb-0">Nombre Completo:</label>
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nombre}
                  onFocus={() => setCampoEditando('nombre')}
                  onChange={(e) => {
                    setNombre(soloLetras(e.target.value));
                    if (errorNombre) setErrorNombre("");
                  }}
                  className={`flex-1 px-3 py-2 rounded text-sm bg-white border focus:outline-none transition-colors ${
                    errorNombre ? "border-red-500 bg-red-50" : campoEditando === 'nombre' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-stone-300 hover:border-amber-400'
                  }`}
                />
              </div>
              {errorNombre && <span className="text-red-500 text-xs mt-1">{errorNombre}</span>}
            </div>
          </div>

          {/* EMAIL */}
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700 mb-1 md:mb-0">E-mail:</label>
            <div className="flex w-full items-center gap-2">
              <input
                type="email"
                className={`w-full px-3 py-2 rounded text-sm text-stone-700 ${isEmailEditable ? 'bg-white border border-amber-500 focus:outline-none ring-1 ring-amber-500' : 'bg-gray-200 cursor-not-allowed border-stone-300'}`}
                readOnly={!isEmailEditable}
                value={isEmailEditable ? tempEmail : ofuscarEmail(originalEmail)}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              <button
                onClick={handleEditEmailClick}
                className="text-stone-500 hover:text-amber-600 transition-colors"
                disabled={isEmailEditable}
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>
          {isEmailEditable && tempEmail.length > 0 && !isValidEmail(tempEmail) && (
            <div className="ml-0 md:ml-44"><span className="text-red-500 text-xs mt-1">Formato de correo inválido</span></div>
          )}

          {/* TELÉFONOS */}
          {telefonos.map((tel, index) => {
            const keyCampo = `telefono-${tel.id}`
            return (
              <div key={tel.id} className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <label className="w-full md:w-40 font-medium text-stone-700 mb-1 md:mb-0">
                  {index === 0 ? 'Teléfono:' : `Teléfono ${index + 1}:`}
                </label>
                <div className="flex w-full items-center gap-2">
                  <select
                    value={`${tel.pais} ${tel.codigo}`}
                    onFocus={() => setCampoEditando(keyCampo)}
                    onChange={(e) => {
                      const seleccion = PAISES.find((p) => `${p.nombre} ${p.codigo}` === e.target.value)
                      if (seleccion) {
                        setTelefonos(telefonos.map((t) => t.id === tel.id ? { ...t, pais: seleccion.nombre, codigo: seleccion.codigo } : t))
                      }
                    }}
                    className={`px-2 py-2 rounded text-sm bg-white border focus:outline-none transition-colors w-1/3 md:w-auto ${
                      campoEditando === keyCampo ? 'border-amber-500 ring-1 ring-amber-500' : 'border-stone-300 hover:border-amber-400'
                    }`}
                  >
                    {PAISES.map((p) => (
                      <option key={p.nombre} value={`${p.nombre} ${p.codigo}`}>{p.flag} {p.codigo}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Ej. 70000000"
                    value={tel.numero}
                    onFocus={() => setCampoEditando(keyCampo)}
                    onChange={(e) => actualizarTelefono(tel.id, e.target.value)}
                    className={`flex-1 px-3 py-2 rounded text-sm bg-white border focus:outline-none transition-colors ${
                      campoEditando === keyCampo ? 'border-amber-500 ring-1 ring-amber-500' : 'border-stone-300 hover:border-amber-400'
                    }`}
                  />
                  {index === 0 && (
                    <button
                      onClick={agregarTelefono}
                      disabled={telefonos.length >= 3}
                      className="text-stone-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-orange-600 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                  {index > 0 && (
                    <button onClick={() => eliminarTelefono(tel.id)} className="text-stone-500 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {telefonos.length >= 3 && (
            <p className="text-[10px] text-orange-600 font-medium ml-0 md:ml-44 mt-1">
              * Has alcanzado el límite máximo de 3 números de contacto.
            </p>
          )}

          {/* FECHA DE NACIMIENTO */}
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700 mb-1 md:mb-0">F. de Nacimiento:</label>
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  max="2999-12-31"
                  value={fechaNacimiento}
                  onFocus={() => { setCampoEditando('fechaNacimiento'); clearHighlight('fechaNacimiento'); }}
                  onChange={(e) => {
                    setFechaNacimiento(e.target.value)
                    if (errorFechaNacimiento) setErrorFechaNacimiento("")
                  }}
                  className={`flex-1 px-3 py-2 rounded text-sm bg-white border focus:outline-none transition-all duration-500 ${
                    errorFechaNacimiento ? "border-red-500 bg-red-50" : 
                    highlightedFields.includes('fechaNacimiento') ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50 shadow-inner' :
                    campoEditando === 'fechaNacimiento' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-stone-300 hover:border-amber-400'
                  }`}
                />
              </div>
              {errorFechaNacimiento && <span className="text-red-500 text-xs mt-1">{errorFechaNacimiento}</span>}
            </div>
          </div>

          {/* PAÍS */}
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700 mb-1 md:mb-0">País:</label>
            <div className="flex w-full items-center gap-2">
              <select
                value={pais}
                onFocus={() => { setCampoEditando('pais'); clearHighlight('pais'); }}
                onChange={(e) => setPais(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm bg-white border focus:outline-none transition-all duration-500 ${
                  highlightedFields.includes('pais') ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50 shadow-inner' :
                  campoEditando === 'pais' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-stone-300 hover:border-amber-400'
                }`}
              >
                <option value="">Seleccione un país</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Perú">Perú</option>
              </select>
            </div>
          </div>

          {/* GÉNERO */}
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700 mb-1 md:mb-0">Género:</label>
            <div className="flex w-full items-center gap-2">
              <select
                value={genero}
                onFocus={() => { setCampoEditando('genero'); clearHighlight('genero'); }}
                onChange={(e) => setGenero(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm bg-white border focus:outline-none transition-all duration-500 ${
                  highlightedFields.includes('genero') ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50 shadow-inner' :
                  campoEditando === 'genero' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-stone-300 hover:border-amber-400'
                }`}
              >
                <option value="">Seleccione género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decirlo">Prefiero no decirlo</option>
              </select>
            </div>
          </div>

          {/* DIRECCIÓN */}
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <label className="w-full md:w-40 font-medium text-stone-700 mb-1 md:mb-0">Dirección:</label>
            <div className="flex w-full items-center gap-2">
              <input
                value={direccion}
                onFocus={() => { setCampoEditando('direccion'); clearHighlight('direccion'); }}
                onChange={(e) => setDireccion(e.target.value)}
                className={`flex-1 px-3 py-2 rounded text-sm bg-white border focus:outline-none transition-all duration-500 ${
                  highlightedFields.includes('direccion') ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50 shadow-inner' :
                  campoEditando === 'direccion' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-stone-300 hover:border-amber-400'
                }`}
              />
            </div>
          </div>

          {/* BOTONES */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              onClick={handleCancelAll}
              className="text-stone-600 hover:text-black text-sm py-2 sm:py-0 w-full sm:w-auto text-center"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                let hasError = false;

                if (!nombre.trim()) {
                  setErrorNombre("El nombre es obligatorio");
                  hasError = true;
                } else {
                  setErrorNombre("");
                }

                if (fechaNacimiento) {
                  const dob = new Date(fechaNacimiento);
                  const today = new Date();
                  let age = today.getFullYear() - dob.getFullYear();
                  const m = today.getMonth() - dob.getMonth();
                  
                  // Ajuste si el mes/día actual es anterior al de cumpleaños
                  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                    age--;
                  }

                  if (age < 18) {
                    setErrorFechaNacimiento("Debes ser mayor de 18 años para registrarte.");
                    hasError = true;
                  } else {
                    setErrorFechaNacimiento("");
                  }
                } else {
                  setErrorFechaNacimiento("");
                }

                if (hasError) return;

                handleSaveAll();
              }}
              disabled={isLoading || !hayCambios}
              className={`px-6 py-3 sm:py-2 rounded-lg text-sm font-medium shadow-sm transition w-full sm:w-auto ${
                !hayCambios ? "bg-orange-300 cursor-not-allowed text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </div>
      </div>

      {/* MODALES */}
      <SecurityModal isOpen={isSecurityModalOpen} onClose={() => { setIsSecurityModalOpen(false); setIsLoading(false) }} onSubmit={handlePasswordSubmit} isLoading={isLoading} />
      <OtpModal isOpen={isOtpModalOpen} onClose={() => { setIsOtpModalOpen(false); setOtpError(''); setEmailToUpdate(''); setIsLoading(false); setIsEmailEditable(false); setTempEmail(originalEmail) }} onSubmit={handleOtpSubmit} onResendCode={handleResendCode} externalError={otpError} isLoading={isLoading} />
    </div>
  )
}

export default function ProfileCard() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <ProfileCardContent />
    </Suspense>
  )
}