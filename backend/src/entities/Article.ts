export interface Article {
  id: string;
  title: string;
  author_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateArticleDTO {
  id: string;
  title: string;
  author_id: string;
  content: string;
}

export interface UpdateArticleDTO {
  title?: string;
  author_id?: string;
  content?: string;
}
