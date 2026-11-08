"use client";

import React, { Suspense, useEffect, useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  CalendarDays, 
  PlusCircle, 
  RefreshCw, 
  LogIn, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  UserCheck
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { userStore } from "@/app/store/AuthStore";
import { AppointmentData, AppointmentListPagination } from "@/app/types/appointment";
import { getUserAppointments, cancelAppointment } from "@/app/lib/appointment.api";
import AppointmentCard from "@/app/components/appointments/AppointmentCard";
import CancelAppointmentDialog from "@/app/components/appointments/CancelAppointmentDialog";
import AppointmentEmptyState from "@/app/components/appointments/AppointmentEmptyState";

// Available Status Tabs
interface TabOption {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}

const TABS: TabOption[] = [
  { key: "ALL", label: "Tất cả", icon: CalendarDays, badgeColor: "bg-slate-100 text-slate-700" },
  { key: "PENDING", label: "Chờ xác nhận", icon: Clock, badgeColor: "bg-amber-100 text-amber-800" },
  { key: "CONFIRMED", label: "Đã xác nhận", icon: CheckCircle2, badgeColor: "bg-teal-100 text-teal-800" },
  { key: "COMPLETED", label: "Đã hoàn thành", icon: UserCheck, badgeColor: "bg-emerald-100 text-emerald-800" },
  { key: "CANCELLED", label: "Đã hủy", icon: XCircle, badgeColor: "bg-rose-100 text-rose-800" },
];

// Demo appointments fallback for testing / unauthenticated preview
const DEMO_APPOINTMENTS: AppointmentData[] = [
  {
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
    doctor: {
      id: 1,
      price: 350000,
      user: {
        id: 10,
        full_name: "PGS.TS Nguyễn Văn A",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80",
        phone_number: "0912345678",
      },
      specialty: {
        id: 1,
        name: "Nội Tim mạch",
      },
    },
  },
  {
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
    doctor: {
      id: 2,
      price: 250000,
      user: {
        id: 11,
        full_name: "ThS.BS Trần Thị Mai",
        avatar: "https://images.unsplash.com/photo-1594824813633-43f114620f4f?w=200&auto=format&fit=crop&q=80",
        phone_number: "0923456789",
      },
      specialty: {
        id: 2,
        name: "Da liễu thẩm mỹ",
      },
    },
  },
  {
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
    doctor: {
      id: 3,
      price: 400000,
      user: {
        id: 12,
        full_name: "BS CKII Lê Hoàng Nam",
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80",
        phone_number: "0934567890",
      },
      specialty: {
        id: 3,
        name: "Cơ Xương Khớp",
      },
    },
  },
  {
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
    doctor: {
      id: 4,
      price: 300000,
      user: {
        id: 13,
        full_name: "ThS.BS Phạm Minh Khoa",
        avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80",
        phone_number: "0945678901",
      },
      specialty: {
        id: 4,
        name: "Nội tổng quát",
      },
    },
  },
];

function MyAppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // 1. Auth Store
  const { user, token } = userStore();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 2. Tab & Query State
  const statusParam = searchParams.get("status") || "ALL";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [activeTab, setActiveTab] = useState<string>(statusParam);
  const [currentPage, setCurrentPage] = useState<number>(pageParam > 0 ? pageParam : 1);

  // 3. Appointments Data State
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [pagination, setPagination] = useState<AppointmentListPagination>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 4. Cancel Dialog State
  const [cancellingAppointment, setCancellingAppointment] = useState<AppointmentData | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // 6. Preview / Demo Mode
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => searchParams.get("demo") === "true");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync internal state if URL query params change
  useEffect(() => {
    if (statusParam !== activeTab) {
      setActiveTab(statusParam);
    }
    if (pageParam !== currentPage && pageParam > 0) {
      setCurrentPage(pageParam);
    }
  }, [statusParam, pageParam]);

  // Fetch appointments callback (supports silent background sync without UI flicker)
  const fetchAppointments = useCallback(async (isSilent = false) => {
    // If not mounted or if in demo mode without login
    if (!token && !isDemoMode) {
      if (!isSilent) setIsLoading(false);
      return;
    }

    if (isDemoMode) {
      if (!isSilent) setIsLoading(true);
      setTimeout(() => {
        const filtered = activeTab === "ALL" 
          ? DEMO_APPOINTMENTS 
          : DEMO_APPOINTMENTS.filter((item) => item.status === activeTab);
        setAppointments(filtered);
        setPagination({
          total: filtered.length,
          page: currentPage,
          pageSize: 10,
          totalPages: Math.ceil(filtered.length / 10) || 1,
        });
        if (!isSilent) setIsLoading(false);
      }, 350);
      return;
    }

    try {
      if (!isSilent) {
        setIsLoading(true);
        setFetchError(null);
      }

      const data = await getUserAppointments(currentPage, activeTab);
      setAppointments(data.appointments || []);
      setPagination(
        data.pagination || {
          total: data.appointments?.length || 0,
          page: currentPage,
          pageSize: 10,
          totalPages: 1,
        }
      );
    } catch (err: unknown) {
      console.error("Error fetching appointments:", err);
      if (!isSilent) {
        let errorMsg = "Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.";
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }
        setFetchError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  }, [token, isDemoMode, activeTab, currentPage]);

  useEffect(() => {
    if (isMounted) {
      fetchAppointments(false);
    }
  }, [fetchAppointments, isMounted]);

  // Auto-revalidate on Window Focus & Smart Polling (every 6s)
  useEffect(() => {
    if (!isMounted || !token) return;

    // 1. Silent sync when switching back to this tab/window
    const handleFocus = () => {
      fetchAppointments(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAppointments(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 2. Periodic background poll every 6 seconds when tab is visible
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchAppointments(true);
      }
    }, 6000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [fetchAppointments, isMounted, token]);

  // Handle Tab Change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (key === "ALL") {
      params.delete("status");
    } else {
      params.set("status", key);
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`/my-appointments?${params.toString()}`);
    });
  };

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    startTransition(() => {
      router.push(`/my-appointments?${params.toString()}`);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Cancellation confirmation
  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;

    if (isDemoMode) {
      setIsCancelling(true);
      setTimeout(() => {
        setAppointments((prev) =>
          prev.map((item) =>
            item.id === cancellingAppointment.id
              ? { ...item, status: "CANCELLED" }
              : item
          )
        );
        toast.success("Hủy lịch hẹn thành công (Chế độ xem thử)");
        setIsCancelling(false);
        setCancellingAppointment(null);
      }, 600);
      return;
    }

    try {
      setIsCancelling(true);
      await cancelAppointment(cancellingAppointment.id);
      toast.success("Hủy lịch hẹn thành công! Đã giải phóng ca khám.");

      // Optimistic update of status in local state
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === cancellingAppointment.id
            ? { ...item, status: "CANCELLED" }
            : item
        )
      );

      setCancellingAppointment(null);
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

  // Render Skeleton Cards
  const renderSkeletons = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs animate-pulse"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-11 h-11 rounded-2xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-36 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-7 w-28 bg-slate-200 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 w-40 bg-slate-100 rounded" />
            <div className="h-9 w-28 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link href="/" className="hover:text-teal-700 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/profile" className="hover:text-teal-700 transition-colors">
            Tài khoản
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Lịch hẹn của tôi</span>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 md:p-10 mb-8 shadow-xl shadow-teal-950/10">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold backdrop-blur-xs border border-teal-400/20">
                <Calendar className="w-3.5 h-3.5" />
                Hệ thống Quản lý Cuộc hẹn MediCare
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Lịch hẹn khám của tôi
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Theo dõi tiến trình lịch khám, truy cập phòng khám trực tuyến Jitsi Meet và tra cứu hồ sơ bệnh án kèm đơn thuốc bất kỳ lúc nào.
              </p>
            </div>

            <div className="flex items-center shrink-0">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/25 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Đặt lịch khám mới
              </Link>
            </div>
          </div>
        </div>

        {/* Auth Gate (If patient is not logged in) */}
        {isMounted && !token && !isDemoMode && (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-6 sm:p-8 text-center mb-8 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-7 h-7" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              Vui lòng đăng nhập để xem lịch hẹn
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Bạn cần đăng nhập tài khoản bệnh nhân để theo dõi các ca khám đã đặt, hủy hẹn hoặc xem kết quả khám bệnh.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?redirect=/my-appointments"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-md shadow-teal-700/20 active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập ngay
              </Link>
              <button
                type="button"
                onClick={() => setIsDemoMode(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Xem dữ liệu mẫu (Demo)
              </button>
            </div>
          </div>
        )}

        {/* Demo Mode Notice Banner */}
        {isDemoMode && (
          <div className="flex items-center justify-between gap-4 p-4 mb-6 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Chế độ xem trước dữ liệu mẫu (Demo):</strong> Đang hiển thị danh sách lịch hẹn mô phỏng với đầy đủ trạng thái.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsDemoMode(false);
                fetchAppointments();
              }}
              className="text-xs font-bold text-sky-700 hover:underline shrink-0 cursor-pointer"
            >
              Thoát Demo
            </button>
          </div>
        )}

        {/* Main Content (when logged in or demo mode) */}
        {(!isMounted || token || isDemoMode) && (
          <>
            {/* Status Filter Tabs */}
            <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-teal-700 text-white shadow-sm shadow-teal-700/20"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Counter / Info */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                <span>Tổng số:</span>
                <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {pagination.total} cuộc hẹn
                </span>
              </div>
            </div>

            {/* Error Message */}
            {fetchError && !isLoading && (
              <div className="flex items-center gap-3 p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Đã xảy ra lỗi khi tải dữ liệu</p>
                  <p className="text-xs text-rose-700 mt-0.5">{fetchError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchAppointments()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Appointment Cards List */}
            {isLoading ? (
              renderSkeletons()
            ) : appointments.length === 0 ? (
              <AppointmentEmptyState
                currentStatus={activeTab}
                onResetFilter={() => handleTabChange("ALL")}
              />
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onRequestCancel={(appItem) => setCancellingAppointment(appItem)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs sm:text-sm text-slate-500">
                  Hiển thị trang <strong className="text-slate-800">{pagination.page}</strong> /{" "}
                  <strong className="text-slate-800">{pagination.totalPages}</strong> (Tổng cộng{" "}
                  <strong>{pagination.total}</strong> cuộc hẹn)
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trước
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        pageNum === currentPage
                          ? "bg-teal-700 text-white shadow-xs"
                          : "text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Sau
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Cancel Confirmation Dialog */}
        <CancelAppointmentDialog
          isOpen={cancellingAppointment !== null}
          appointment={cancellingAppointment}
          isCancelling={isCancelling}
          onClose={() => setCancellingAppointment(null)}
          onConfirm={handleConfirmCancel}
        />
      </div>
    </div>
  );
}

export default function MyAppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Đang tải lịch hẹn...</p>
          </div>
        </div>
      }
    >
      <MyAppointmentsContent />
    </Suspense>
  );
}
