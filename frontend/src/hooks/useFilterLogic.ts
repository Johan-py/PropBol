import { useState } from 'react';

// Definimos qué estructura mínima esperamos de los datos
interface FilterItem {
  name: string;
  count: number;
}

export const useFilterLogic = <T extends FilterItem>(initialData: T[]) => {
  const [viewLevel, setViewLevel] = useState(1); 
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');

  // Rota entre: none -> asc -> desc -> none
  const toggleSort = () => {
    setSortOrder(prev => {
      if (prev === 'none') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };

  const handleSeeMore = () => {
    setViewLevel(prev => prev + 1);
  };

  const getVisibleData = (data: T[]) => {
    let processed = [...data];

    // Lógica de ordenamiento
    if (sortOrder === 'asc') {
      processed.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      processed.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // Orden por defecto: mayor cantidad de propiedades primero
      processed.sort((a, b) => b.count - a.count);
    }

    // Lógica de "Ver más"
    if (viewLevel === 1) return processed.slice(0, 2); // Muestra 2 iniciales
    if (viewLevel === 2) return processed.slice(0, 5); // Muestra 5
    return processed; // Muestra todos
  };

  return {
    viewLevel,
    sortOrder,
    toggleSort,
    handleSeeMore,
    getVisibleData
  };
};