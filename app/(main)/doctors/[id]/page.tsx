"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Doctor } from "@/app/types/Clinic";
import { getDoctorById, getDoctors } from "@/app/lib/clinic.api";
import {
  Stethoscope,
  Award,
  GraduationCap,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Calendar,
  Building2,
  ShieldCheck,
  PhoneCall,
  Share2,
  UserCheck,
  MapPin,
  ChevronRight,
  HeartPulse,
  Video,
  FileCheck2,
} from "lucide-react";

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedDoctors, setRelatedDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    if (doctorId) {
      setLoading(true);
      getDoctorById(doctorId)
        .then((res) => {
          setDoctor(res);
          // Fetch related doctors from same specialty or other doctors
          getDoctors().then((all) => {
            if (all && all.length > 0) {
              const others = all.filter((d) => String(d.id) !== String(doctorId));
              setRelatedDoctors(others.slice(0, 3));
            }
          });
        })
        .finally(() => setLoading(false));
    }
  }, [doctorId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 pb-24">
        {/* Breadcrumb Skeleton */}
        <div className="bg-white border-b border-slate-200/80 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-5 bg-slate-200 rounded-lg w-64 animate-pulse" />
          </div>
        </div>

        {/* Hero Card Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-white rounded-[2rem] border border-slate-200/80 p-8 sm:p-12 animate-pulse space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-64 aspect-[4/4.5] bg-slate-200 rounded-2xl" />
              <div className="flex-1 space-y-4 w-full">
                <div className="h-6 bg-slate-200 rounded-full w-40" />
                <div className="h-10 bg-slate-200 rounded-xl w-3/4" />
                <div className="h-5 bg-slate-200 rounded-lg w-1/2" />
                <div className="h-24 bg-slate-100 rounded-2xl w-full" />
                <div className="flex gap-4 pt-4">
                  <div className="h-12 bg-slate-200 rounded-xl w-44" />
                  <div className="h-12 bg-slate-100 rounded-xl w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-200/80 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            Không tìm thấy thông tin bác sĩ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Bác sĩ bạn đang tìm có thể đã cập nhật lại hồ sơ hoặc không còn trực thuộc danh mục công tác.
          </p>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-md shadow-teal-700/25"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách bác sĩ</span>
          </Link>
        </div>
      </div>
    );
  }

  const name = doctor.user?.full_name || "Bác sĩ MediCare";
  const avatar = doctor.user?.avatar;
  const specialtyName = doctor.specialty?.name || "Bác sĩ chuyên khoa";
  const isAvailable = !doctor.deleted_at && doctor.status !== "INACTIVE";

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-teal-700 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/doctors" className="hover:text-teal-700 transition-colors">
              Đội ngũ bác sĩ
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-xs">
              {name}
            </span>
          </div>

          <Link
            href="/doctors"
            className="flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-semibold text-xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Danh sách bác sĩ</span>
          </Link>
        </div>
      </div>

      {/* Hero Doctor Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.3)] overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Doctor Avatar & Contact Box */}
            <div className="lg:col-span-4 space-y-4">
              <div className="relative aspect-[4/4.5] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-teal-100 shadow-sm">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-teal-700 bg-teal-50">
                    <UserCheck className="w-20 h-20 stroke-[1.2]" />
                    <span className="text-xs font-semibold mt-2">Bác sĩ MediCare</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3.5 right-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-xs ${
                      isAvailable
                        ? "bg-emerald-600/90 text-white"
                        : "bg-slate-700/90 text-slate-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>{isAvailable ? "Đang hoạt động" : "Tạm ngưng"}</span>
                  </span>
                </div>

                {/* Specialty Pill */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5">
                  <span className="block text-center px-3.5 py-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md text-teal-300 text-xs font-bold shadow-md">
                    {specialtyName}
                  </span>
                </div>
              </div>

              {/* Quick Trust Badges */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center gap-2 text-xs text-teal-900">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-medium">Chuẩn Y Đức</span>
                </div>
                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center gap-2 text-xs text-teal-900">
                  <Award className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-medium">Chuyên Gia Đầu Ngành</span>
                </div>
              </div>
            </div>

            {/* Right Information & Actions */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/60 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Hồ Sơ Chuyên Môn Bác Sĩ</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {name}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-teal-700 mt-1.5 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>Khoa {specialtyName} • Hệ Thống Y Tế MediCare</span>
                </p>
              </div>

              {/* Key Highlights Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <GraduationCap className="w-4 h-4 text-teal-600" />
                    <span>Kinh nghiệm</span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">
                    {doctor.experience_years ? `${doctor.experience_years} năm` : "Nhiều năm"}
                  </div>
                  <p className="text-[11px] text-slate-400">Thực hành lâm sàng</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Video className="w-4 h-4 text-teal-600" />
                    <span>Hình thức khám</span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">
                    Trực tiếp & Online
                  </div>
                  <p className="text-[11px] text-slate-400">Jitsi Meet & Phòng khám</p>
                </div>

                <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>Trạng thái tiếp nhận</span>
                  </div>
                  <div className="text-lg font-extrabold text-emerald-700">
                    {isAvailable ? "Sẵn sàng nhận lịch" : "Tạm ngưng"}
                  </div>
                  <p className="text-[11px] text-slate-400">Theo ca trực niêm yết</p>
                </div>
              </div>

              {/* Philosophy / Overview */}
              <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-100/80 text-sm text-slate-700 leading-relaxed space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                  Tôn chỉ khám chữa bệnh:
                </span>
                <p>
                  {doctor.description ||
                    "Luôn đặt sức khỏe và sự an tâm của người bệnh lên hàng đầu. Ứng dụng y học thực chứng kết hợp tư vấn tận tình, giúp bệnh nhân hiểu rõ tình trạng và đồng hành suốt quá trình điều trị."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/packages"
                  className="px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-teal-700/25 active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Chọn gói khám với bác sĩ</span>
                </Link>

                <a
                  href="tel:19006868"
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-all border border-slate-200/80 flex items-center gap-2 shadow-2xs"
                >
                  <PhoneCall className="w-4 h-4 text-teal-700" />
                  <span>Hotline: 1900 6868</span>
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-all border border-slate-200/80 flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>{copied ? "Đã chép link!" : "Chia sẻ"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Biography & Professional Journey */}
            <section className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Tiểu Sử & Quá Trình Đào Tạo
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kinh nghiệm và tôn chỉ chăm sóc sức khỏe
                  </p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
                <p>
                  {doctor.description ||
                    `${name} tốt nghiệp chuyên khoa sâu với hơn ${doctor.experience_years || 10} năm kinh nghiệm thực hành lâm sàng. Bác sĩ từng công tác và giữ các vị trí chuyên môn quan trọng tại các bệnh viện tuyến trung ương trước khi gia nhập MediCare.`}
                </p>
                <p>
                  Bác sĩ thường xuyên tham gia các hội nghị khoa học chuyên ngành trong nước và quốc tế nhằm cập nhật các phác đồ chẩn đoán, kỹ thuật điều trị mới nhất, hướng tới mục tiêu điều trị hiệu quả và an toàn tối đa cho người bệnh.
                </p>
              </div>
            </section>

            {/* Qualifications & Certifications */}
            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <section className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Bằng Cấp & Chứng Chỉ Chuyên Khoa
                    </h2>
                    <p className="text-xs text-slate-500">
                      Văn bằng được kiểm định và cấp phép hành nghề
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {doctor.qualifications.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Examination Workflow */}
            <section className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Quy Trình Khám & Tư Vấn Cùng Bác Sĩ
                  </h2>
                  <p className="text-xs text-slate-500">
                    4 bước chuẩn hóa đảm bảo chất lượng chẩn đoán
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    step: "01",
                    title: "Đặt lịch & Tiếp nhận hồ sơ",
                    desc: "Người bệnh chọn lịch khám phù hợp, khai báo triệu chứng và tiền sử bệnh lý qua nền tảng.",
                  },
                  {
                    step: "02",
                    title: "Thăm khám chuyên sâu",
                    desc: "Bác sĩ trực tiếp thăm khám (tại phòng khám hoặc online qua video Jitsi Meet bảo mật).",
                  },
                  {
                    step: "03",
                    title: "Chỉ định cận lâm sàng & Kết luận",
                    desc: "Đọc kết quả xét nghiệm, giải thích cặn kẽ nguyên nhân và đưa ra phác đồ điều trị cá thể hóa.",
                  },
                  {
                    step: "04",
                    title: "Theo dõi & Tái khám",
                    desc: "Hướng dẫn chăm sóc tại nhà, nhắc lịch dùng thuốc và lên hẹn tái khám định kỳ.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 space-y-2 relative"
                  >
                    <span className="text-2xl font-black text-teal-700/25 block">
                      {item.step}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Work Schedule Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Clock className="w-5 h-5 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Lịch Tiếp Nhận Khám
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs space-y-2">
                <span className="font-bold text-teal-900 block">
                  Thời gian làm việc cố định:
                </span>
                <p className="text-teal-800 leading-relaxed">
                  {doctor.work_schedule ||
                    "Thứ 2 - Thứ 6: 08:00 - 17:00 | Thứ 7: 08:00 - 12:00 (Nghỉ Chủ Nhật)"}
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Cơ sở MediCare: Tầng 3, Tòa nhà Y khoa MediCare, Hà Nội</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <PhoneCall className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Tổng đài đặt lịch ưu tiên: <strong>1900 6868</strong></span>
                </div>
              </div>
            </div>

            {/* Need Appointment CTA Card */}
            <div className="bg-gradient-to-br from-teal-800 to-teal-900 rounded-[2rem] p-6 sm:p-7 text-white shadow-lg shadow-teal-900/20 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold">
                Bạn cần thăm khám với {name}?
              </h3>
              <p className="text-xs text-teal-100/90 leading-relaxed">
                Khám phá danh mục các gói khám sức khỏe toàn diện được phụ trách bởi đội ngũ bác sĩ chuyên khoa MediCare.
              </p>
              <Link
                href="/packages"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-teal-900 text-xs font-bold hover:bg-teal-50 transition-colors cursor-pointer"
              >
                <span>Xem danh mục gói khám</span>
                <ChevronRight className="w-4 h-4 text-teal-700" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Doctors Section */}
      {relatedDoctors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Gợi ý chuyên gia
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Các Bác Sĩ Cùng Chuyên Khoa
              </h2>
            </div>
            <Link
              href="/doctors"
              className="text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedDoctors.map((doc) => {
              const docAvatar = doc.user?.avatar;
              const docName = doc.user?.full_name || "Bác sĩ MediCare";
              const docSpec = doc.specialty?.name || "Bác sĩ chuyên khoa";

              return (
                <Link
                  key={doc.id}
                  href={`/doctors/${doc.id}`}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 p-5 hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex items-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    {docAvatar ? (
                      <img
                        src={docAvatar}
                        alt={docName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-700 font-bold">
                        {docName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block truncate">
                      {docSpec}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                      {docName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {doc.experience_years ? `${doc.experience_years} năm kinh nghiệm` : "Chuyên gia giàu kinh nghiệm"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-teal-700 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
