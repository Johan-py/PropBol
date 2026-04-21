import { MOCK_PUBLIC_BLOGS } from '@/lib/mock/publicBlogs.mock'
import { PublicBlogCard } from '@/types/publicBlog'

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

  return MOCK_PUBLIC_BLOGS
}
