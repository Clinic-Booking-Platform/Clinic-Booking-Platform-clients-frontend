export type ArticleAuthor = {
  id: number;
  user?:
    | {
        id: number;
        full_name: string;
        avatar?: string | null;
      }
    | string;
};

export type ArticleSpecialty = {
  id: number;
  name: string;
};

export type ArticleContentDetail = {
  id: number;
  article_id: number;
  html_content: string;
};

export type Article = {
  id: number;
  author_id: number;
  specialty_id: number;
  title: string;
  slug: string;
  thumbnail_url: string;
  short_description: string;
  views: number;
  created_at: string;
  deleted_at?: string | null;
  author?: ArticleAuthor;
  specialty?: ArticleSpecialty;
};

export type ArticleDetail = Article & {
  article_detail?: ArticleContentDetail | null;
};

export type ArticlePagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ArticlesData = {
  articles: Article[];
  pagination: ArticlePagination;
};

export type ArticlesResponse = {
  status: string;
  message: string;
  data: ArticlesData;
};

export type ArticleDetailResponse = {
  status: string;
  message: string;
  data: ArticleDetail;
};

export type ArticleQueryParams = {
  page?: number;
  search?: string;
  specialty_id?: number | string;
  author_id?: number | string;
};
