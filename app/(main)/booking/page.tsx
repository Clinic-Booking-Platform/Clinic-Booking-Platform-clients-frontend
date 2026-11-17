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

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Auth state
  const { user, token } = userStore();
  const [isMounted, setIsMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 2. Doctor state
  const rawDoctorId = searchParams.get("doctor_id") || searchParams.get("doctorId");
  const doctorId = rawDoctorId ? parseInt(rawDoctorId, 10) : 11; // Defaults to doctor 11 from DB
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState<boolean>(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  // 3. Date & Schedule state
  const [selectedDate, setSelectedDate] = useState<string>(getTodayVN());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeType | null>(null);

  // 4. Patient Form state
  const [formData, setFormData] = useState<PatientFormData>({
    patient_name: "",
    patient_phone: "",
    symptoms: "",
  });
  const [formErrors, setFormErrors] = useState<PatientFormErrors>({});

  // 5. Booking confirmation & submission
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 6. Booking Success state
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
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
      setFormData((prev) => ({
        ...prev,
        patient_name: prev.patient_name || user.full_name || "",
        patient_phone: prev.patient_phone || user.phone_number || "",
      }));
    }
  }, [isMounted, token, user]);

  // Fetch Doctor detail
  useEffect(() => {
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
  }, [doctorId]);

  // Fetch Doctor schedules for selected date
  const fetchSchedules = useCallback(async (dId: number, dateStr: string) => {
    try {
      setIsLoadingSchedules(true);
      const scheduleList = await getDoctorSchedules(dId, dateStr);
      setSchedules(Array.isArray(scheduleList) ? scheduleList : []);
    } catch {
      setSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    if (doctorId && !isNaN(doctorId) && selectedDate) {
      fetchSchedules(doctorId, selectedDate);
      setSelectedSlot(null);
    }
  }, [doctorId, selectedDate, fetchSchedules]);

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

  // Submit appointment directly to Backend
  const handleConfirmBooking = async () => {
    if (!doctorId || !selectedSlot) return;

    try {
      setIsSubmitting(true);

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
    setFormData((prev) => ({
      ...prev,
      symptoms: "",
      booking_for: "self",
      patient_name: user?.full_name || "",
      patient_phone: user?.phone_number || "",
    }));
    setFormErrors({});
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
        {/* Backend Connection Error Banner (if real mode fails) */}
        {isMounted && doctorError && (
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
                  {doctorError}
                </p>
              </div>
            </div>
            <Link
              href="/doctors"
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs shrink-0 transition-colors"
            >
              Chọn bác sĩ khác
            </Link>
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
        onClose={handleBookAnother}
        onBookAnother={handleBookAnother}
        onGoHome={handleBookAnother}
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
