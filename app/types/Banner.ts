export type Banner = {
  id: number;
  title: string;
  image_url: string;
  link_url?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type BannersResponse = {
  status: string;
  message: string;
  data: Banner[];
};
