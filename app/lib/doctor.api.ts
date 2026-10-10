import api from "./api.clients";
import {
  Doctor,
  DoctorQueryParams,
  DoctorsResponse,
  DoctorsData,
} from "../types/Doctor";

export const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: 11,
    user_id: 20,
    specialty_id: 1,
    description: "Bác sĩ chuyên khoa Sản-Phụ khoa với hơn 15 năm kinh nghiệm điều trị và đỡ đẻ an toàn.",
    price: "300000",
    user: {
      id: 20,
      full_name: "BS. CKII Trần Quốc Huy",
      email: "bs.huytran@phongkham.vn",
      avatar:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    },
    specialty: {
      id: 1,
      name: "Sản-Phụ khoa",
      description: "Chuyên khoa sản phụ",
    },
  },
  {
    id: 12,
    user_id: 22,
    specialty_id: 7,
    description: "Bác sĩ chuyên khoa Mắt, điều trị các tật khúc xạ và bệnh lý đáy mắt.",
    price: "360000",
    user: {
      id: 22,
      full_name: "BS. Ba Sáu",
      email: "thanhne@gmail.com",
      avatar:
        "https://res.cloudinary.com/a7ebosnc/image/upload/v1790331450/clinic_booking/images/1790331450117-82ded0ca-8244e7780b07b5969feaa442ea7b529b.jpg",
    },
    specialty: {
      id: 7,
      name: "Mắt",
      description: "Khám, tư vấn và điều trị tật khúc xạ, đục thủy tinh thể.",
    },
  },
  {
    id: 8,
    user_id: 11,
    specialty_id: 4,
    description: "Bác sĩ chuyên khoa Tai Mũi Họng, nội soi vòm họng và phẫu thuật xoang.",
    price: "150000",
    user: {
      id: 11,
      full_name: "BS. Ngô Phương Thảo",
      email: "bs.thao.ngo@phongkham.vn",
      avatar:
        "https://images.unsplash.com/photo-1594824813583-49a8fc4856fd?auto=format&fit=crop&w=600&q=80",
    },
    specialty: {
      id: 4,
      name: "Tai Mũi Họng",
      description: "Chuyên khoa tai mũi họng",
    },
  },
  {
    id: 9,
    user_id: 18,
    specialty_id: 1,
    description: "Bác sĩ chuyên khoa Sản-Phụ khoa, khám tiền sản và siêu âm 5D.",
    price: "150000",
    user: {
      id: 18,
      full_name: "BS. Nguyễn Xuân Thanh",
      email: "doctor01@gmail.com",
      avatar:
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
    },
    specialty: {
      id: 1,
      name: "Sản-Phụ khoa",
      description: "Chuyên khoa sản phụ",
    },
  },
];

export const getDoctors = async (
  params?: DoctorQueryParams
): Promise<DoctorsData> => {
  try {
    const query: Record<string, string | number> = {};
    if (params?.page) query.page = params.page;
    if (params?.pageSize) query.pageSize = params.pageSize;
    if (params?.specialty_id) query.specialty_id = params.specialty_id;
    if (params?.search && params.search.trim() !== "")
      query.search = params.search.trim();

    const res = await api.get<DoctorsResponse>("/doctors", {
      params: query,
    });

    if (res.data && res.data.data && Array.isArray(res.data.data.doctors)) {
      return res.data.data;
    }

    return {
      doctors: FALLBACK_DOCTORS,
      pagination: {
        total: FALLBACK_DOCTORS.length,
        page: 1,
        pageSize: 6,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.warn("Doctor API warning (using fallback data):", error);
    return {
      doctors: FALLBACK_DOCTORS,
      pagination: {
        total: FALLBACK_DOCTORS.length,
        page: 1,
        pageSize: 6,
        totalPages: 1,
      },
    };
  }
};
