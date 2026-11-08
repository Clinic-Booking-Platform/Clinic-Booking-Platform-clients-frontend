"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldAlert, 
  AlertCircle, 
  Sparkles,
  ChevronRight,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  LogIn
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { userStore } from "@/app/store/AuthStore";
import { DoctorDetail } from "@/app/types/Doctor";
import { Schedule, TimeType } from "@/app/types/schedule";
import { AppointmentData } from "@/app/types/appointment";
import { getDoctorDetail } from "@/app/lib/doctor.api";
import { getDoctorSchedules } from "@/app/lib/schedule.api";
import { createAppointment } from "@/app/lib/appointment.api";

import DoctorSummaryCard from "@/app/components/booking/DoctorSummaryCard";
import DateSelector from "@/app/components/booking/DateSelector";
import TimeSlotSelector from "@/app/components/booking/TimeSlotSelector";
import PatientInfoForm, { 
  PatientFormData, 
  PatientFormErrors 
} from "@/app/components/booking/PatientInfoForm";
import BookingConfirmModal from "@/app/components/booking/BookingConfirmModal";
import BookingSuccessModal from "@/app/components/booking/BookingSuccessModal";
import LoginPromptModal from "@/app/components/booking/LoginPromptModal";

// Helper to get today's date in Vietnam time (YYYY-MM-DD)
function getTodayVN(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

// Fallback Mock Data for testing / demo
const DEMO_DOCTOR: DoctorDetail = {
  id: 1,
  price: 300000,
  description: "Bác sĩ chuyên khoa Tim Mạch & Đa Khoa với hơn 20 năm kinh nghiệm công tác tại các bệnh viện đầu ngành.",
  clinic_name: "Phòng khám Đa khoa MediCare",
  clinic_address: "Số 123 Đường Y Học, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  user: {
    id: 4,
    full_name: "PGS.TS Nguyễn Văn An",
    email: "bs.an@phongkham.vn",
    avatar: null,
  },
  specialty: {
    id: 1,
    name: "Nội tim mạch & Đa khoa",
  },
};

const getDemoSchedules = (docId: number, dateStr: string): Schedule[] => [
  { id: 101, doctor_id: docId, date: dateStr, time_type: "T1", max_number: 10, current_number: 3, status: "AVAILABLE" },
  { id: 102, doctor_id: docId, date: dateStr, time_type: "T2", max_number: 10, current_number: 8, status: "AVAILABLE" },
  { id: 103, doctor_id: docId, date: dateStr, time_type: "T3", max_number: 10, current_number: 10, status: "FULL" },
  { id: 104, doctor_id: docId, date: dateStr, time_type: "T4", max_number: 10, current_number: 2, status: "AVAILABLE" },
  { id: 105, doctor_id: docId, date: dateStr, time_type: "T5", max_number: 10, current_number: 5, status: "AVAILABLE" },
  { id: 106, doctor_id: docId, date: dateStr, time_type: "T6", max_number: 10, current_number: 10, status: "FULL" },
  { id: 107, doctor_id: docId, date: dateStr, time_type: "T7", max_number: 10, current_number: 4, status: "AVAILABLE" },
  { id: 108, doctor_id: docId, date: dateStr, time_type: "T8", max_number: 10, current_number: 1, status: "AVAILABLE" },
];

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Auth state
  const { user, token, setLogin } = userStore();
  const [isMounted, setIsMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 2. Demo mode state (supports ?demo=true or toggle button)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return searchParams.get("demo") === "true";
  });

  // 3. Doctor state
  const rawDoctorId = searchParams.get("doctor_id") || searchParams.get("doctorId");
  const doctorId = rawDoctorId ? parseInt(rawDoctorId, 10) : 1; // Defaults to doctor 1 for smooth testing
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState<boolean>(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  // 4. Date & Schedule state
  const [selectedDate, setSelectedDate] = useState<string>(getTodayVN());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeType | null>(null);

  // 5. Patient Form state
  const [formData, setFormData] = useState<PatientFormData>({
    patient_name: "",
    patient_phone: "",
    symptoms: "",
  });
  const [formErrors, setFormErrors] = useState<PatientFormErrors>({});

  // 6. Booking confirmation & submission
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 7. Booking Success state
  const [createdAppointment, setCreatedAppointment] = useState<AppointmentData | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Client hydration check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check auth & prefill user info
  useEffect(() => {
    if (!isMounted) return;

    if (!token || !user) {
      if (!isDemoMode) {
        setShowLoginModal(true);
      }
    } else {
      setShowLoginModal(false);
      // Prefill if empty
      setFormData((prev) => ({
        ...prev,
        patient_name: prev.patient_name || user.full_name || "",
        patient_phone: prev.patient_phone || user.phone_number || "",
      }));
    }
  }, [isMounted, token, user, isDemoMode]);

  // Fetch Doctor detail
  useEffect(() => {
    if (isDemoMode) {
      setDoctor(DEMO_DOCTOR);
      setIsLoadingDoctor(false);
      setDoctorError(null);
      return;
    }

    if (!doctorId || isNaN(doctorId)) {
      setIsLoadingDoctor(false);
      setDoctorError("Không tìm thấy thông tin bác sĩ. Vui lòng chọn bác sĩ từ danh sách.");
      return;
    }

    let isSubscribed = true;
    const fetchDoctor = async () => {
      try {
        setIsLoadingDoctor(true);
        setDoctorError(null);
        const res = await getDoctorDetail(doctorId);
        if (isSubscribed && res?.data) {
          setDoctor(res.data);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          if (axios.isAxiosError(err)) {
            const msg =
              err.response?.data?.message ||
              "Không thể kết nối đến máy chủ Backend (http://localhost:8080).";
            setDoctorError(msg);
          } else {
            setDoctorError("Đã xảy ra lỗi khi tải thông tin bác sĩ.");
          }
        }
      } finally {
        if (isSubscribed) {
          setIsLoadingDoctor(false);
        }
      }
    };

    fetchDoctor();

    return () => {
      isSubscribed = false;
    };
  }, [doctorId, isDemoMode]);

  // Fetch Doctor schedules for selected date
  const fetchSchedules = useCallback(async (dId: number, dateStr: string) => {
    if (isDemoMode) {
      setIsLoadingSchedules(true);
      setTimeout(() => {
        setSchedules(getDemoSchedules(dId, dateStr));
        setIsLoadingSchedules(false);
      }, 300);
      return;
    }

    try {
      setIsLoadingSchedules(true);
      const scheduleList = await getDoctorSchedules(dId, dateStr);
      setSchedules(Array.isArray(scheduleList) ? scheduleList : []);
    } catch {
      setSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (doctorId && !isNaN(doctorId) && selectedDate) {
      fetchSchedules(doctorId, selectedDate);
      setSelectedSlot(null);
    }
  }, [doctorId, selectedDate, fetchSchedules]);

  // Quick Demo Login helper for testing without backend
  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: 99,
      full_name: "Nguyễn Văn B (Bệnh nhân Thử nghiệm)",
      phone_number: "0912345678",
      email: "demo.patient@medicare.vn",
      role: "PATIENT",
      roleId: 2,
      avatar: null,
    };
    setLogin("demo-token-123456", demoUser);
    setShowLoginModal(false);
    setFormData((prev) => ({
      ...prev,
      patient_name: demoUser.full_name,
      patient_phone: demoUser.phone_number,
    }));
    toast.success("Đã đăng nhập tài khoản Demo thành công!");
  };

  // Handle Form changes
  const handleFormChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearError = (field: keyof PatientFormErrors) => {
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: PatientFormErrors = {};
    const name = formData.patient_name.trim();
    const phone = formData.patient_phone.trim();
    const symptoms = formData.symptoms.trim();

    if (!name) {
      errors.patient_name = "Vui lòng nhập họ và tên người khám bệnh.";
    } else if (name.length < 2) {
      errors.patient_name = "Họ và tên phải có tối thiểu 2 ký tự.";
    } else if (name.length > 255) {
      errors.patient_name = "Họ và tên không được vượt quá 255 ký tự.";
    }

    const phoneRegex = /^(0[0-9]{9})$/;
    if (!phone) {
      errors.patient_phone = "Vui lòng nhập số điện thoại liên hệ.";
    } else if (!phoneRegex.test(phone)) {
      errors.patient_phone = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.";
    }

    if (symptoms.length > 2000) {
      errors.symptoms = "Mô tả triệu chứng không được vượt quá 2000 ký tự.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Trigger Confirmation Modal
  const handleOpenConfirm = () => {
    if (!token || !user) {
      setShowLoginModal(true);
      toast.warning("Vui lòng đăng nhập để tiến hành đặt lịch khám.");
      return;
    }

    if (!selectedSlot) {
      toast.error("Vui lòng chọn một khung giờ khám còn trống.");
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      toast.error("Vui lòng kiểm tra lại thông tin người khám bệnh.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Submit appointment
  const handleConfirmBooking = async () => {
    if (!doctorId || !selectedSlot) return;

    try {
      setIsSubmitting(true);

      if (isDemoMode) {
        // Simulated response in demo mode
        await new Promise((resolve) => setTimeout(resolve, 600));
        const demoResult: AppointmentData = {
          id: Math.floor(Math.random() * 9000) + 1000,
          user_id: user?.id || 99,
          doctor_id: doctorId,
          date: `${selectedDate}T00:00:00.000Z`,
          time_type: selectedSlot,
          status: "PENDING",
          patient_name: formData.patient_name.trim(),
          patient_phone: formData.patient_phone.trim(),
          symptoms: formData.symptoms.trim() || undefined,
        };
        toast.success("Đặt lịch khám thành công (Chế độ Demo)!");
        setIsConfirmModalOpen(false);
        setCreatedAppointment(demoResult);
        setIsSuccessModalOpen(true);
        fetchSchedules(doctorId, selectedDate);
        return;
      }

      // Real API POST call
      const payload = {
        doctor_id: doctorId,
        date: selectedDate,
        time_type: selectedSlot,
        patient_name: formData.patient_name.trim(),
        patient_phone: formData.patient_phone.trim(),
        symptoms: formData.symptoms.trim() || undefined,
      };

      const res = await createAppointment(payload);

      toast.success(res.message || "Đặt lịch khám thành công!");
      setIsConfirmModalOpen(false);

      if (res.data) {
        setCreatedAppointment(res.data);
        setIsSuccessModalOpen(true);
      }

      fetchSchedules(doctorId, selectedDate);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg =
          err.response?.data?.message ||
          "Đặt lịch khám không thành công. Khung giờ này có thể đã hết chỗ hoặc trùng lịch.";
        toast.error(errorMsg);
      } else {
        toast.error("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setIsSuccessModalOpen(false);
    setCreatedAppointment(null);
    setSelectedSlot(null);
    if (doctorId) {
      fetchSchedules(doctorId, selectedDate);
    }
  };

  const currentRedirectPath = `/booking?doctor_id=${doctorId}`;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200/70 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={doctorId ? `/doctors/${doctorId}` : "/doctors"}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-600 hover:text-teal-700 flex items-center justify-center transition-colors"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Đặt lịch khám bệnh</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  Trực tuyến
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hoàn tất các bước để đặt lịch hẹn với bác sĩ nhanh chóng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Demo Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const nextDemo = !isDemoMode;
                setIsDemoMode(nextDemo);
                if (nextDemo) {
                  toast.info("Đã bật chế độ Demo (Dữ liệu mẫu để test nhanh)");
                } else {
                  toast.info("Đã chuyển về chế độ kết nối Backend thật");
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDemoMode
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/30"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
              title="Chuyển đổi dữ liệu demo để test nhanh"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{isDemoMode ? "Chế độ Test: BẬT" : "Chế độ Test: TẮT"}</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-teal-700 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-slate-900">MediCare</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Banner if in Demo mode */}
        {isMounted && isDemoMode && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Đang ở Chế độ Thử nghiệm:</strong> Sử dụng dữ liệu bác sĩ và lịch khám mẫu để kiểm tra toàn bộ giao diện và thao tác đặt lịch.
              </span>
            </div>
            {(!token || !user) && (
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs cursor-pointer shrink-0 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập nhanh Demo</span>
              </button>
            )}
          </div>
        )}

        {/* Backend Connection Error Banner (if real mode fails) */}
        {isMounted && !isDemoMode && doctorError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  Chưa thể kết nối tới Backend (http://localhost:8080)
                </h4>
                <p className="text-xs text-rose-700">
                  {doctorError} Bạn có thể bật Chế độ Test để trải nghiệm ngay lập tức.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsDemoMode(true);
                toast.success("Đã kích hoạt Chế độ Test!");
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs shrink-0 transition-colors cursor-pointer"
            >
              Bật Chế độ Test ngay
            </button>
          </div>
        )}

        {/* Auth Warning Banner */}
        {isMounted && (!token || !user) && (
          <div className="mb-6 p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-teal-900">
                  Bạn chưa đăng nhập tài khoản
                </h4>
                <p className="text-xs text-teal-800">
                  Vui lòng đăng nhập để hệ thống lưu hồ sơ và thông báo lịch khám cho bạn.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="px-3 py-1.5 rounded-xl border border-teal-300 bg-white hover:bg-teal-50 text-teal-800 text-xs font-medium transition-colors cursor-pointer"
              >
                Đăng nhập nhanh Demo
              </button>
              <Link
                href={`/login?redirect=${encodeURIComponent(currentRedirectPath)}`}
                className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs shrink-0 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Doctor Card, Date Picker, Time Slots */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step 1: Doctor Card */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Bác sĩ phụ trách
                </span>
              </div>
              <DoctorSummaryCard
                doctor={doctor}
                isLoading={isLoadingDoctor}
              />
            </div>

            {/* Step 2: Date Selector */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Chọn ngày khám
                </span>
              </div>
              <DateSelector
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                daysCount={14}
              />
            </div>

            {/* Step 3: Time Slot Selector */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Chọn ca khám (Khung giờ)
                </span>
              </div>
              <TimeSlotSelector
                selectedDate={selectedDate}
                schedules={schedules}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                isLoading={isLoadingSchedules}
              />
            </div>
          </div>

          {/* Right Column: Patient Form & Sticky Summary */}
          <div className="lg:col-span-5 space-y-5">
            {/* Step 4: Patient Info Form */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center">
                  4
                </span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Thông tin người khám
                </span>
              </div>
              <PatientInfoForm
                currentUser={user}
                formData={formData}
                formErrors={formErrors}
                onChange={handleFormChange}
                onClearError={handleClearError}
                isMounted={isMounted}
              />
            </div>

            {/* Sticky Booking Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Tóm tắt lịch đặt</span>
                <span className="text-xs font-normal text-slate-500">
                  Bước cuối
                </span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bác sĩ:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {doctor?.user?.full_name || "---"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chuyên khoa:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {doctor?.specialty?.name || "---"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày khám:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {selectedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ca khám đã chọn:</span>
                  <span
                    className={`font-bold ${
                      selectedSlot ? "text-teal-700" : "text-amber-600"
                    }`}
                  >
                    {selectedSlot ? `Ca ${selectedSlot}` : "Chưa chọn ca"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Phí dịch vụ:</span>
                  <span className="font-extrabold text-teal-800 text-sm">
                    {doctor?.price
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(Number(doctor.price) || 0)
                      : "0 ₫"}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleOpenConfirm}
                disabled={!doctor || isLoadingDoctor}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-700/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tiếp tục xác nhận</span>
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Nhấn &quot;Tiếp tục xác nhận&quot; để rà soát thông tin trước khi hoàn tất đặt lịch.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {doctor && selectedSlot && (
        <BookingConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmBooking}
          doctor={doctor}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          patientData={formData}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Success Modal */}
      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        appointment={createdAppointment}
        doctor={doctor}
        onBookAnother={handleBookAnother}
      />

      {/* Login Prompt Modal (if not logged in) */}
      <LoginPromptModal
        isOpen={showLoginModal}
        redirectUrl={currentRedirectPath}
      />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50/60">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
