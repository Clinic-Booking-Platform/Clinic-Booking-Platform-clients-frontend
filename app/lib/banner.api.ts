import api from "./api.clients";
import { Banner, BannersResponse } from "../types/Banner";

export const FALLBACK_BANNERS: Banner[] = [
  {
    id: 101,
    title: "Ưu đãi gói khám sức khỏe tổng quát MỚI NHẤT",
    image_url:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    link_url: "/packages/tong-quat-vip",
    sort_order: 1,
    is_active: true,
  },
  {
    id: 102,
    title: "Đội ngũ chuyên gia bác sĩ hàng đầu tại phòng khám",
    image_url:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80",
    link_url: "/doctors",
    sort_order: 2,
    is_active: true,
  },
  {
    id: 103,
    title: "Tầm soát ung thư sớm - Bảo vệ sức khỏe gia đình bạn",
    image_url:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    link_url: "/packages",
    sort_order: 3,
    is_active: true,
  },
  {
    id: 104,
    title: "Khám chuyên sâu Sản - Phụ khoa & Nhi khoa chất lượng cao",
    image_url:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    link_url: "/specialties/1",
    sort_order: 4,
    is_active: true,
  },
];

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const res = await api.get<BannersResponse>("/banners");
    if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
    return FALLBACK_BANNERS;
  } catch (error) {
    console.warn("Banner API warning (using fallback banners):", error);
    return FALLBACK_BANNERS;
  }
};
