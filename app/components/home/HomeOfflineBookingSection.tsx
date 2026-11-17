"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  LogIn, 
  ArrowRight, 
  ChevronRight,
  ChevronLeft,
  Loader2,
  Users,
  Sun,
  Sunset,
  CreditCard,
  BadgeCheck,
  Check
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

import { userStore } from "@/app/store/AuthStore";
import { Doctor, DoctorDetail } from "@/app/types/Doctor";
import { Specialty } from "@/app/types/Clinic";
import { 
  Schedule, 
  TimeType, 
  TIME_SLOTS, 
  isSlotPassedInVN, 
  SlotAvailabilityStatus 
} from "@/app/types/schedule";
import { AppointmentData } from "@/app/types/appointment";
import { getDoctors, FALLBACK_DOCTORS } from "@/app/lib/doctor.api";
import { getSpecialties } from "@/app/lib/clinic.api";
import { getDoctorSchedules } from "@/app/lib/schedule.api";
import { createAppointment } from "@/app/lib/appointment.api";
import BookingSuccessModal from "@/app/components/booking/BookingSuccessModal";
import LoginPromptModal from "@/app/components/booking/LoginPromptModal";

// Helper: lấy ngày hôm nay theo giờ Việt Nam (Asia/Ho_Chi_Minh - UTC+7)
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

// Fallback specialties nếu backend chưa có hoặc chưa đăng nhập
const FALLBACK_SPECIALTIES: Specialty[] = [
  { id: 1, name: "Sản-Phụ khoa", description: "Chuyên khoa Sản phụ" },
  { id: 7, name: "Mắt", description: "Chuyên khoa Mắt" },
  { id: 4, name: "Tai Mũi Họng", description: "Chuyên khoa Tai Mũi Họng" },
  { id: 2, name: "Nội tim mạch", description: "Chuyên khoa Tim mạch" },
  { id: 3, name: "Cơ Xương Khớp", description: "Chuyên khoa Cơ Xương Khớp" },
];

const VI_DAYS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

interface SlotViewItem {
  key: TimeType;
  label: string;
  startTime: string;
  endTime: string;
  session: "morning" | "afternoon";
  status: SlotAvailabilityStatus;
  schedule?: Schedule;
  remainingSlots?: number;
}

export const HomeOfflineBookingSection: React.FC = () => {
  const { user, token } = userStore();
  const [isMounted, setIsMounted] = useState(false);

  // 1. Chuyên khoa & Bác sĩ
  const [specialties, setSpecialties] = useState<Specialty[]>(FALLBACK_SPECIALTIES);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | "ALL">("ALL");
  const [doctors, setDoctors] = useState<Doctor[]>(FALLBACK_DOCTORS);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(11);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(true);

  // 2. Ngày khám & Ca khám
  const [selectedDate, setSelectedDate] = useState<string>(getTodayVN());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeType | null>(null);

  // 3. Thông tin người khám
  const [bookingFor, setBookingFor] = useState<"self" | "relative">("self");
  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{
    patient_name?: string;
    patient_phone?: string;
    symptoms?: string;
  }>({});

  // 4. Modal & Trạng thái xử lý
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [createdAppointment, setCreatedAppointment] = useState<AppointmentData | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Danh sách 14 ngày tới tính từ hôm nay theo giờ Việt Nam
  const dateList = useMemo(() => {
    const list: {
      dateStr: string;
      dayOfWeek: string;
      dayNumber: string;
      monthNumber: string;
      fullFormatted: string;
      isToday: boolean;
    }[] = [];

    const todayStr = getTodayVN();
    const [tYear, tMonth, tDay] = todayStr.split("-").map(Number);
    const baseDate = new Date(Date.UTC(tYear, tMonth - 1, tDay));

    for (let i = 0; i < 14; i++) {
      const d = new Date(baseDate);
      d.setUTCDate(baseDate.getUTCDate() + i);

      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const dayOfWeekIndex = d.getUTCDay();
      let dayOfWeek = VI_DAYS[dayOfWeekIndex];
      if (i === 0) dayOfWeek = "Hôm nay";
      else if (i === 1) dayOfWeek = "Ngày mai";

      list.push({
        dateStr,
        dayOfWeek,
        dayNumber: day,
        monthNumber: month,
        fullFormatted: `${VI_DAYS[dayOfWeekIndex]}, ${day}/${month}/${year}`,
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  // Hydration sync
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Tải danh sách chuyên khoa & bác sĩ
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingDoctors(true);
        const [specsRes, docsRes] = await Promise.allSettled([
          getSpecialties(),
          getDoctors({ pageSize: 50 }),
        ]);

        if (specsRes.status === "fulfilled" && specsRes.value && specsRes.value.length > 0) {
          setSpecialties(specsRes.value);
        }

        if (
          docsRes.status === "fulfilled" &&
          docsRes.value?.doctors &&
          docsRes.value.doctors.length > 0
        ) {
          setDoctors(docsRes.value.doctors);
          setSelectedDoctorId(docsRes.value.doctors[0].id);
        } else {
          setDoctors(FALLBACK_DOCTORS);
          setSelectedDoctorId(FALLBACK_DOCTORS[0].id);
        }
      } catch (err) {
        console.warn("HomeBookingSection: initial load error", err);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchInitialData();
  }, []);

  // Điền tự động thông tin người khám nếu đã đăng nhập
  useEffect(() => {
    if (isMounted && user && bookingFor === "self") {
      if (!patientName) setPatientName(user.full_name || "");
      if (!patientPhone) setPatientPhone(user.phone_number || "");
    }
  }, [isMounted, user, bookingFor, patientName, patientPhone]);

  // Lọc danh sách bác sĩ theo chuyên khoa
  const filteredDoctors = useMemo(() => {
    if (selectedSpecialtyId === "ALL") return doctors;
    return doctors.filter((doc) => doc.specialty_id === selectedSpecialtyId);
  }, [doctors, selectedSpecialtyId]);

  // Đảm bảo selectedDoctorId luôn thuộc danh sách đã lọc
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      const exists = filteredDoctors.some((d) => d.id === selectedDoctorId);
      if (!exists) {
        setSelectedDoctorId(filteredDoctors[0].id);
      }
    }
  }, [filteredDoctors, selectedDoctorId]);

  // Bác sĩ đang chọn
  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || doctors[0] || null;
  }, [doctors, selectedDoctorId]);

  // Tải lịch làm việc (schedules) của bác sĩ cho ngày đã chọn
  const fetchSchedules = useCallback(async (docId: number, dateStr: string) => {
    if (!docId || !dateStr) return;
    try {
      setIsLoadingSchedules(true);
      const res = await getDoctorSchedules(docId, dateStr);
      setSchedules(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn("fetchSchedules error:", err);
      setSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchSchedules(selectedDoctorId, selectedDate);
      setSelectedSlot(null);
    }
  }, [selectedDoctorId, selectedDate, fetchSchedules]);

  // Tính toán trạng thái các ca khám (T1 -> T8) theo đúng logic backend
  const { morningSlots, afternoonSlots, availableCount } = useMemo(() => {
    const morningKeys: TimeType[] = ["T1", "T2", "T3", "T4"];
    const afternoonKeys: TimeType[] = ["T5", "T6", "T7", "T8"];

    const buildSlot = (key: TimeType): SlotViewItem => {
      const config = TIME_SLOTS[key];
      const schedule = schedules.find((s) => s.time_type === key);
      const isPassed = isSlotPassedInVN(selectedDate, config.startTime);

      let status: SlotAvailabilityStatus = "NOT_SCHEDULED";
      let remainingSlots: number | undefined;

      if (!schedule) {
        status = "NOT_SCHEDULED";
      } else if (isPassed) {
        status = "PASSED";
      } else if (
        schedule.status !== "AVAILABLE" ||
        schedule.current_number >= schedule.max_number
      ) {
        status = "FULL";
      } else {
        status = "AVAILABLE";
        remainingSlots = Math.max(0, schedule.max_number - schedule.current_number);
      }

      return {
        key,
        label: config.label,
        startTime: config.startTime,
        endTime: config.endTime,
        session: config.session,
        status,
        schedule,
        remainingSlots,
      };
    };

    const morning = morningKeys.map(buildSlot);
    const afternoon = afternoonKeys.map(buildSlot);
    const all = [...morning, ...afternoon];
    const available = all.filter((s) => s.status === "AVAILABLE").length;

    return {
      morningSlots: morning,
      afternoonSlots: afternoon,
      availableCount: available,
    };
  }, [schedules, selectedDate]);

  // Chuyển đổi đặt cho bản thân / người thân
  const handleToggleBookingFor = (type: "self" | "relative") => {
    setBookingFor(type);
    if (type === "self" && user) {
      setPatientName(user.full_name || "");
      setPatientPhone(user.phone_number || "");
      setFormErrors((prev) => ({ ...prev, patient_name: undefined, patient_phone: undefined }));
    } else {
      setPatientName("");
      setPatientPhone("");
    }
  };

  // Validate form client-side theo schema backend (CreateAppointmentSchema)
  const validateForm = (): boolean => {
    const errors: { patient_name?: string; patient_phone?: string; symptoms?: string } = {};
    const name = patientName.trim();
    const phone = patientPhone.trim();
    const sym = symptoms.trim();

    if (!name) {
      errors.patient_name = "Vui lòng nhập họ và tên người khám";
    } else if (name.length < 2) {
      errors.patient_name = "Họ tên phải có ít nhất 2 ký tự";
    } else if (name.length > 255) {
      errors.patient_name = "Họ tên không được vượt quá 255 ký tự";
    }

    const phoneRegex = /^(0[0-9]{9})$/;
    if (!phone) {
      errors.patient_phone = "Vui lòng nhập số điện thoại";
    } else if (!phoneRegex.test(phone)) {
      errors.patient_phone = "Số điện thoại phải gồm 10 chữ số (bắt đầu bằng số 0)";
    }

    if (sym.length > 2000) {
      errors.symptoms = "Mô tả triệu chứng không được vượt quá 2000 ký tự";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý gửi đặt lịch Offline tới Backend
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Kiểm tra đăng nhập (bắt buộc theo backend authMiddlewareClients)
    if (!token || !user) {
      setShowLoginModal(true);
      toast.warning("Vui lòng đăng nhập để tiến hành đặt lịch khám Offline.");
      return;
    }

    // 2. Kiểm tra chọn ca khám
    if (!selectedSlot) {
      toast.error("Vui lòng chọn một khung giờ khám còn trống.");
      return;
    }

    // 3. Kiểm tra validation form
    const isValid = validateForm();
    if (!isValid) {
      toast.error("Vui lòng kiểm tra lại thông tin người khám.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        doctor_id: selectedDoctorId,
        date: selectedDate,
        time_type: selectedSlot,
        patient_name: patientName.trim(),
        patient_phone: patientPhone.trim(),
        symptoms: symptoms.trim() || undefined,
      };

      const res = await createAppointment(payload);

      toast.success(res.message || "Đặt lịch khám Offline thành công!");

      // Chuẩn bị dữ liệu hiển thị modal thành công
      const appointmentResult: AppointmentData = (res.data as AppointmentData) || {
        id: Math.floor(Math.random() * 9000) + 1000,
        user_id: user.id,
        doctor_id: selectedDoctorId,
        date: `${selectedDate}T00:00:00.000Z`,
        time_type: selectedSlot,
        status: "PENDING",
        patient_name: patientName.trim(),
        patient_phone: patientPhone.trim(),
        symptoms: symptoms.trim() || undefined,
      };

      setCreatedAppointment(appointmentResult);
      setIsSuccessModalOpen(true);

      // Cập nhật lại danh sách lịch để phản ánh số chỗ còn lại
      fetchSchedules(selectedDoctorId, selectedDate);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        let errorMsg = "Đặt lịch khám không thành công. Vui lòng thử lại.";

        if (Array.isArray(errorData?.message)) {
          errorMsg = errorData.message.join(" | ");
        } else if (typeof errorData?.message === "string") {
          errorMsg = errorData.message;
        }

        toast.error(errorMsg);
      } else {
        toast.error("Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra lại kết nối.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPrice = useMemo(() => {
    if (!selectedDoctor?.price) return "150.000 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(selectedDoctor.price) || 0);
  }, [selectedDoctor]);

  const doctorDetailForModal: DoctorDetail | null = useMemo(() => {
    if (!selectedDoctor) return null;
    return {
      id: selectedDoctor.id,
      user_id: selectedDoctor.user_id,
      specialty_id: selectedDoctor.specialty_id,
      price: selectedDoctor.price,
      description: selectedDoctor.description,
      clinic_name: selectedDoctor.clinic_name || "Phòng khám Đa khoa MediCare",
      clinic_address:
        selectedDoctor.clinic_address ||
        "Số 123 Đường Y Học, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      user: selectedDoctor.user,
      specialty: selectedDoctor.specialty,
    };
  }, [selectedDoctor]);

  return (
    <section id="offline-booking" className="relative py-12 md:py-20 bg-slate-50/80 overflow-hidden border-t border-slate-200/60">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/70 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Khám Trực Tiếp Tại Phòng Khám (Offline)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Đặt Lịch Khám Offline Nhanh Chóng
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Chủ động chọn bác sĩ chuyên khoa, đặt trước khung giờ khám tại phòng khám MediCare.
            Đến đúng giờ, lấy số ưu tiên và thanh toán trực tiếp tại quầy lễ tân.
          </p>

          {/* Quick value badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Xác nhận ca khám tức thì
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> 100% Bác sĩ chuyên khoa đầu ngành
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
              <CreditCard className="w-3.5 h-3.5 text-teal-600" /> Thanh toán tại quầy lễ tân
            </span>
          </div>
        </div>

        {/* Booking Card Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          {/* Top Banner Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500" />

          <form onSubmit={handleSubmitBooking} className="p-5 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* LEFT COLUMN: Bác sĩ & Thời gian khám (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Chọn Chuyên khoa & Bác sĩ */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-100">
                        1
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        Chọn Bác sĩ & Chuyên khoa
                      </h3>
                    </div>

                    <Link
                      href="/doctors"
                      className="text-xs text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Xem tất cả</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Specialty quick filter pills */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Lọc theo chuyên khoa:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSpecialtyId("ALL")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          selectedSpecialtyId === "ALL"
                            ? "bg-teal-700 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Tất cả ({doctors.length})
                      </button>
                      {specialties.map((spec) => (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => setSelectedSpecialtyId(spec.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            selectedSpecialtyId === spec.id
                              ? "bg-teal-700 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {spec.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Selector Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Bác sĩ phụ trách:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                        disabled={isLoadingDoctors}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
                      >
                        {filteredDoctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.user.full_name} — {doc.specialty?.name || "Chuyên khoa"} (
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(Number(doc.price) || 0)}
                            )
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Stethoscope className="w-4 h-4 text-teal-600" />
                      </div>
                    </div>
                  </div>

                  {/* Selected Doctor Summary Card */}
                  {selectedDoctor && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-teal-50/50 border border-teal-100/80">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white border border-teal-200 shrink-0 shadow-xs">
                        {selectedDoctor.user.avatar ? (
                          <img
                            src={selectedDoctor.user.avatar}
                            alt={selectedDoctor.user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-700">
                            <User className="w-7 h-7" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-200/60">
                            {selectedDoctor.specialty?.name || "Bác sĩ chuyên khoa"}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate mt-0.5">
                          {selectedDoctor.user.full_name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>MediCare Clinic Q.1</span>
                          </span>
                          <span className="font-bold text-teal-800">
                            Giá khám: {formattedPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Chọn Ngày khám */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-100">
                        2
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        Chọn Ngày & Giờ Khám
                      </h3>
                    </div>

                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                      <span>14 ngày tới</span>
                    </span>
                  </div>

                  {/* Horizontal Scroll Date Picker */}
                  <div className="relative">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
                      {dateList.map((d) => {
                        const isSelected = selectedDate === d.dateStr;
                        return (
                          <button
                            key={d.dateStr}
                            type="button"
                            onClick={() => setSelectedDate(d.dateStr)}
                            className={`flex flex-col items-center justify-center min-w-[76px] py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer shrink-0 ${
                              isSelected
                                ? "bg-teal-700 border-teal-700 text-white shadow-md shadow-teal-700/20 scale-[1.02]"
                                : "bg-white border-slate-200/90 text-slate-700 hover:border-teal-300 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`text-[11px] font-medium leading-tight ${
                                isSelected ? "text-teal-100" : "text-slate-500"
                              }`}
                            >
                              {d.dayOfWeek}
                            </span>
                            <span className="text-base font-extrabold leading-tight my-0.5">
                              {d.dayNumber}/{d.monthNumber}
                            </span>
                            {d.isToday && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                  isSelected
                                    ? "bg-teal-800 text-teal-200"
                                    : "bg-teal-50 text-teal-700"
                                }`}
                              >
                                Hôm nay
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Khung giờ khám (Time Slots) */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>Khung giờ khả dụng:</span>
                      </label>

                      {isLoadingSchedules ? (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Đang kiểm tra lịch trống...</span>
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {availableCount > 0 ? `${availableCount} ca còn trống` : "Chưa có lịch"}
                        </span>
                      )}
                    </div>

                    {/* Sáng */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-2">
                        <Sun className="w-3.5 h-3.5" />
                        <span>Buổi sáng (08:00 - 12:00)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {morningSlots.map((slot) => {
                          const isSelected = selectedSlot === slot.key;
                          const isAvailable = slot.status === "AVAILABLE";
                          const isPassed = slot.status === "PASSED";
                          const isFull = slot.status === "FULL";

                          return (
                            <button
                              key={slot.key}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => setSelectedSlot(slot.key)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                                isSelected
                                  ? "bg-teal-700 text-white border-teal-700 shadow-sm ring-2 ring-teal-600/30"
                                  : isAvailable
                                  ? "bg-white border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-slate-900"
                                  : "bg-slate-100 border-slate-200/60 text-slate-400 cursor-not-allowed opacity-60"
                              }`}
                            >
                              <div className="text-xs font-bold">{slot.label}</div>
                              <div className="text-[10px] mt-0.5">
                                {isAvailable ? (
                                  <span className={isSelected ? "text-teal-200 font-semibold" : "text-emerald-600 font-medium"}>
                                    {slot.remainingSlots !== undefined ? `Còn ${slot.remainingSlots} chỗ` : "Còn chỗ"}
                                  </span>
                                ) : isPassed ? (
                                  <span className="text-slate-400">Đã qua</span>
                                ) : isFull ? (
                                  <span className="text-rose-500 font-medium">Hết chỗ</span>
                                ) : (
                                  <span className="text-slate-400">Không có lịch</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chiều */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-2">
                        <Sunset className="w-3.5 h-3.5" />
                        <span>Buổi chiều (13:00 - 17:00)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {afternoonSlots.map((slot) => {
                          const isSelected = selectedSlot === slot.key;
                          const isAvailable = slot.status === "AVAILABLE";
                          const isPassed = slot.status === "PASSED";
                          const isFull = slot.status === "FULL";

                          return (
                            <button
                              key={slot.key}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => setSelectedSlot(slot.key)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                                isSelected
                                  ? "bg-teal-700 text-white border-teal-700 shadow-sm ring-2 ring-teal-600/30"
                                  : isAvailable
                                  ? "bg-white border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-slate-900"
                                  : "bg-slate-100 border-slate-200/60 text-slate-400 cursor-not-allowed opacity-60"
                              }`}
                            >
                              <div className="text-xs font-bold">{slot.label}</div>
                              <div className="text-[10px] mt-0.5">
                                {isAvailable ? (
                                  <span className={isSelected ? "text-teal-200 font-semibold" : "text-emerald-600 font-medium"}>
                                    {slot.remainingSlots !== undefined ? `Còn ${slot.remainingSlots} chỗ` : "Còn chỗ"}
                                  </span>
                                ) : isPassed ? (
                                  <span className="text-slate-400">Đã qua</span>
                                ) : isFull ? (
                                  <span className="text-rose-500 font-medium">Hết chỗ</span>
                                ) : (
                                  <span className="text-slate-400">Không có lịch</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Thông tin người khám & Tóm tắt (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:border-l lg:border-slate-100 lg:pl-8">
                
                {/* 3. Thông tin người khám */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-100">
                        3
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        Thông Tin Người Khám
                      </h3>
                    </div>

                    {/* Toggle: Đặt cho bản thân vs Người thân */}
                    {isMounted && user && (
                      <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleBookingFor("self")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                            bookingFor === "self"
                              ? "bg-white text-teal-800 shadow-xs font-semibold"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Cho tôi
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBookingFor("relative")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                            bookingFor === "relative"
                              ? "bg-white text-teal-800 shadow-xs font-semibold"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Người thân
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Họ tên bệnh nhân */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Họ và tên người khám <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => {
                          setPatientName(e.target.value);
                          if (formErrors.patient_name) {
                            setFormErrors((prev) => ({ ...prev, patient_name: undefined }));
                          }
                        }}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 pl-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                          formErrors.patient_name
                            ? "border-rose-400 focus:ring-rose-400"
                            : "border-slate-200 focus:ring-teal-500"
                        }`}
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {formErrors.patient_name && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.patient_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Số điện thoại liên hệ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => {
                          setPatientPhone(e.target.value);
                          if (formErrors.patient_phone) {
                            setFormErrors((prev) => ({ ...prev, patient_phone: undefined }));
                          }
                        }}
                        placeholder="Ví dụ: 0901234567"
                        maxLength={10}
                        className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 pl-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                          formErrors.patient_phone
                            ? "border-rose-400 focus:ring-rose-400"
                            : "border-slate-200 focus:ring-teal-500"
                        }`}
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {formErrors.patient_phone && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.patient_phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Triệu chứng / Lý do khám */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Lý do khám / Triệu chứng (tùy chọn)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={symptoms}
                        onChange={(e) => {
                          setSymptoms(e.target.value);
                          if (formErrors.symptoms) {
                            setFormErrors((prev) => ({ ...prev, symptoms: undefined }));
                          }
                        }}
                        placeholder="Mô tả ngắn gọn biểu hiện sức khỏe hiện tại của bạn..."
                        maxLength={2000}
                        className={`w-full bg-slate-50 border rounded-2xl px-4 py-2.5 pl-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all resize-none ${
                          formErrors.symptoms
                            ? "border-rose-400 focus:ring-rose-400"
                            : "border-slate-200 focus:ring-teal-500"
                        }`}
                      />
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    {formErrors.symptoms && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.symptoms}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Tóm tắt & Nút hành động */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Bác sĩ:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedDoctor?.user?.full_name || "Chưa chọn"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Thời gian:</span>
                      <span className="font-semibold text-teal-800">
                        {selectedSlot ? TIME_SLOTS[selectedSlot].label : "--:--"} |{" "}
                        {(() => {
                          try {
                            const [y, m, d] = selectedDate.split("-");
                            return `${d}/${m}/${y}`;
                          } catch {
                            return selectedDate;
                          }
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Địa điểm khám:</span>
                      <span className="font-medium text-slate-800 text-right">
                        Phòng khám MediCare Q.1, TP.HCM
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 font-bold text-sm">
                      <span className="text-slate-800">Chi phí khám:</span>
                      <span className="text-teal-700">{formattedPrice}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Thanh toán tại quầy lễ tân khi đến thăm khám.</span>
                    </p>
                  </div>

                  {/* Nút Đặt Lịch */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold text-sm sm:text-base shadow-lg shadow-teal-700/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang xử lý đặt lịch...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 stroke-[2.5]" />
                        <span>Xác Nhận Đặt Lịch Khám Offline</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    Bằng việc bấm xác nhận, bạn đồng ý với Quy chế hoạt động & Chính sách bảo mật của MediCare.
                  </p>
                </div>

              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal yêu cầu đăng nhập */}
      <LoginPromptModal
        isOpen={showLoginModal}
        redirectUrl="/"
      />

      {/* Modal Đặt lịch thành công */}
      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        appointment={createdAppointment}
        doctor={doctorDetailForModal}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setSelectedSlot(null);
          setSymptoms("");
        }}
        onBookAnother={() => {
          setIsSuccessModalOpen(false);
          setSelectedSlot(null);
          setSymptoms("");
        }}
        onGoHome={() => {
          setIsSuccessModalOpen(false);
          setSelectedSlot(null);
          setSymptoms("");
        }}
      />
    </section>
  );
};
