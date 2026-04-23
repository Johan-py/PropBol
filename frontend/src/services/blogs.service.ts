import { MOCK_PUBLIC_BLOGS } from "@/lib/mock/publicBlogs.mock";
import { PublicBlogCard } from "@/types/publicBlog";

export type BlogCreationAction = "borrador" | "pendiente";

export type BlogCategoryOption = {
  id: number;
  nombre: string;
};

export type CreateBlogPayload = {
  titulo: string;
  contenido: string;
  imagen: string;
  categoria_id: number;
  accion: BlogCreationAction;
};

export type EditableBlog = {
  id: number;
  titulo: string;
  contenido: string;
  imagen: string;
  categoria_id: number;
  estado: "BORRADOR" | "RECHAZADO";
};

type CreatedBlogResponse = {
  id: number;
  titulo: string;
  estado: "BORRADOR" | "PENDIENTE" | "PUBLICADO" | "RECHAZADO";
};

type UserBlogRow = {
  id: number;
  titulo: string;
  contenido: string;
  imagen: string | null;
  categoria_id: number;
  estado: "BORRADOR" | "PENDIENTE" | "PUBLICADO" | "RECHAZADO";
};

const getApiUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay sesión activa. Inicia sesión nuevamente.");
  }

  return token;
};

export const getPublishedBlogs = (): PublicBlogCard[] => {
  /*
    Integracion futura:
    Cuando exista backend para Blogs, este servicio debe consumir
    NEXT_PUBLIC_API_URL y mapear la respuesta publica del modulo.

    Ejemplo:
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/blogs/publicados`, {
      cache: "no-store",
    });
    const rows: BlogRow[] = await response.json();
    return rows
      .map(mapBlogRowToPublicBlogCard)
      .filter((blog): blog is PublicBlogCard => blog !== null);
  */

  return MOCK_PUBLIC_BLOGS;
};

export async function getBlogCategories(): Promise<BlogCategoryOption[]> {
  const response = await fetch(`${getApiUrl()}/api/blogs/categorias`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron cargar las categorías");
  }

  return data;
}

export async function createBlog(
  payload: CreateBlogPayload,
): Promise<CreatedBlogResponse> {
  const response = await fetch(`${getApiUrl()}/api/blogs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear el blog");
  }

  return data;
}

export async function updateBlog(
  id: number,
  payload: CreateBlogPayload,
): Promise<CreatedBlogResponse> {
  const response = await fetch(`${getApiUrl()}/api/blogs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el blog");
  }

  return data;
}

export async function getEditableBlog(id: number): Promise<EditableBlog> {
  const response = await fetch(`${getApiUrl()}/api/blogs/mis-blogs`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron cargar tus blogs");
  }

  const blog = (data as UserBlogRow[]).find((row) => row.id === id);

  if (!blog) {
    throw new Error("No se encontró el blog solicitado.");
  }

  if (blog.estado !== "BORRADOR" && blog.estado !== "RECHAZADO") {
    throw new Error("Solo puedes editar blogs en estado BORRADOR o RECHAZADO.");
  }

  return {
    id: blog.id,
    titulo: blog.titulo,
    contenido: blog.contenido,
    imagen: blog.imagen ?? "",
    categoria_id: blog.categoria_id,
    estado: blog.estado,
  };
}
