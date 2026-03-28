// frontend/src/hooks/usePropertyFilters.ts
import { useState, useCallback } from 'react';


export type TipoInmueble = 'Casa' | 'Departamento' | 'Terreno' | 'Habitación' | 'Local';
export type ModoTransaccion = 'venta' | 'alquiler' | 'anticretico';

export function usePropertyFilters() {

  const [tiposSeleccionados, setTiposSeleccionados] = useState<TipoInmueble[]>([]);
  

  const [modoSeleccionado, setModoSeleccionado] = useState<ModoTransaccion>('venta');


  const handleTipoChange = useCallback((tipo: TipoInmueble) => {
    setTiposSeleccionados(prev => {
      if (prev.includes(tipo)) {
  
        return prev.filter(t => t !== tipo);
      } else {

        return [...prev, tipo];
      }
    });
  }, []);


  const handleModoChange = useCallback((modo: ModoTransaccion) => {
    setModoSeleccionado(modo);
  }, []);


  const resetFilters = useCallback(() => {
    setTiposSeleccionados([]);
    setModoSeleccionado('venta');
  }, []);

  return {
    tiposSeleccionados,
    modoSeleccionado,
    handleTipoChange,
    handleModoChange,
    resetFilters
  };
}