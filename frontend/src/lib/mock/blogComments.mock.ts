import type { BlogComment } from "@/types/blogComment";

export const MAX_BLOG_COMMENT_LENGTH = 500;

export const MOCK_BLOG_COMMENTS: Record<string, BlogComment[]> = {
  "1": [
    {
      id: "comment-1",
      parentId: null,
      author: {
        id: "author-elena",
        name: "Elena Rossi",
        avatarUrl: "https://i.pravatar.cc/120?img=32",
      },
      content:
        "Absolutamente fascinante. En PropBol hemos estado siguiendo estas tendencias muy de cerca. Hay algun proyecto especifico en Madrid que ya este implementando esta tecnologia de captura de carbono?",
      createdAt: "2026-04-24T15:00:00.000Z",
      likeCount: 12,
      likedByCurrentUser: false,
    },
    {
      id: "comment-2",
      parentId: "comment-1",
      author: {
        id: "author-marco",
        name: "Marco V.",
        avatarUrl: "https://i.pravatar.cc/120?img=12",
      },
      content:
        "Elena, el nuevo complejo Reserva del Prado esta usando una variante de este concreto para su fachada estructural. Es una joya de ingenieria.",
      createdAt: "2026-04-24T16:00:00.000Z",
      likeCount: 4,
      likedByCurrentUser: false,
    },
    {
      id: "comment-3",
      parentId: null,
      author: {
        id: "author-roberto",
        name: "Roberto S.",
        avatarUrl: "https://i.pravatar.cc/120?img=14",
      },
      content:
        "Excelente articulo. Como inversionista, me interesa saber como afecta esto a los tiempos de fraguado y construccion. Es comparable al concreto tradicional?",
      createdAt: "2026-04-24T16:15:00.000Z",
      likeCount: 2,
      likedByCurrentUser: false,
    },
    {
      id: "comment-4",
      parentId: null,
      author: {
        id: "author-marta",
        name: "Marta Quiroga",
        avatarUrl: "https://i.pravatar.cc/120?img=47",
      },
      content:
        "Me gusto mucho el enfoque del texto. Seria buenisimo ver un analisis similar pero aterrizado al mercado boliviano y a proyectos de Santa Cruz.",
      createdAt: "2026-04-24T14:10:00.000Z",
      likeCount: 6,
      likedByCurrentUser: true,
    },
    {
      id: "comment-5",
      parentId: "comment-4",
      author: {
        id: "author-pablo",
        name: "Pablo Menacho",
        avatarUrl: "https://i.pravatar.cc/120?img=68",
      },
      content:
        "Totalmente de acuerdo. Esa comparacion local ayudaria mucho a quienes recien estan aprendiendo sobre materiales sostenibles.",
      createdAt: "2026-04-24T14:40:00.000Z",
      likeCount: 1,
      likedByCurrentUser: false,
    },
    {
      id: "comment-6",
      parentId: null,
      author: {
        id: "author-lucia",
        name: "Lucia Fernandez",
        avatarUrl: "https://i.pravatar.cc/120?img=5",
      },
      content:
        "La parte sobre captura de carbono me parecio especialmente potente. Gracias por aterrizarlo con ejemplos y no dejarlo solo en teoria.",
      createdAt: "2026-04-24T12:25:00.000Z",
      likeCount: 3,
      likedByCurrentUser: false,
    },
  ],
  "default": [
    {
      id: "comment-default-1",
      parentId: null,
      author: {
        id: "author-propbol",
        name: "Comunidad PropBol",
        avatarUrl: "https://i.pravatar.cc/120?img=22",
      },
      content:
        "Que te parecio este articulo? Comparte tu opinion o deja una pregunta para abrir la conversacion.",
      createdAt: "2026-04-24T11:00:00.000Z",
      likeCount: 0,
      likedByCurrentUser: false,
    },
  ],
};
