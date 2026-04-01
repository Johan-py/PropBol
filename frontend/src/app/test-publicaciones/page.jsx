"use client";
import { useState } from "react";
import axios from "axios";

export default function Page() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [inmuebleId, setInmuebleId] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/publicaciones", {
        titulo,
        descripcion,
        inmuebleId: parseInt(inmuebleId),
      }, {
        headers: {
          "Authorization": "Bearer <tu_token_aqui>", // reemplaza con token válido
          "Content-Type": "application/json"
        }
      });
      setMensaje("Publicación creada: " + JSON.stringify(res.data));
    } catch (err) {
      setMensaje("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Prueba de Publicar Inmueble</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div>
          <label>Descripción:</label>
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div>
          <label>ID Inmueble:</label>
          <input value={inmuebleId} onChange={(e) => setInmuebleId(e.target.value)} />
        </div>
        <button type="submit">Publicar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
