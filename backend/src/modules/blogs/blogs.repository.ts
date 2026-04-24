import { prisma } from "../../lib/prisma.client.js";
import { estado_blog } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

function resolveSupabaseUrl() {
  const configuredUrl = process.env.SUPABASE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "SUPABASE_URL o DATABASE_URL son requeridos para subir imágenes",
    );
  }

  const parsedUrl = new URL(databaseUrl);
  const projectRef = parsedUrl.username.split(".")[1];

  if (!projectRef) {
    throw new Error("No se pudo inferir SUPABASE_URL desde DATABASE_URL");
  }

  return `https://${projectRef}.supabase.co`;
}

function getSupabaseClient() {
  const supabaseUrl = resolveSupabaseUrl();
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY son requeridos",
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}

function getFileExtension(file: Express.Multer.File) {
  const fromMimeType = file.mimetype.split("/")[1];
  return fromMimeType === "jpeg" ? "jpg" : fromMimeType || "jpg";
}

// BLOGS PE

export const blogsRepository = {
  async findAll(params: {
    categoria_id?: number;
    page?: number;
    limit?: number;
  }) {
    const { categoria_id, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where = {
      eliminado: false,
      estado: "PUBLICADO" as estado_blog,
      ...(categoria_id ? { categoria_id } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fecha_publicacion: "desc" }, { fecha_creacion: "desc" }],
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, avatar: true },
          },
          categoria_blog: { select: { id: true, nombre: true } },
          _count: { select: { comentario: true } },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findByUserId(usuario_id: number) {
    return prisma.blog.findMany({
      where: { usuario_id, eliminado: false },
      orderBy: { fecha_creacion: "desc" },
      include: {
        categoria_blog: { select: { id: true, nombre: true } },
        blog_rechazo: { orderBy: { fecha: "desc" }, take: 1 },
        _count: { select: { comentario: true } },
      },
    });
  },

  async findById(id: number) {
    return prisma.blog.findFirst({
      where: { id, eliminado: false },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, avatar: true },
        },
        categoria_blog: { select: { id: true, nombre: true } },
        blog_rechazo: { orderBy: { fecha: "desc" } },
        _count: { select: { comentario: true } },
      },
    });
  },

  async create(data: {
    titulo: string;
    contenido: string;
    imagen?: string;
    estado: estado_blog;
    categoria_id: number;
    usuario_id: number;
  }) {
    return prisma.blog.create({
      data: {
        ...data,
        fecha_publicacion: data.estado === "PUBLICADO" ? new Date() : null,
      },
    });
  },

  async update(
    id: number,
    data: {
      titulo?: string;
      contenido?: string;
      imagen?: string;
      categoria_id?: number;
      estado?: estado_blog;
    },
  ) {
    return prisma.blog.update({ where: { id }, data });
  },

  async uploadImage(file: Express.Multer.File, usuario_id: number) {
    const supabase = getSupabaseClient();
    const extension = getFileExtension(file);
    const filePath = `${usuario_id}/${Date.now()}-${randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("blogs")
      .upload(filePath, file.buffer, {
        cacheControl: "3600",
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`No se pudo subir la imagen del blog: ${error.message}`);
    }

    const { data } = supabase.storage.from("blogs").getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error("No se pudo obtener la URL pública de la imagen");
    }

    return { path: filePath, url: data.publicUrl };
  },

  async changeEstado(id: number, estado: estado_blog, razon_rechazo?: string) {
    const updateData: {
      estado: estado_blog;
      fecha_publicacion?: Date | null;
    } = { estado };

    if (estado === "PUBLICADO") {
      updateData.fecha_publicacion = new Date();
    }

    const [blog] = await prisma.$transaction(async (tx) => {
      const updated = await tx.blog.update({
        where: { id },
        data: updateData,
      });

      if (estado === "RECHAZADO" && razon_rechazo) {
        await tx.blog_rechazo.create({
          data: { blog_id: id, comentario: razon_rechazo },
        });
      }

      return [updated];
    });

    return blog;
  },

  async delete(id: number) {
    return prisma.blog.update({
      where: { id },
      data: { eliminado: true },
    });
  },

  async findAllAdmin(params: {
    estado?: estado_blog;
    categoria_id?: number;
    page?: number;
    limit?: number;
  }) {
    const { estado, categoria_id, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where = {
      eliminado: false,
      ...(estado ? { estado } : {}),
      ...(categoria_id ? { categoria_id } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fecha_creacion: "desc" },
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, avatar: true },
          },
          categoria_blog: { select: { id: true, nombre: true } },
          blog_rechazo: { orderBy: { fecha: "desc" }, take: 1 },
          _count: { select: { comentario: true } },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findAllCategories() {
    return prisma.categoria_blog.findMany({
      orderBy: { nombre: "asc" },
    });
  },
};

export const comentariosRepository = {
  async create(data: {
    contenido: string;
    usuario_id: number;
    blog_id: number;
    comentario_padre_id?: number;
  }) {
    return prisma.comentario.create({
      data,
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, avatar: true },
        },
        _count: { select: { comentario_like: true } },
      },
    });
  },

  async findByBlogId(blog_id: number) {
    return prisma.comentario.findMany({
      where: { blog_id },
      orderBy: { fecha_creacion: "asc" },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, avatar: true },
        },
        _count: { select: { comentario_like: true } },
      },
    });
  },

  async findById(id: number) {
    return prisma.comentario.findUnique({ where: { id } });
  },

  async delete(id: number) {
    return prisma.comentario.delete({ where: { id } });
  },

  async toggleLike(usuario_id: number, comentario_id: number) {
    const existing = await prisma.comentario_like.findUnique({
      where: { usuario_id_comentario_id: { usuario_id, comentario_id } },
    });

    if (existing) {
      await prisma.comentario_like.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      await prisma.comentario_like.create({
        data: { usuario_id, comentario_id },
      });
      return { liked: true };
    }
  },
};
