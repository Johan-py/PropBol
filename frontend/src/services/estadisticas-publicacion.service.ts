const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const registrarVisualizacion = async (publicacionId: string | number) => {
  try {
    const response = await fetch(
      `${API_URL}/publicaciones/${publicacionId}/visualizacion`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo registrar la visualización");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al registrar visualización:", error);
    return null;
  }
};

export const registrarCompartido = async (
  publicacionId: string | number,
  plataforma?: string
) => {
  try {
    const response = await fetch(
      `${API_URL}/publicaciones/${publicacionId}/compartido`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plataforma: plataforma || "general",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo registrar el compartido");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al registrar compartido:", error);
    return null;
  }
};

export const obtenerEstadisticasPublicacion = async (
  publicacionId: string | number
) => {
  try {
    const response = await fetch(
      `${API_URL}/publicaciones/${publicacionId}/estadisticas`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener las estadísticas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return {
      visualizaciones: 0,
      compartidos: 0,
    };
  }
};