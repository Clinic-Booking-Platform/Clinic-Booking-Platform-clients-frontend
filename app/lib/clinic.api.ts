import api from "./api.clients";
import {
  Banner,
  Doctor,
  Article,
  Package,
  CartData,
  CreateAppointmentPayload,
  Order,
  OrderDetail,
  BookFromOrderPayload,
  Appointment,
  CheckoutCartResponse,
  Specialty,
} from "../types/Clinic";

// Fallback high-fidelity mock data matching backend schema
export const MOCK_BANNERS: Banner[] = [
  {
    id: 1,
    title: "Chăm sóc sức khỏe toàn diện cho gia đình bạn",
    image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop",
    link_url: "#packages",
    sort_order: 1,
    is_active: true,
  },
  {
    id: 2,
    title: "Đội ngũ chuyên gia y tế hàng đầu sẵn sàng đồng hành",
    image_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1600&auto=format&fit=crop",
    link_url: "#doctors",
    sort_order: 2,
    is_active: true,
  },
  {
    id: 3,
    title: "Gói khám tổng quát định kỳ - Tầm soát bệnh lý sớm",
    image_url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1600&auto=format&fit=crop",
    link_url: "#packages",
    sort_order: 3,
    is_active: true,
  },
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    user_id: 101,
    specialty_id: 1,
    description: "Hơn 20 năm kinh nghiệm trong chẩn đoán và điều trị bệnh lý tim mạch, từng công tác tại Viện Tim TP.HCM và tu nghiệp tại Pháp.",
    price: 450000,
    status: "ACTIVE",
    experience_years: 22,
    qualifications: [
      "Tốt nghiệp Bác sĩ Nội trú Đại học Y Dược TP.HCM",
      "Tu nghiệp Tim mạch Can thiệp tại Bệnh viện Rangueil (Pháp)",
      "Thành viên Hội Tim Mạch Học Việt Nam (VNHA)",
    ],
    work_schedule: "Thứ 2, Thứ 4, Thứ 6 (08:00 - 17:00)",
    user: {
      id: 101,
      full_name: "PGS.TS.BS Nguyễn Văn An",
      email: "nguyenvanan.md@medicare.vn",
      phone_number: "0908123456",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
      gender: "MALE",
    },
    specialty: {
      id: 1,
      name: "Chuyên khoa Tim Mạch",
      description: "Khám và điều trị tăng huyết áp, bệnh mạch vành, rối loạn nhịp tim",
    },
  },
  {
    id: 2,
    user_id: 102,
    specialty_id: 2,
    description: "Chuyên gia đầu ngành Nội tiết - Tiểu đường, thành viên Hội Nội tiết Việt Nam, giàu kinh nghiệm quản lý bệnh lý chuyển hóa phức tạp.",
    price: 400000,
    status: "ACTIVE",
    experience_years: 18,
    qualifications: [
      "Bác sĩ Chuyên khoa II Đại học Y Hà Nội",
      "Chứng chỉ Quản lý Đái tháo đường & Tuyến giáp Hoa Kỳ (ADA)",
      "Nguyên Phó Trưởng khoa Nội tiết Bệnh viện Bạch Mai",
    ],
    work_schedule: "Thứ 3, Thứ 5, Thứ 7 (08:00 - 16:00)",
    user: {
      id: 102,
      full_name: "BS.CKII Trần Thị Mai",
      email: "tranthimai.md@medicare.vn",
      phone_number: "0912345678",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
      gender: "FEMALE",
    },
    specialty: {
      id: 2,
      name: "Nội Tiết & Tiểu Đường",
      description: "Tầm soát và điều trị đái tháo đường, bệnh lý tuyến giáp, suy tuyến thượng thận",
    },
  },
  {
    id: 3,
    user_id: 103,
    specialty_id: 3,
    description: "Nguyên Phó Trưởng khoa Tiêu hóa Bệnh viện Chợ Rẫy, chuyên sâu nội soi tiêu hóa không đau và can thiệp điều trị bệnh lý dạ dày - đại tràng.",
    price: 500000,
    status: "ACTIVE",
    experience_years: 16,
    qualifications: [
      "Thạc sĩ Y học Chuyên ngành Tiêu hóa - Gan Mật",
      "Chứng chỉ Nội soi can thiệp NBI nâng cao tại Nhật Bản",
      "Thành viên Hội Tiêu Hóa Việt Nam",
    ],
    work_schedule: "Thứ 2, Thứ 3, Thứ 5, Thứ 7 (07:30 - 16:30)",
    user: {
      id: 103,
      full_name: "ThS.BS Lê Hoàng Long",
      email: "lehoanglong.md@medicare.vn",
      phone_number: "0934567890",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=800&auto=format&fit=crop",
      gender: "MALE",
    },
    specialty: {
      id: 3,
      name: "Nội Tiêu Hóa & Gan Mật",
      description: "Chẩn đoán trào ngược dạ dày, viêm loét HP, gan nhiễm mỡ, viêm gan siêu vi",
    },
  },
  {
    id: 4,
    user_id: 104,
    specialty_id: 4,
    description: "Bác sĩ chuyên khoa Nhi với hơn 15 năm kinh nghiệm điều trị bệnh hô hấp, tiêu hóa nhi khoa, tận tâm, thân thiện và thấu hiểu tâm lý trẻ nhỏ.",
    price: 350000,
    status: "ACTIVE",
    experience_years: 15,
    qualifications: [
      "Bác sĩ Chuyên khoa I Nhi khoa - Đại học Y Dược TP.HCM",
      "Chứng chỉ Dinh dưỡng lâm sàng Nhi khoa Quốc gia",
      "Nguyên Bác sĩ điều trị Bệnh viện Nhi Đồng 2",
    ],
    work_schedule: "Thứ 2 đến Thứ 6 (08:00 - 17:00)",
    user: {
      id: 104,
      full_name: "BS.CKI Phạm Quỳnh Chi",
      email: "phamquynhchi.md@medicare.vn",
      phone_number: "0978901234",
      avatar: "https://images.unsplash.com/photo-1594824813571-638f02614d3f?q=80&w=800&auto=format&fit=crop",
      gender: "FEMALE",
    },
    specialty: {
      id: 4,
      name: "Chuyên Khoa Nhi",
      description: "Tư vấn dinh dưỡng, tiêm chủng, điều trị bệnh lý hô hấp và tiêu hóa ở trẻ em",
    },
  },
  {
    id: 5,
    user_id: 105,
    specialty_id: 5,
    description: "Tiến sĩ Tai Mũi Họng giàu kinh nghiệm chẩn đoán và điều trị viêm xoang mạn, viêm amidan, polyp mũi và suy giảm thính lực.",
    price: 450000,
    status: "ACTIVE",
    experience_years: 17,
    qualifications: [
      "Tiến sĩ Y học Chuyên ngành Tai Mũi Họng",
      "Chứng chỉ Phẫu thuật nội soi xoang mũi Bệnh viện Tai Mũi Họng TW",
      "Thành viên Hội Tai Mũi Họng Việt Nam",
    ],
    work_schedule: "Thứ 2, Thứ 4, Thứ 7, Chủ Nhật (08:00 - 16:30)",
    user: {
      id: 105,
      full_name: "TS.BS Hoàng Minh Tuấn",
      email: "hoangminhtuan.md@medicare.vn",
      phone_number: "0965432109",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop",
      gender: "MALE",
    },
    specialty: {
      id: 5,
      name: "Tai Mũi Họng",
      description: "Khám nội soi tầm soát ung thư vòm họng, viêm xoang, thanh quản",
    },
  },
  {
    id: 6,
    user_id: 106,
    specialty_id: 6,
    description: "Chuyên gia Da liễu & Thẩm mỹ Nội khoa, chuyên sâu điều trị mụn trứng cá nặng, viêm da cơ địa, nám da và trẻ hóa da công nghệ cao.",
    price: 380000,
    status: "ACTIVE",
    experience_years: 12,
    qualifications: [
      "Thạc sĩ Bác sĩ Da liễu Đại học Y Dược TP.HCM",
      "Chứng chỉ Ứng dụng Laser và Ánh sáng trong Da liễu",
      "Thành viên Hội Da Liễu Học TP.HCM",
    ],
    work_schedule: "Thứ 3, Thứ 5, Thứ 6, Chủ Nhật (08:30 - 17:30)",
    user: {
      id: 106,
      full_name: "ThS.BS Vũ Thu Trang",
      email: "vuthutrang.md@medicare.vn",
      phone_number: "0987654321",
      avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop",
      gender: "FEMALE",
    },
    specialty: {
      id: 6,
      name: "Da Liễu & Thẩm Mỹ",
      description: "Chẩn đoán và điều trị bệnh ngoài da, dị ứng, laser thẩm mỹ y khoa",
    },
  },
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    author_id: 1,
    specialty_id: 1,
    title: "10 Dấu hiệu cảnh báo sớm bệnh lý tim mạch bạn không nên xem thường",
    slug: "10-dau-hieu-canh-bao-som-benh-ly-tim-mach",
    thumbnail_url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop",
    short_description: "Tìm hiểu các triệu chứng phổ biến như đau thắt ngực, khó thở khi gắng sức, hồi hộp trống ngực để chủ động tầm soát kịp thời.",
    views: 1250,
    created_at: "2026-03-20T08:30:00.000Z",
    author: {
      user: {
        full_name: "PGS.TS.BS Nguyễn Văn An",
      },
    },
    specialty: {
      id: 1,
      name: "Tim Mạch",
    },
    article_detail: {
      id: 1,
      article_id: 1,
      html_content: `
        <p>Bệnh tim mạch là một trong những nguyên nhân hàng đầu gây tử vong trên toàn cầu. Nhận biết sớm các triệu chứng giúp ngăn ngừa nguy cơ đột quỵ và nhồi máu cơ tim:</p>
        <h3 class="font-bold text-lg mt-3">1. Cảm giác đau thắt, đè nặng vùng ngực</h3>
        <p>Đây là dấu hiệu điển hình nhất. Cơn đau có thể lan lên cổ, hàm, vai hoặc cánh tay trái.</p>
        <h3 class="font-bold text-lg mt-3">2. Khó thở bất thường</h3>
        <p>Khó thở xuất hiện ngay cả khi nghỉ ngơi hoặc vận động nhẹ cảnh báo suy giảm chức năng tim.</p>
        <h3 class="font-bold text-lg mt-3">3. Mệt mỏi kéo dài, choáng váng</h3>
        <p>Lưu lượng máu cung cấp cho não và các cơ quan không đủ khiến cơ thể luôn uể oải.</p>
      `,
    },
  },
  {
    id: 2,
    author_id: 2,
    specialty_id: 2,
    title: "Chế độ dinh dưỡng khoa học giúp ổn định đường huyết cho người đái tháo đường",
    slug: "che-do-dinh-duong-khoa-hoc-on-dinh-duong-huyet",
    thumbnail_url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800&auto=format&fit=crop",
    short_description: "Hướng dẫn lựa chọn thực phẩm có chỉ số đường huyết thấp (GI thấp), phân bổ khẩu phần ăn hợp lý để duy trì đường huyết ổn định.",
    views: 940,
    created_at: "2026-03-18T10:15:00.000Z",
    author: {
      user: {
        full_name: "BS.CKII Trần Thị Mai",
      },
    },
    specialty: {
      id: 2,
      name: "Nội Tiết",
    },
    article_detail: {
      id: 2,
      article_id: 2,
      html_content: `
        <p>Một chế độ dinh dưỡng cân đối là chìa khóa vàng giúp kiểm soát bệnh tiểu đường hiệu quả mà không cần kiêng khem quá mức:</p>
        <h3 class="font-bold text-lg mt-3">1. Ưu tiên ngũ cốc nguyên hạt</h3>
        <p>Gạo lứt, yến mạch giàu chất xơ hòa tan giúp làm chậm quá trình hấp thu đường vào máu.</p>
        <h3 class="font-bold text-lg mt-3">2. Tăng cường rau xanh đậm và đạm nạc</h3>
        <p>Rau cải bó xôi, súp lơ xanh kết hợp cá hồi, ức gà tạo bữa ăn giàu dưỡng chất, no lâu.</p>
      `,
    },
  },
  {
    id: 3,
    author_id: 3,
    specialty_id: 3,
    title: "Vi khuẩn HP dạ dày: Lây truyền qua đâu và cách điều trị dứt điểm",
    slug: "vi-khuan-hp-da-day-lay-truyen-va-dieu-tri",
    thumbnail_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop",
    short_description: "Helicobacter pylori (HP) là thủ phạm gây viêm loét dạ dày và nguy cơ ung thư dạ dày. Cùng tìm hiểu con đường lây nhiễm và phác đồ tiệt trừ.",
    views: 1820,
    created_at: "2026-03-15T14:00:00.000Z",
    author: {
      user: {
        full_name: "ThS.BS Lê Hoàng Long",
      },
    },
    specialty: {
      id: 3,
      name: "Tiêu Hóa",
    },
    article_detail: {
      id: 3,
      article_id: 3,
      html_content: `
        <p>Vi khuẩn HP lây nhiễm qua đường miệng - miệng hoặc phân - miệng. Việc điều trị dứt điểm cần tuân thủ nghiêm ngặt phác đồ kháng sinh kết hợp ức chế tiết axit theo chỉ định của bác sĩ chuyên khoa.</p>
      `,
    },
  },
];

export const MOCK_PACKAGES: Package[] = [
  {
    id: 1,
    name: "Gói Khám Tổng Quát Tiêu Chuẩn",
    description: "Kiểm tra toàn diện các chỉ số sinh hóa máu, nước tiểu, chức năng gan thận, điện tâm đồ và chụp X-quang tim phổi.",
    thumbnail_url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
    price: 1500000,
    discount_price: 1200000,
    package_detail: {
      id: 1,
      package_id: 1,
      html_content: `
        <div class="space-y-4">
          <h4 class="font-bold text-slate-900 text-base">1. Khám lâm sàng & Đo thể lực</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Đo sinh hiệu: Huyết áp, mạch, chiều cao, cân nặng, chỉ số BMI.</li>
            <li>Khám Nội tổng quát: Khám tim mạch, hô hấp, tiêu hóa, thận - tiết niệu.</li>
            <li>Khám Mắt: Đo thị lực, kiểm tra sắc giác, soi đáy mắt cơ bản.</li>
            <li>Khám Tai Mũi Họng: Kiểm tra vòm họng, màng nhĩ, thanh quản.</li>
            <li>Khám Răng Hàm Mặt: Kiểm tra sâu răng, nha chu, cao răng.</li>
          </ul>

          <h4 class="font-bold text-slate-900 text-base mt-4">2. Xét nghiệm Huyết học & Sinh hóa</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Tổng phân tích tế bào máu ngoại vi (24 thông số): Đánh giá tình trạng thiếu máu, nhiễm trùng.</li>
            <li>Đo đường huyết lúc đói (Glucose): Sàng lọc bệnh đái tháo đường.</li>
            <li>Chức năng thận (Ure, Creatinine): Đánh giá mức lọc cầu thận.</li>
            <li>Chức năng gan (AST, ALT, GGT): Đánh giá tổn thương tế bào gan, viêm gan.</li>
            <li>Bộ mỡ máu (Cholesterol toàn phần, Triglyceride, HDL-C, LDL-C): Sàng lọc rối loạn lipid máu, nguy cơ xơ vữa động mạch.</li>
            <li>Axit Uric: Tầm soát nguy cơ bệnh Gout.</li>
            <li>Tổng phân tích nước tiểu (10 thông số): Phát hiện sớm bệnh lý đường tiết niệu, đái tháo đường.</li>
          </ul>

          <h4 class="font-bold text-slate-900 text-base mt-4">3. Chẩn đoán hình ảnh & Thăm dò chức năng</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Chụp X-quang ngực thẳng kỹ thuật số: Phát hiện các bất thường ở phổi, tim, lồng ngực.</li>
            <li>Siêu âm ổ bụng tổng quát màu: Khảo sát hình thái gan, mật, tụy, lách, thận, bàng quang, tiền liệt tuyến/tử cung buồng trứng.</li>
            <li>Điện tâm đồ (ECG 12 chuyển đạo): Phát hiện rối loạn nhịp tim, thiếu máu cơ tim.</li>
          </ul>

          <h4 class="font-bold text-slate-900 text-base mt-4">4. Tư vấn kết quả cùng Bác sĩ Chuyên khoa</h4>
          <p class="text-slate-600">Bác sĩ đọc kết quả chi tiết, giải thích các chỉ số bất thường và định hướng chế độ dinh dưỡng, vận động, phác đồ điều trị nếu có.</p>
        </div>
      `,
    },
  },
  {
    id: 2,
    name: "Gói Tầm Soát Tim Mạch & Huyết Áp Chuyên Sâu",
    description: "Bao gồm siêu âm Doppler tim màu, điện tâm đồ gắng sức, xét nghiệm mỡ máu toàn phần và tư vấn chuyên gia tim mạch.",
    thumbnail_url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop",
    price: 2800000,
    discount_price: 2450000,
    package_detail: {
      id: 2,
      package_id: 2,
      html_content: `
        <div class="space-y-4">
          <h4 class="font-bold text-slate-900 text-base">1. Khám chuyên sâu Tim mạch</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Khám chuyên khoa với Chuyên gia/Bác sĩ CKII Tim mạch.</li>
            <li>Đánh giá nguy cơ biến cố tim mạch 10 năm theo thang điểm SCORE/Framingham.</li>
          </ul>

          <h4 class="font-bold text-slate-900 text-base mt-4">2. Chẩn đoán hình ảnh Tim mạch cao cấp</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Siêu âm Doppler tim màu: Đánh giá chức năng bơm máu thất trái (EF), van tim, màng ngoài tim, kích thước buồng tim.</li>
            <li>Điện tâm đồ ECG 12 chuyển đạo: Phát hiện thiếu máu cơ tim thầm lặng, dày thất, rối loạn dẫn truyền.</li>
            <li>Siêu âm Doppler động mạch cảnh 2 bên: Phát hiện mảng xơ vữa gây hẹp động mạch, nguy cơ đột quỵ não.</li>
            <li>Chụp X-quang tim phổi thẳng.</li>
          </ul>

          <h4 class="font-bold text-slate-900 text-base mt-4">3. Xét nghiệm chuyên sâu dấu ấn sinh học</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Lipid máu toàn phần (Cholesterol, Triglyceride, HDL, LDL).</li>
            <li>Điện giải đồ (Na+, K+, Cl-).</li>
            <li>Đường huyết và HbA1c (theo dõi đường huyết 3 tháng).</li>
            <li>Định lượng Troponin / hs-CRP (đánh giá nguy cơ viêm mạch và nhồi máu cơ tim sớm).</li>
          </ul>
        </div>
      `,
    },
  },
  {
    id: 3,
    name: "Gói Khám Tiêu Hóa - Nội Soi Không Đau",
    description: "Nội soi dạ dày - đại tràng tiền mê không đau, xét nghiệm tìm vi khuẩn HP bằng test thở và sinh thiết mô bệnh học.",
    thumbnail_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop",
    price: 3500000,
    discount_price: 3100000,
    package_detail: {
      id: 3,
      package_id: 3,
      html_content: `
        <div class="space-y-4">
          <h4 class="font-bold text-slate-900 text-base">1. Khám chuyên khoa Tiêu hóa</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Khám lâm sàng và đánh giá triệu chứng trào ngược, ợ chua, đau thượng vị, rối loạn phân.</li>
            <li>Khám tiền mê đảm bảo an toàn tuyệt đối trước khi nội soi.</li>
          </ul>

          <h4 class="font-bold text-slate-900 text-base mt-4">2. Nội soi can thiệp độ phân giải cao NBI</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Nội soi thực quản - dạ dày - tá tràng tiền mê (ngủ êm ái, hoàn toàn không buồn nôn, không đau).</li>
            <li>Nội soi đại trực tràng toàn bộ (tầm soát polyp và ung thư sớm đại trực tràng).</li>
            <li>Test Clotest nhanh tìm vi khuẩn Helicobacter pylori (HP) tại chỗ.</li>
            <li>Sinh thiết mô tế bào học nếu phát hiện tổn thương nghi ngờ (đã bao gồm giải phẫu bệnh).</li>
          </ul>

          <h4 class="font-bold text-slate-900 text-base mt-4">3. Xét nghiệm hỗ trợ</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Xét nghiệm đông máu cơ bản (PT, APTT) phục vụ an toàn nội soi.</li>
            <li>Siêu âm màu ổ bụng tổng quát khảo sát gan, mật, tụy.</li>
          </ul>
        </div>
      `,
    },
  },
  {
    id: 4,
    name: "Gói Khám Sức Khỏe Nhi Khoa Toàn Diện",
    description: "Đánh giá tăng trưởng chiều cao, cân nặng, tư vấn vi chất, khám mắt, tai mũi họng và xét nghiệm sàng lọc thiếu máu thiếu sắt.",
    thumbnail_url: "https://images.unsplash.com/photo-1594824813571-638f02614d3f?q=80&w=800&auto=format&fit=crop",
    price: 1800000,
    discount_price: 1500000,
    package_detail: {
      id: 4,
      package_id: 4,
      html_content: `
        <div class="space-y-4">
          <h4 class="font-bold text-slate-900 text-base">1. Khám và Đánh giá phát triển Nhi khoa</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Đo các chỉ số nhân trắc học: Chiều cao, cân nặng, vòng đầu, đối chiếu biểu đồ tăng trưởng chuẩn WHO.</li>
            <li>Khám thể chất tổng quát: Nghe tim phổi, kiểm tra cột sống, khớp háng, da và niêm mạc.</li>
            <li>Khám chuyên sâu Tai Mũi Họng: Nội soi tai mũi họng nhẹ nhàng, kiểm tra viêm VA, Amidan.</li>
            <li>Khám Mắt và Răng miệng tuổi học đường.</li>
          </ul>

          <h4 class="font-bold text-slate-900 text-base mt-4">2. Xét nghiệm sàng lọc vi chất</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Tổng phân tích tế bào máu ngoại vi (tầm soát thiếu máu nhược sắc, Thalassemia).</li>
            <li>Định lượng Sắt huyết thanh và Ferritin.</li>
            <li>Định lượng Canxi toàn phần, Canxi ion hóa, Kẽm và Vitamin D3.</li>
            <li>Soi phân tìm ký sinh trùng đường ruột (giun, sán).</li>
          </ul>

          <h4 class="font-bold text-slate-900 text-base mt-4">3. Tư vấn chuyên gia dinh dưỡng và tiêm chủng</h4>
          <p class="text-slate-600">Tư vấn tháp dinh dưỡng phù hợp theo từng độ tuổi, giải quyết tình trạng biếng ăn, chậm tăng cân và kiểm tra lịch sử tiêm chủng vaccine cần bổ sung.</p>
        </div>
      `,
    },
  },
  {
    id: 5,
    name: "Gói Tầm Soát Đái Tháo Đường & Chuyển Hóa",
    description: "Sàng lọc nguy cơ tiền đái tháo đường, biến chứng thận, mắt và thần kinh ngoại biên cho người thừa cân, tăng huyết áp.",
    thumbnail_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
    price: 1600000,
    discount_price: 1350000,
    package_detail: {
      id: 5,
      package_id: 5,
      html_content: `
        <div class="space-y-4">
          <h4 class="font-bold text-slate-900 text-base">1. Khám chuyên khoa Nội tiết</h4>
          <p class="text-slate-600">Bác sĩ chuyên khoa Nội tiết - Đái tháo đường trực tiếp đánh giá nguy cơ biến chứng mạch máu lớn và vi mạch.</p>
          <h4 class="font-bold text-slate-900 text-base mt-4">2. Xét nghiệm sinh hóa chuyên sâu</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Đường huyết đói (Fasting Glucose) & HbA1c (phản ánh đường huyết 3 tháng).</li>
            <li>Định lượng Insulin huyết thanh đánh giá mức độ kháng insulin.</li>
            <li>Microalbumin niệu định lượng (phát hiện sớm biến chứng thận ở bệnh nhân tiểu đường).</li>
            <li>Bilan mỡ máu toàn diện và chức năng gan thận.</li>
          </ul>
        </div>
      `,
    },
  },
  {
    id: 6,
    name: "Gói Khám Sức Khỏe Tiền Hôn Nhân & Sinh Sản",
    description: "Khám toàn diện sức khỏe sinh sản, sàng lọc bệnh di truyền, bệnh truyền nhiễm và tư vấn chuẩn bị mang thai an toàn.",
    thumbnail_url: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=800&auto=format&fit=crop",
    price: 2500000,
    discount_price: 2100000,
    package_detail: {
      id: 6,
      package_id: 6,
      html_content: `
        <div class="space-y-4">
          <h4 class="font-bold text-slate-900 text-base">1. Khám chuyên khoa Sản Phụ khoa / Nam khoa</h4>
          <p class="text-slate-600">Khám tổng quát cơ quan sinh dục, siêu âm tử cung - buồng trứng hoặc siêu âm tinh hoàn, tiền liệt tuyến.</p>
          <h4 class="font-bold text-slate-900 text-base mt-4">2. Xét nghiệm di truyền & Bệnh truyền nhiễm</h4>
          <ul class="list-disc pl-5 space-y-1 text-slate-600">
            <li>Sàng lọc bệnh tan máu bẩm sinh Thalassemia (Tổng phân tích máu, điện di huyết sắc tố).</li>
            <li>Sàng lọc viêm gan B (HBsAg, Anti-HBs), Viêm gan C, HIV, Giang mai (VDRL/TPHA).</li>
            <li>Kháng thể Rubella IgG/IgM cho nữ giới chuẩn bị mang thai.</li>
          </ul>
        </div>
      `,
    },
  },
];

// ================= API CALLS WITH FALLBACK =================

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const res = await api.get("/banners");
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err: any) {
    console.warn("[API getBanners] Failed (backend requires login token):", err?.response?.data || err.message);
  }
  return MOCK_BANNERS;
};

export const getArticles = async (params?: { page?: number; search?: string; specialty_id?: number; pageSize?: number }): Promise<Article[]> => {
  try {
    const firstRes = await api.get("/articles", { params: { page: 1, ...params } });
    if (firstRes.data?.data?.articles && Array.isArray(firstRes.data.data.articles)) {
      let allArticles = [...firstRes.data.data.articles];
      const totalPages = firstRes.data.data.pagination?.totalPages || 1;
      if (!params?.page && totalPages > 1) {
        const remainingReqs = [];
        for (let p = 2; p <= totalPages; p++) {
          remainingReqs.push(
            api.get("/articles", { params: { page: p, ...params } })
          );
        }
        const responses = await Promise.all(remainingReqs);
        for (const r of responses) {
          if (r.data?.data?.articles && Array.isArray(r.data.data.articles)) {
            allArticles.push(...r.data.data.articles);
          }
        }
      }
      return allArticles.filter((a: any) => !a.deleted_at);
    }
    if (Array.isArray(firstRes.data?.data) && firstRes.data.data.length > 0) {
      return firstRes.data.data;
    }
  } catch (err: any) {
    console.warn("[API getArticles] Failed:", err?.response?.data || err.message);
  }
  return MOCK_ARTICLES;
};

export const getArticleByIdOrSlug = async (idOrSlug: string | number): Promise<Article | null> => {
  const queryStr = String(idOrSlug);
  try {
    const res = await api.get(`/articles/${queryStr}`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err: any) {
    console.warn(`[API getArticle] Failed for "${queryStr}":`, err?.response?.data || err.message);
  }
  const found = MOCK_ARTICLES.find(
    (a) => a.slug === queryStr || String(a.id) === queryStr
  );
  return found || null;
};

export const getArticleBySlug = getArticleByIdOrSlug;
export const getArticleById = getArticleByIdOrSlug;


export const getDoctors = async (params?: { specialty_id?: number; search?: string; pageSize?: number; page?: number }): Promise<Doctor[]> => {
  try {
    const res = await api.get("/doctors", { params: { all: true, ...params } });
    // Backend returns { status: 'success', data: { doctors: [...], pagination: {...} } }
    if (res.data?.data?.doctors && Array.isArray(res.data.data.doctors) && res.data.data.doctors.length > 0) {
      return res.data.data.doctors.filter((d: any) => !d.deleted_at && d.status !== "INACTIVE");
    }
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data.filter((d: any) => !d.deleted_at);
    }
  } catch (err: any) {
    console.warn("[API getDoctors] Failed (backend requires login token):", err?.response?.data || err.message);
  }
  return MOCK_DOCTORS;
};

export const getDoctorById = async (id: number | string): Promise<Doctor | null> => {
  try {
    const res = await api.get(`/doctors/${id}`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err: any) {
    console.warn(`[API getDoctorById] Failed for ID ${id}:`, err?.response?.data || err.message);
  }
  const found = MOCK_DOCTORS.find((d) => d.id === Number(id));
  return found || null;
};

export const getSpecialties = async (params?: { pageSize?: number }): Promise<Specialty[]> => {
  try {
    const res = await api.get("/specialties", { params: { pageSize: 50, ...params } });
    // Backend returns { status: 'success', data: { specialties: [...], pagination: {...} } }
    if (res.data?.data?.specialties && Array.isArray(res.data.data.specialties) && res.data.data.specialties.length > 0) {
      return res.data.data.specialties;
    }
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (err: any) {
    console.warn("[API getSpecialties] Failed (backend requires login token):", err?.response?.data || err.message);
  }
  return [];
};

export const getPackages = async (params?: { search?: string; status?: string; page?: number; pageSize?: number }): Promise<Package[]> => {
  try {
    const firstRes = await api.get("/packages", {
      params: { status: "active", page: 1, ...params },
    });
    // Backend returns { status: 'success', data: { packages: [...], pagination: {...} } }
    if (firstRes.data?.data?.packages && Array.isArray(firstRes.data.data.packages)) {
      let allPkgs = [...firstRes.data.data.packages];
      const totalPages = firstRes.data.data.pagination?.totalPages || 1;
      // If caller did not request a single page, fetch remaining pages to retrieve all active packages
      if (!params?.page && totalPages > 1) {
        const remainingReqs = [];
        for (let p = 2; p <= totalPages; p++) {
          remainingReqs.push(
            api.get("/packages", { params: { status: "active", page: p, ...params } })
          );
        }
        const responses = await Promise.all(remainingReqs);
        for (const r of responses) {
          if (r.data?.data?.packages && Array.isArray(r.data.data.packages)) {
            allPkgs.push(...r.data.data.packages);
          }
        }
      }
      return allPkgs.filter((p: any) => !p.deleted_at);
    }
    if (firstRes.data?.data && Array.isArray(firstRes.data.data) && firstRes.data.data.length > 0) {
      return firstRes.data.data.filter((p: any) => !p.deleted_at);
    }
  } catch (err: any) {
    console.warn("[API getPackages] Failed (backend requires login token):", err?.response?.data || err.message);
  }
  return MOCK_PACKAGES.filter((p: any) => !p.deleted_at);
};

export const getPackageById = async (id: number | string): Promise<Package | null> => {
  try {
    const res = await api.get(`/packages/${id}`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err: any) {
    console.warn(`[API getPackageById] Failed for ID ${id}:`, err?.response?.data || err.message);
  }
  const found = MOCK_PACKAGES.find((p) => p.id === Number(id));
  return found || null;
};

export const getCart = async (): Promise<CartData | null> => {
  try {
    const res = await api.get("/cart");
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err: any) {
    console.warn("[API getCart] Failed:", err?.response?.data || err.message);
  }
  return null;
};

export const addToCartAPI = async (package_id: number, quantity: number = 1): Promise<any> => {
  try {
    const res = await api.post("/cart/items", { package_id, quantity });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateCartQuantityAPI = async (package_id: number, quantity: number): Promise<any> => {
  try {
    const res = await api.put(`/cart-quantity/${package_id}`, { quantity });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCartItemAPI = async (package_id: number): Promise<any> => {
  try {
    const res = await api.delete(`/carts/${package_id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createAppointmentAPI = async (payload: CreateAppointmentPayload): Promise<any> => {
  try {
    const res = await api.post("/appointments", payload);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// ================= LUỒNG 2: THANH TOÁN VNPAY & ĐẶT LỊCH TỪ ĐƠN HÀNG =================

const MOCK_ORDERS_KEY = "medicare_mock_orders";

export const getMockOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOCK_ORDERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
};

export const saveMockOrders = (orders: Order[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
  } catch {}
};

/**
 * 1. Gọi POST /payment/checkout-cart (hoặc /api/v1/payment/checkout-cart)
 * Tạo đơn hàng UNPAID từ giỏ hàng hiện tại và nhận payment_url của VNPay
 */
export const checkoutCartAPI = async (): Promise<CheckoutCartResponse> => {
  try {
    const res = await api.post("/payment/checkout-cart");
    if (res.data?.data) {
      return res.data.data;
    }
    if (res.data?.payment_url) {
      return res.data;
    }
  } catch (error: any) {
    // If backend returns a business error (e.g. cart empty), rethrow
    if (error?.response?.data?.message) {
      throw error;
    }
  }

  // Fallback mô phỏng offline: lấy giỏ hàng hiện tại tạo Order
  const cartRaw = typeof window !== "undefined" ? localStorage.getItem("medicare_cart") : null;
  const cartItems = cartRaw ? JSON.parse(cartRaw) : [];
  if (cartItems.length === 0) {
    throw new Error("Giỏ hàng của bạn đang trống");
  }

  const orderCode = "ORD_" + Date.now().toString().slice(-6);
  let totalPrice = 0;

  const orderDetails: OrderDetail[] = cartItems.map((item: any, idx: number) => {
    const itemPrice = Number(item.package?.discount_price ?? item.package?.price ?? item.price ?? 0);
    totalPrice += itemPrice * item.quantity;
    return {
      id: Date.now() + idx,
      order_id: Date.now(),
      package_id: item.package_id,
      package_name: item.package?.name || "Gói khám sức khỏe",
      quantity: item.quantity,
      price: itemPrice,
      used_quantity: 0,
      used_count: 0,
      remaining_quantity: item.quantity,
      package: item.package,
    };
  });

  const mockOrder: Order = {
    id: Date.now(),
    order_code: orderCode,
    user_id: 1,
    total_price: totalPrice,
    payment_status: "UNPAID",
    created_at: new Date().toISOString(),
    order_details: orderDetails,
  };

  const existingOrders = getMockOrders();
  saveMockOrders([mockOrder, ...existingOrders]);

  return {
    order_code: orderCode,
    payment_url: `/payment/vnpay-return?vnp_ResponseCode=00&vnp_TxnRef=${orderCode}&vnp_Amount=${totalPrice * 100}`,
    total_price: totalPrice,
  };
};

/**
 * 2. Xác nhận thanh toán VNPay và chuyển trạng thái đơn hàng sang PAID
 */
export const verifyPaymentReturnAPI = async (queryParams: Record<string, string>): Promise<any> => {
  try {
    const res = await api.get("/payment/vnpay-return", { params: queryParams });
    return res.data?.data ?? res.data;
  } catch (error: any) {
    // Fall back only for local demo/payment simulations.
  }

  const rawTxnRef = queryParams.vnp_TxnRef || "";
  const orderCode = rawTxnRef.split("_")[0] ? rawTxnRef : rawTxnRef;
  if (queryParams.vnp_ResponseCode && queryParams.vnp_ResponseCode !== "00") {
    return {
      isSuccess: false,
      isVerified: false,
      message: "Thanh toán VNPay không thành công",
      order_code: orderCode,
    };
  }

  const orders = getMockOrders();
  const orderIndex = orders.findIndex((o) => o.order_code === orderCode || orderCode.includes(o.order_code));
  if (orderIndex > -1) {
    orders[orderIndex].payment_status = "PAID";
    saveMockOrders(orders);
  }

  // Xóa giỏ hàng sau khi thanh toán thành công
  if (typeof window !== "undefined") {
    localStorage.removeItem("medicare_cart");
  }

  return {
    isSuccess: true,
    isVerified: true,
    message: "Thanh toán đơn hàng thành công qua VNPay",
    order_code: orderCode,
  };
};

/**
 * 3. Lấy danh sách các đơn hàng của người dùng hiện tại
 */
export const getUserOrdersAPI = async (params?: { status?: string }): Promise<Order[]> => {
  try {
    const res = await api.get("/orders", { params });
    if (res.data?.data?.orders && Array.isArray(res.data.data.orders)) {
      return res.data.data.orders;
    }
    if (Array.isArray(res.data?.data)) {
      return res.data.data;
    }
  } catch {}

  const mockOrders = getMockOrders();
  if (params?.status) {
    return mockOrders.filter((o) => o.payment_status === params.status?.toUpperCase());
  }
  return mockOrders;
};

/**
 * Lấy chi tiết đơn hàng theo ID hoặc order_code
 */
export const getOrderDetailAPI = async (id: number | string): Promise<Order | null> => {
  try {
    const res = await api.get(`/orders/${id}`);
    if (res.data?.data) {
      return res.data.data;
    }
  } catch {}

  const mockOrders = getMockOrders();
  return (
    mockOrders.find(
      (o) => o.id === Number(id) || o.order_code === String(id)
    ) || null
  );
};

/**
 * 4. Đặt lịch khám trực tuyến từ gói khám đã mua trong đơn hàng:
 * POST /appointments/book-from-order/:id (với id là order_detail_id)
 * Kiểm tra:
 * - order.payment_status === 'PAID'
 * - usedCount < quantity
 * - Tạo lịch hẹn ONLINE và sinh link meeting_link qua Jitsi
 * - Giảm -1 số lượng còn lại (tăng used_count lên 1)
 */
export const bookAppointmentFromOrderAPI = async (
  orderDetailId: number | string,
  payload: BookFromOrderPayload
): Promise<any> => {
  try {
    const res = await api.post(`/appointments/book-from-order/${orderDetailId}`, payload);
    if (res.data) {
      return res.data;
    }
  } catch (error: any) {
    if (error?.response?.data?.message) {
      throw error;
    }
  }

  // Fallback offline logic
  const mockOrders = getMockOrders();
  let foundDetail: OrderDetail | null = null;
  let foundOrder: Order | null = null;

  for (const order of mockOrders) {
    if (order.order_details) {
      for (const d of order.order_details) {
        if (d.id === Number(orderDetailId)) {
          foundDetail = d;
          foundOrder = order;
          break;
        }
      }
    }
    if (foundDetail) break;
  }

  if (!foundDetail || !foundOrder) {
    throw new Error("Không tìm thấy thông tin gói khám trong đơn hàng.");
  }

  if (foundOrder.payment_status !== "PAID") {
    throw new Error("Đơn hàng chưa được thanh toán thành công!");
  }

  const used = (foundDetail.used_quantity ?? foundDetail.used_count ?? 0);
  if (used >= foundDetail.quantity) {
    throw new Error("Gói khám này đã sử dụng hết số lượt khám!");
  }

  // Cập nhật số lượt khám: usedCount + 1, remaining - 1
  foundDetail.used_quantity = used + 1;
  foundDetail.used_count = used + 1;
  foundDetail.remaining_quantity = Math.max(0, foundDetail.quantity - (used + 1));

  // Tự động sinh link phòng khám bảo mật qua Jitsi Meet
  const meetingCode = `medicare-${foundDetail.package_id}-${foundDetail.id}-${Date.now().toString(36)}`;
  const meetingLink = `https://meet.jit.si/${meetingCode}`;

  const newAppointment: Appointment = {
    id: Date.now(),
    user_id: 1,
    doctor_id: payload.doctor_id,
    order_id: foundOrder.id,
    package_id: foundDetail.package_id,
    date: payload.date,
    time_type: payload.time_type,
    patient_name: payload.patient_name,
    patient_phone: payload.patient_phone,
    symptoms: payload.symptoms,
    status: "CONFIRMED",
    type: "ONLINE",
    meeting_link: meetingLink,
    created_at: new Date().toISOString(),
  };

  if (!foundOrder.appointments) {
    foundOrder.appointments = [];
  }
  foundOrder.appointments.push(newAppointment);

  saveMockOrders(mockOrders);

  return {
    status: "success",
    message: "Đặt lịch khám trực tuyến thành công",
    data: newAppointment,
  };
};

/**
 * Lấy lịch sử tất cả các cuộc hẹn của người dùng
 */
export const getUserAppointmentsAPI = async (): Promise<Appointment[]> => {
  const res = await api.get<{
    data?: Appointment[] | {
      appointments?: Appointment[];
      items?: Appointment[];
      results?: Appointment[];
      data?: Appointment[];
    };
  }>("/appointments");
  const payload = res.data?.data;

  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.appointments)) {
    return payload.appointments;
  }
  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }
  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  throw new Error("Phản hồi danh sách lịch hẹn không đúng định dạng.");
};
