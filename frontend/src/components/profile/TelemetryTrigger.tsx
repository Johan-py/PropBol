'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // 1. Importamos el detector de rutas
import TelemetryModal from './TelemetryModal';
import GuestTelemetryModal from './GuestTelemetryModal';
import GuestPreferencesModal from './GuestPreferencesModal';

export default function TelemetryTrigger() {
  const [modalState, setModalState] = useState<'none' | 'logged' | 'guestIntro' | 'guestForm'>('none');
  const pathname = usePathname(); // 2. Guardamos la ruta actual

  useEffect(() => {
    // Al poner [pathname] en las dependencias abajo, obligamos a React 
    // a revisar el token cada vez que el usuario navega a otra página (ej: tras el login).
    
    const token = localStorage.getItem('token'); 
    const hasSeenLogged = localStorage.getItem('has_seen_telemetry');
    const hasSeenGuest = localStorage.getItem('has_seen_guest_telemetry');

    // Si ya vio el modal que le toca, detenemos el código aquí para ahorrar recursos
    if ((token && hasSeenLogged) || (!token && hasSeenGuest)) {
      return;
    }

    // Tiempo optimizado (1 segundo). Si lo dejamos en 2000 o 6000, 
    // el usuario puede cambiar de página antes de que el modal aparezca.
    const timer = setTimeout(() => {
      if (token && !hasSeenLogged) {
        const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("HU-11: Zona capturada:", zona);
        setModalState('logged');
      } else if (!token && !hasSeenGuest) {
        setModalState('guestIntro');
      }
    }, 4000); 

    return () => clearTimeout(timer);
  }, [pathname]); // 3. LA MAGIA: El useEffect reacciona a los cambios de URL

  const closeLogged = () => {
    setModalState('none');
    localStorage.setItem('has_seen_telemetry', 'true');
  };

  const closeGuestIntro = () => {
    setModalState('none');
    localStorage.setItem('has_seen_guest_telemetry', 'true');
  };

  const openGuestForm = () => {
    setModalState('guestForm');
  };

  const closeGuestForm = () => {
    setModalState('none');
    localStorage.setItem('has_seen_guest_telemetry', 'true');
  };

  return (
    <>
      <TelemetryModal isOpen={modalState === 'logged'} onClose={closeLogged} />
      <GuestTelemetryModal isOpen={modalState === 'guestIntro'} onClose={closeGuestIntro} onAccept={openGuestForm} />
      <GuestPreferencesModal isOpen={modalState === 'guestForm'} onClose={closeGuestForm} />
    </>
  );
}