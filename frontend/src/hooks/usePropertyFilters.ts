// frontend/src/hooks/usePropertyFilters.ts
import { useState, useCallback } from 'react';


export type TipoInmueble =  'CASA' | 'DEPARTAMENTO' | 'TERRENO' | 'HABITACION' | 'LOCAL';
export type ModoTransaccion = 'VENTA' | 'ALQUILER' | 'ANTICRETO';

export function usePropertyFilters() {

  const [tiposSeleccionados, setTiposSeleccionados] = useState<TipoInmueble[]>([]);
  

  const [modoSeleccionado, setModoSeleccionado] = useState<ModoTransaccion>('VENTA');


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
    setModoSeleccionado('VENTA');
  }, []);

  return {
    tiposSeleccionados,
    modoSeleccionado,
    handleTipoChange,
    handleModoChange,
    resetFilters
  };
}