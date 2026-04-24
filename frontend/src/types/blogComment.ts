export type BlogCommentAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type BlogComment = {
  id: string;
  parentId: string | null;
  author: BlogCommentAuthor;
  content: string;
  createdAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
};

export type BlogCommentThread = BlogComment & {
  isOwnComment: boolean;
  replies: BlogCommentThread[];
};
