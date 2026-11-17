"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Phone, 
  Mail, 
  Stethoscope, 
  Package, 
  FileText, 
  Pill, 
  Receipt, 
  ExternalLink, 
  AlertCircle, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  X,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Headphones
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { userStore } from "@/app/store/AuthStore";
import { AppointmentDetail } from "@/app/types/appointment";
import { getAppointmentDetail, cancelAppointment } from "@/app/lib/appointment.api";
import { TIME_SLOTS, TimeType } from "@/app/types/schedule";
import AppointmentStatusBadge from "@/app/components/appointments/AppointmentStatusBadge";
import CancelAppointmentDialog from "@/app/components/appointments/CancelAppointmentDialog";

// Fallback demo details when viewing demo IDs or in offline preview
const DEMO_DETAILS: Record<string, AppointmentDetail> = {
  "101": {
    id: 101,
    user_id: 1,
    doctor_id: 1,
    appointment_type: "OFFLINE",
    date: "2026-11-12",
    time_type: "T2",
    status: "PENDING",
    patient_name: "Nguyễn Văn Nam",
    patient_phone: "0901234567",
    symptoms: "Bị tức ngực nhẹ khi vận động mạnh, thỉnh thoảng khó thở về đêm",
    created_at: "2026-11-08T08:30:00Z",
    doctor: {
      id: 1,
      price: 350000,
      user: {
        full_name: "PGS.TS Nguyễn Văn A",
        email: "nguyenvana@medicare.vn",
        phone_number: "0912345678",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
      },
      specialty: {
        id: 1,
        name: "Nội Tim mạch",
      },
    },
  },
  "102": {
    id: 102,
    user_id: 1,
    doctor_id: 2,
    appointment_type: "ONLINE",
    meeting_link: "https://meet.jit.si/medicare-appointment-102",
    date: "2026-11-15",
    time_type: "T5",
    status: "CONFIRMED",
    patient_name: "Nguyễn Văn Nam",
    patient_phone: "0901234567",
    symptoms: "Tái khám sau dị ứng da mẩn ngứa, cần bác sĩ tư vấn đơn thuốc duy trì",
    created_at: "2026-11-07T14:20:00Z",
    doctor: {
      id: 2,
      price: 250000,
      user: {
        full_name: "ThS.BS Trần Thị Mai",
        email: "tranthimai@medicare.vn",
        phone_number: "0923456789",
        avatar: "https://images.unsplash.com/photo-1594824813633-43f114620f4f?w=400&auto=format&fit=crop&q=80",
      },
      specialty: {
        id: 2,
        name: "Da liễu thẩm mỹ",
      },
    },
  },
  "103": {
    id: 103,
    user_id: 1,
    doctor_id: 3,
    appointment_type: "OFFLINE",
    date: "2026-11-02",
    time_type: "T1",
    status: "COMPLETED",
    patient_name: "Nguyễn Văn Nam",
    patient_phone: "0901234567",
    symptoms: "Đau mỏi vùng thắt lưng lan xuống chân trái khi đứng lâu",
    created_at: "2026-10-30T10:15:00Z",
    doctor: {
      id: 3,
      price: 400000,
      user: {
        full_name: "BS CKII Lê Hoàng Nam",
        email: "lehoangnam@medicare.vn",
        phone_number: "0934567890",
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
      },
      specialty: {
        id: 3,
        name: "Cơ Xương Khớp",
      },
    },
    medical_record: {
      id: 501,
      diagnosis: "Thoái hóa cột sống thắt lưng L4-L5 kèm chèn ép rễ thần kinh nhẹ",
      treatment: "Dùng thuốc giảm đau chống viêm phối hợp giãn cơ theo đợt 7 ngày. Hạn chế mang vác vật nặng, tập bài tập vật lý trị liệu vùng lưng hằng ngày.",
      prescriptions: [
        {
          id: 1,
          medicine_name: "Celecoxib 200mg (Celebrex)",
          dosage: "1 viên/lần",
          frequency: "Ngày 1 lần sau ăn sáng",
          duration: "7 ngày (7 viên)",
        },
        {
          id: 2,
          medicine_name: "Eperisone 50mg (Myonal)",
          dosage: "1 viên/lần",
          frequency: "Ngày 2 lần (sáng, tối sau ăn)",
          duration: "7 ngày (14 viên)",
        },
        {
          id: 3,
          medicine_name: "Mecobalamin 500mcg (Methycobal)",
          dosage: "1 viên/lần",
          frequency: "Ngày 3 lần sau ăn",
          duration: "14 ngày (42 viên)",
        },
      ],
    },
  },
  "104": {
    id: 104,
    user_id: 1,
    doctor_id: 4,
    appointment_type: "OFFLINE",
    date: "2026-10-25",
    time_type: "T4",
    status: "CANCELLED",
    patient_name: "Nguyễn Văn Nam",
    patient_phone: "0901234567",
    symptoms: "Khám sức khỏe tổng quát định kỳ",
    created_at: "2026-10-20T09:00:00Z",
    doctor: {
      id: 4,
      price: 300000,
      user: {
        full_name: "ThS.BS Phạm Minh Khoa",
        email: "minhkhoa@medicare.vn",
        phone_number: "0945678901",
        avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80",
      },
      specialty: {
        id: 4,
        name: "Nội tổng quát",
      },
    },
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AppointmentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.id;

  const { token } = userStore();
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;

    const fetchDetail = async () => {
      // Check fallback demo item first if matched
      if (DEMO_DETAILS[appointmentId]) {
        setDetail(DEMO_DETAILS[appointmentId]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getAppointmentDetail(appointmentId);
        if (isSubscribed) {
          setDetail(data);
        }
      } catch (err: unknown) {
        console.error("Error loading appointment detail:", err);
        // Fallback if demo ID exists
        if (DEMO_DETAILS[appointmentId]) {
          if (isSubscribed) setDetail(DEMO_DETAILS[appointmentId]);
        } else {
          let errorMsg = "Không thể tải thông tin cuộc hẹn. Vui lòng thử lại sau.";
          if (axios.isAxiosError(err) && err.response?.data?.message) {
            errorMsg = err.response.data.message;
          }
          if (isSubscribed) setError(errorMsg);
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isSubscribed = false;
    };
  }, [appointmentId]);

  // Auto-revalidate on Focus & Smart Polling (no F5 needed when Admin updates status)
  useEffect(() => {
    if (!token && !DEMO_DETAILS[appointmentId]) return;

    const fetchDetailSilent = async () => {
      try {
        const data = await getAppointmentDetail(appointmentId);
        setDetail(data);
      } catch (err) {
        // Silent fail
      }
    };

    const handleFocus = () => {
      fetchDetailSilent();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDetailSilent();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // If appointment is not yet finalized, check periodically every 5 seconds
    const isFinished = detail?.status === "COMPLETED" || detail?.status === "CANCELLED";
    let intervalId: NodeJS.Timeout | null = null;
    if (!isFinished) {
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchDetailSilent();
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalId) clearInterval(intervalId);
    };
  }, [appointmentId, token, detail?.status]);

  // Handle Cancellation
  const handleConfirmCancel = async () => {
    if (!detail) return;

    // If demo item
    if (DEMO_DETAILS[appointmentId]) {
      setIsCancelling(true);
      setTimeout(() => {
        setDetail((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
        toast.success("Hủy lịch hẹn thành công (Chế độ xem thử)");
        setIsCancelling(false);
        setIsCancelModalOpen(false);
      }, 500);
      return;
    }

    try {
      setIsCancelling(true);
      await cancelAppointment(detail.id);
      toast.success("Hủy lịch hẹn thành công! Đã giải phóng ca khám.");
      setDetail((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      setIsCancelModalOpen(false);
    } catch (err: unknown) {
      console.error("Error cancelling appointment:", err);
      let errorMsg = "Không thể hủy lịch hẹn. Vui lòng thử lại sau.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setIsCancelling(false);
    }
  };

  // Helper date & slot formatting
  const slotConfig = detail ? TIME_SLOTS[detail.time_type as TimeType] : null;
  const timeLabel = slotConfig
    ? `${detail?.time_type} (${slotConfig.label})`
    : detail?.time_type;

  const formattedDate = (() => {
    if (!detail?.date) return "";
    try {
      const cleanDate = detail.date.slice(0, 10);
      const [year, month, day] = cleanDate.split("-").map(Number);
      const d = new Date(Date.UTC(year, month - 1, day));
      const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      return `${days[d.getUTCDay()]}, ngày ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    } catch {
      return detail.date.slice(0, 10);
    }
  })();

  const isOnline = detail?.appointment_type === "ONLINE";
  const canJoinMeeting =
    isOnline &&
    detail?.status === "CONFIRMED" &&
    Boolean(detail?.meeting_link);
  const isPending = detail?.status === "PENDING";

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-teal-700 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/my-appointments" className="hover:text-teal-700 transition-colors">
              Lịch hẹn của tôi
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-[180px] sm:max-w-none">
              Chi tiết #{appointmentId}
            </span>
          </nav>

          <Link
            href="/my-appointments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 bg-white px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại danh sách
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs animate-pulse space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-200 rounded-lg" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
              </div>
              <div className="h-8 w-28 bg-slate-200 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-slate-100 rounded-2xl" />
              <div className="h-48 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && (error || !detail) && (
          <div className="bg-white rounded-3xl border border-rose-200/80 p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Không thể tải thông tin cuộc hẹn
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              {error || "Cuộc hẹn này không tồn tại hoặc bạn không có quyền truy cập."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/my-appointments"
                className="px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-all"
              >
                Quay lại Lịch hẹn của tôi
              </Link>
            </div>
          </div>
        )}

        {/* Main Appointment Detail View */}
        {!isLoading && detail && (
          <div className="space-y-6">
            {/* Top Overview Banner */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Cuộc hẹn khám #{detail.id}
                    </h1>
                    <AppointmentStatusBadge status={detail.status} />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {detail.created_at && (
                      <span>Ngày đặt: {new Date(detail.created_at).toLocaleDateString("vi-VN")} • </span>
                    )}
                    Hình thức:{" "}
                    <strong className="text-slate-700 font-semibold">
                      {isOnline ? "Tư vấn từ xa qua video" : "Khám trực tiếp tại phòng khám"}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Join Online Meeting Button */}
                  {canJoinMeeting && (
                    <a
                      href={detail.meeting_link!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition-all"
                    >
                      <Video className="w-4 h-4 animate-pulse" />
                      <span>Vào phòng khám Online</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-90" />
                    </a>
                  )}

                  {/* Print / Save button for completed visits */}
                  {detail.status === "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span className="hidden sm:inline">In kết quả</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Online consultation notice if applicable */}
              {isOnline && (
                <div className={`mt-5 p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                  canJoinMeeting 
                    ? "bg-teal-50/80 border-teal-200 text-teal-900" 
                    : "bg-amber-50/80 border-amber-200 text-amber-900"
                }`}>
                  <Video className={`w-5 h-5 shrink-0 mt-0.5 ${canJoinMeeting ? "text-teal-700" : "text-amber-700"}`} />
                  <div>
                    <p className="font-bold">
                      {canJoinMeeting
                        ? "Phòng khám trực tuyến đã sẵn sàng!"
                        : "Ca khám trực tuyến đang chờ bác sĩ xác nhận"}
                    </p>
                    <p className="mt-0.5 leading-relaxed">
                      {canJoinMeeting
                        ? "Vui lòng bấm nút 'Vào phòng khám Online' bên trên để kết nối video call trực tiếp với bác sĩ phụ trách."
                        : "Link phòng họp Jitsi Meet sẽ được kích hoạt ngay khi bác sĩ tiếp nhận và xác nhận cuộc hẹn."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Grid 2 Columns: Schedule & Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Time & Location */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      Thời gian & Địa điểm
                    </h2>
                  </div>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Ngày khám</p>
                        <p className="font-bold text-slate-900">{formattedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Khung giờ ca khám</p>
                        <p className="font-bold text-slate-900">{timeLabel}</p>
                        {slotConfig && (
                          <span className="inline-block mt-0.5 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                            {slotConfig.session === "morning" ? "Buổi Sáng" : "Buổi Chiều"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                      {isOnline ? (
                        <Video className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                      ) : (
                        <MapPin className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Địa điểm khám</p>
                        <p className="font-semibold text-slate-900">
                          {isOnline
                            ? "Tư vấn từ xa qua phòng họp Jitsi Meet"
                            : "Phòng khám Đa khoa MediCare"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isOnline
                            ? "Khám trực tuyến qua kết nối video internet"
                            : "123 Đường Sức Khỏe, Phường Bến Nghé, Quận 1, TP. HCM"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!isOnline && (
                  <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 leading-relaxed">
                    * Quý khách vui lòng có mặt tại quầy lễ tân trước giờ khám 15 phút để làm thủ tục tiếp đón chu đáo.
                  </div>
                )}
              </div>

              {/* Card 2: Doctor & Specialty Info */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      Bác sĩ phụ trách
                    </h2>
                  </div>

                  {detail.doctor ? (
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                        {detail.doctor.user?.avatar ? (
                          <Image
                            src={detail.doctor.user.avatar}
                            alt={detail.doctor.user.full_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-900 truncate">
                          {detail.doctor.user?.full_name}
                        </p>
                        {detail.doctor.specialty && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-100">
                            {detail.doctor.specialty.name}
                          </span>
                        )}

                        <div className="space-y-1 text-xs text-slate-500 pt-1">
                          {detail.doctor.user?.phone_number && (
                            <p className="flex items-center gap-1.5 truncate">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{detail.doctor.user.phone_number}</span>
                            </p>
                          )}
                          {detail.doctor.user?.email && (
                            <p className="flex items-center gap-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{detail.doctor.user.email}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : detail.package ? (
                    <div className="space-y-2">
                      <p className="text-base font-bold text-slate-900">{detail.package.name}</p>
                      <p className="text-xs text-slate-500">Gói khám dịch vụ tổng quát</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Bác sĩ chuyên khoa #{detail.doctor_id}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Chi phí khám</span>
                  <span className="text-base font-bold text-teal-700">
                    {detail.doctor?.price
                      ? `${Number(detail.doctor.price).toLocaleString("vi-VN")} đ`
                      : detail.package?.price
                      ? `${Number(detail.package.price).toLocaleString("vi-VN")} đ`
                      : "Theo quy định phòng khám"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Patient Info & Symptoms */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Thông tin bệnh nhân & Lý do khám
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Họ và tên người khám</span>
                  <p className="font-bold text-slate-900 mt-1">{detail.patient_name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Số điện thoại liên hệ</span>
                  <p className="font-bold text-slate-900 mt-1">{detail.patient_phone}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Triệu chứng ban đầu / Lý do đăng ký khám:
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-medium pt-1">
                  {detail.symptoms || "Không có mô tả triệu chứng trước."}
                </p>
              </div>
            </div>

            {/* Card 4: Medical Record & Prescriptions (If COMPLETED) */}
            {detail.medical_record && (
              <div className="bg-white rounded-3xl border border-teal-200/90 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-teal-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Kết quả chẩn đoán & Đơn thuốc
                      </h2>
                      <p className="text-xs text-slate-500">
                        Hồ sơ khám chữa bệnh chính thức từ bác sĩ chuyên khoa
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Đã hoàn thành
                  </span>
                </div>

                {/* Diagnosis & Treatment */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1">
                      Chẩn đoán bệnh (Diagnosis):
                    </p>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {detail.medical_record.diagnosis}
                    </p>
                  </div>

                  {detail.medical_record.treatment && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Phác đồ điều trị & Lời dặn của bác sĩ:
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {detail.medical_record.treatment}
                      </p>
                    </div>
                  )}
                </div>

                {/* Prescriptions Table */}
                {detail.medical_record.prescriptions && detail.medical_record.prescriptions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-600" />
                      <span>Đơn thuốc chỉ định:</span>
                    </p>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4">Tên thuốc & Hoạt chất</th>
                            <th className="py-3 px-4">Liều dùng</th>
                            <th className="py-3 px-4">Cách dùng</th>
                            <th className="py-3 px-4">Thời gian</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {detail.medical_record.prescriptions.map((p, idx) => (
                            <tr key={p.id || idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{p.medicine_name}</td>
                              <td className="py-3 px-4 text-slate-700">{p.dosage}</td>
                              <td className="py-3 px-4 text-slate-700">{p.frequency}</td>
                              <td className="py-3 px-4 text-slate-600 font-medium">{p.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                      * Chú ý: Bệnh nhân dùng thuốc đúng liều lượng chỉ định, không tự ý ngưng thuốc và liên hệ lại bác sĩ ngay khi có dấu hiệu bất thường.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Cần hỗ trợ về lịch khám này?</p>
                  <p className="text-slate-500">Hotline trực tiếp: <strong className="text-teal-700">1900 6868</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Cancel Button if PENDING */}
                {isPending && (
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Hủy lịch hẹn này
                  </button>
                )}

                {/* Re-book doctor button */}
                <Link
                  href={`/booking?doctor_id=${detail.doctor_id || 1}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Đặt lịch khám mới
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Dialog */}
        <CancelAppointmentDialog
          isOpen={isCancelModalOpen}
          appointment={detail}
          isCancelling={isCancelling}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
        />
      </div>
    </div>
  );
}

