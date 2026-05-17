import api from "./api";

export const obtenerPlanes = async () => {
  const response = await api.get("/admin/planes");

  return response.data;
};

export const crearPlan = async (data: any) => {
  const response = await api.post("/admin/planes", data);

  return response.data;
};

export const editarPlan = async (id: number, data: any) => {
  const response = await api.put(`/admin/planes/${id}`, data);

  return response.data;
};

export const eliminarPlan = async (id: number) => {
  const response = await api.delete(`/admin/planes/${id}`);

  return response.data;
};

export const restaurarPlan = async (id: number) => {
  const response = await api.patch(`/admin/planes/${id}/restaurar`);

  return response.data;
};
