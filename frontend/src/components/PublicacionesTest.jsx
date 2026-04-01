import { useEffect, useState } from "react";
import axios from "axios";

export default function PublicacionesTest() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/publicaciones/gratis")
      .then(res => setPublicaciones(res.data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Prueba de Publicaciones Gratis</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <ul>
        {publicaciones.map(pub => (
          <li key={pub.id}>
            <strong>{pub.titulo}</strong> - {pub.descripcion}
          </li>
        ))}
      </ul>
    </div>
  );
}
