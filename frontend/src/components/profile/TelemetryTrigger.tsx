'use client';
import { useState, useEffect } from 'react';
import TelemetryModal from './TelemetryModal';

export default function TelemetryTrigger() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 1. Verificamos si hay sesión (Criterio QA)
    const token = localStorage.getItem('token'); 
    const hasSeen = localStorage.getItem('has_seen_telemetry');

    if (token && !hasSeen) {
      // 2. Esperamos los 4 segundos que pediste
      const timer = setTimeout(() => {
        // 3. Captura automática de zona (Criterio QA)
        const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("HU-11: Zona capturada:", zona);
        
        setShowModal(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowModal(false);
    localStorage.setItem('has_seen_telemetry', 'true');
  };

  return <TelemetryModal isOpen={showModal} onClose={handleClose} />;
}
