"use client";
import { useEffect, useState } from "react";

type Favorito = {
  id: number;
  titulo: string;
  precio: string;
};

export default function MisFavoritos() {

  const [favoritos, setFavoritos] = useState<Favorito[]>([]);

  useEffect(() => {
    const data: Favorito[] = []; // vacío por ahora
    setFavoritos(data);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Favoritos</h1>
      <p>{favoritos.length} propiedades encontradas</p>
    </div>
  );
}