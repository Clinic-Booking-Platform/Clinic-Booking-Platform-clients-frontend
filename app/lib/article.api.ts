import api from "./api.clients";
import {
  ArticleQueryParams,
  ArticlesResponse,
  ArticlesData,
  ArticleDetail,
  ArticleDetailResponse,
} from "../types/Article";

export const FALLBACK_ARTICLES: ArticlesData = {
  articles: [
    {
      id: 11,
      author_id: 1,
      specialty_id: 1,
      title: "Cẩm nang chăm sóc sức khỏe tim mạch cho mọi gia đình",
      slug: "cam-nang-cham-soc-suc-khoe-tim-mach",
      thumbnail_url:
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
      short_description:
        "Lời khuyên thiết thực từ các chuyên gia tim mạch hàng đầu giúp phòng ngừa nguy cơ đột quỵ và xơ vữa động mạch.",
      views: 120,
      created_at: "2026-09-10T13:38:43.853Z",
      author: {
        id: 1,
        user: { id: 4, full_name: "BS. Nguyễn Văn An", avatar: null },
      },
      specialty: { id: 1, name: "Sản - Phụ khoa" },
    },
    {
      id: 6,
      author_id: 3,
      specialty_id: 2,
      title: "Chăm sóc da dầu mụn đúng cách vào mùa hè",
      slug: "cham-soc-da-dau-mun-dung-cach-vao-mua-he",
      thumbnail_url:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
      short_description:
        "Hướng dẫn chi tiết quy trình làm sạch sâu, kiềm dầu và chống nắng phổ rộng dành cho da mụn nhạy cảm.",
      views: 95,
      created_at: "2026-09-10T13:16:19.713Z",
      author: {
        id: 3,
        user: { id: 6, full_name: "BS. Lê Hồng Nam", avatar: null },
      },
      specialty: { id: 2, name: "Răng Hàm Mặt" },
    },
    {
      id: 5,
      author_id: 1,
      specialty_id: 1,
      title: "Thoái hóa khớp gối ở người trẻ: Nguyên nhân và cách phòng ngừa",
      slug: "thoai-hoa-khop-goi-o-nguoi-tre-nguyen-nhan-va-phong-ngua",
      thumbnail_url:
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
      short_description:
        "Căn bệnh này đang có xu hướng trẻ hóa rõ rệt ở đối tượng nhân viên văn phòng ít vận động và người thừa cân.",
      views: 315,
      created_at: "2026-09-07T06:39:56.136Z",
      author: {
        id: 1,
        user: { id: 4, full_name: "BS. Nguyễn Văn An", avatar: null },
      },
      specialty: { id: 1, name: "Sản - Phụ khoa" },
    },
    {
      id: 4,
      author_id: 7,
      specialty_id: 4,
      title: "Phân biệt viêm mũi dị ứng và viêm xoang: Nhận biết để điều trị đúng",
      slug: "phan-biet-viem-mui-di-ung-va-viem-xoang",
      thumbnail_url:
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
      short_description:
        "Viêm mũi dị ứng và viêm xoang có nhiều biểu hiện tương đồng nhưng nguyên nhân và phác đồ điều trị hoàn toàn khác nhau.",
      views: 425,
      created_at: "2026-09-07T06:39:56.133Z",
      author: {
        id: 7,
        user: { id: 10, full_name: "BS. Hoàng Quốc Bảo", avatar: null },
      },
      specialty: { id: 4, name: "Tai Mũi Họng" },
    },
  ],
  pagination: {
    page: 1,
    pageSize: 5,
    total: 4,
    totalPages: 1,
  },
};

export const getArticles = async (
  params?: ArticleQueryParams
): Promise<ArticlesData> => {
  try {
    const query: Record<string, string | number> = {};
    if (params?.page) query.page = params.page;
    if (params?.search && params.search.trim() !== "")
      query.search = params.search.trim();
    if (params?.specialty_id !== undefined && params.specialty_id !== "")
      query.specialty_id = params.specialty_id;
    if (params?.author_id !== undefined && params.author_id !== "")
      query.author_id = params.author_id;

    const res = await api.get<ArticlesResponse>("/articles", {
      params: query,
    });

    if (res.data && res.data.data && Array.isArray(res.data.data.articles)) {
      return res.data.data;
    }
    return FALLBACK_ARTICLES;
  } catch (error) {
    console.warn("Article API warning (using fallback data):", error);
    return FALLBACK_ARTICLES;
  }
};

export const getArticleBySlug = async (
  slug: string
): Promise<ArticleDetail | null> => {
  try {
    const res = await api.get<ArticleDetailResponse>(
      `/articles/${encodeURIComponent(slug)}`
    );
    if (res.data && res.data.data) {
      return res.data.data;
    }
    return null;
  } catch (error) {
    console.warn("Lỗi khi tải chi tiết bài viết theo slug:", error);
    return null;
  }
};
