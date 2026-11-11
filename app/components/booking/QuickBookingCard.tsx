"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ArrowLeft,
  Loader2,
  Stethoscope,
  Building2,
  CreditCard,
  ShieldCheck,
  Calendar
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
  isSlotPassedInVN 
} from "@/app/types/schedule";
import { AppointmentData } from "@/app/types/appointment";
import { getDoctors, FALLBACK_DOCTORS } from "@/app/lib/doctor.api";
import { getSpecialties } from "@/app/lib/clinic.api";
import { getDoctorSchedules } from "@/app/lib/schedule.api";
import { createAppointment } from "@/app/lib/appointment.api";
import BookingSuccessModal from "@/app/components/booking/BookingSuccessModal";
import LoginPromptModal from "@/app/components/booking/LoginPromptModal";

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

const FALLBACK_SPECIALTIES: Specialty[] = [
  { id: 7, name: "Khoa Mắt", description: "Chuyên khoa Mắt" },
  { id: 1, name: "Sản-Phụ khoa", description: "Chuyên khoa Sản phụ" },
  { id: 4, name: "Tai Mũi Họng", description: "Chuyên khoa Tai Mũi Họng" },
  { id: 2, name: "Nội tim mạch", description: "Chuyên khoa Tim mạch" },
  { id: 3, name: "Cơ Xương Khớp", description: "Chuyên khoa Cơ Xương Khớp" },
];

export const QuickBookingCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { user, token } = userStore();
  const [isMounted, setIsMounted] = useState(false);

  // Step 1: Chọn thông tin khám | Step 2: Nhập thông tin bệnh nhân
  const [step, setStep] = useState<1 | 2>(1);

  // 1. Chuyên khoa & Bác sĩ
  const [specialties, setSpecialties] = useState<Specialty[]>(FALLBACK_SPECIALTIES);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | "">("");
  const [doctors, setDoctors] = useState<Doctor[]>(FALLBACK_DOCTORS);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | "">("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(true);

  // 2. Ngày khám & Giờ khám
  const [selectedDate, setSelectedDate] = useState<string>(getTodayVN());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeType | "">("");

  // 3. Thông tin người khám (Step 2)
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Tải dữ liệu Chuyên khoa & Bác sĩ ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingDoctors(true);
        const [specsRes, docsRes] = await Promise.allSettled([
          getSpecialties(),
          getDoctors({ pageSize: 50 }),
        ]);

        let loadedSpecs = FALLBACK_SPECIALTIES;
        if (specsRes.status === "fulfilled" && specsRes.value && specsRes.value.length > 0) {
          loadedSpecs = specsRes.value;
          setSpecialties(loadedSpecs);
        }

        let loadedDocs = FALLBACK_DOCTORS;
        if (
          docsRes.status === "fulfilled" &&
          docsRes.value?.doctors &&
          docsRes.value.doctors.length > 0
        ) {
          loadedDocs = docsRes.value.doctors;
          setDoctors(loadedDocs);
        }

        if (loadedSpecs.length > 0) {
          setSelectedSpecialtyId(loadedSpecs[0].id);
        }
        if (loadedDocs.length > 0) {
          setSelectedDoctorId(loadedDocs[0].id);
        }
      } catch (err) {
        console.warn("QuickBookingCard load error:", err);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchData();
  }, []);

  // Danh sách bác sĩ lọc theo chuyên khoa đã chọn
  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialtyId) return doctors;
    const docs = doctors.filter((doc) => doc.specialty_id === selectedSpecialtyId);
    return docs.length > 0 ? docs : doctors;
  }, [doctors, selectedSpecialtyId]);

  // Khi đổi chuyên khoa, tự động cập nhật bác sĩ đầu tiên thuộc khoa đó
  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const specId = e.target.value ? Number(e.target.value) : "";
    setSelectedSpecialtyId(specId);
    if (specId) {
      const match = doctors.find((d) => d.specialty_id === specId);
      if (match) {
        setSelectedDoctorId(match.id);
      }
    }
  };

  // Bác sĩ đang chọn
  const selectedDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return doctors.find((d) => d.id === selectedDoctorId) || null;
  }, [doctors, selectedDoctorId]);

  // Lấy lịch trống của bác sĩ theo ngày
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
      fetchSchedules(Number(selectedDoctorId), selectedDate);
      setSelectedSlot("");
    }
  }, [selectedDoctorId, selectedDate, fetchSchedules]);

  // Tự động điền thông tin nếu đã đăng nhập
  useEffect(() => {
    if (isMounted && user && bookingFor === "self") {
      if (!patientName) setPatientName(user.full_name || "");
      if (!patientPhone) setPatientPhone(user.phone_number || "");
    }
  }, [isMounted, user, bookingFor, patientName, patientPhone]);

  // Danh sách các ca khám hợp lệ
  const slotOptions = useMemo(() => {
    const keys: TimeType[] = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"];
    return keys.map((key) => {
      const config = TIME_SLOTS[key];
      const schedule = schedules.find((s) => s.time_type === key);
      const isPassed = isSlotPassedInVN(selectedDate, config.startTime);

      let status = "AVAILABLE";
      let remaining = 10;

      if (!schedule) {
        status = isPassed ? "PASSED" : "AVAILABLE";
      } else if (isPassed) {
        status = "PASSED";
      } else if (schedule.status !== "AVAILABLE" || schedule.current_number >= schedule.max_number) {
        status = "FULL";
      } else {
        status = "AVAILABLE";
        remaining = Math.max(0, schedule.max_number - schedule.current_number);
      }

      return {
        key,
        label: config.label,
        startTime: config.startTime,
        status,
        remaining,
      };
    });
  }, [schedules, selectedDate]);

  // Xử lý chuyển sang Bước 2
  const handleNextStep = () => {
    if (!selectedDoctorId) {
      toast.error("Vui lòng chọn bác sĩ khám.");
      return;
    }
    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày khám.");
      return;
    }
    if (!selectedSlot) {
      toast.error("Vui lòng chọn giờ khám.");
      return;
    }
    setStep(2);
  };

  // Validate Step 2 form theo schema backend
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
      errors.patient_name = "Họ tên không vượt quá 255 ký tự";
    }

    const phoneRegex = /^(0[0-9]{9})$/;
    if (!phone) {
      errors.patient_phone = "Vui lòng nhập số điện thoại";
    } else if (!phoneRegex.test(phone)) {
      errors.patient_phone = "Số điện thoại phải gồm 10 số (bắt đầu bằng 0)";
    }

    if (sym.length > 2000) {
      errors.symptoms = "Triệu chứng tối đa 2000 ký tự";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xác nhận đặt lịch Offline
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      setShowLoginModal(true);
      toast.warning("Vui lòng đăng nhập để hoàn tất đặt lịch khám Offline.");
      return;
    }

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin người khám.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        doctor_id: Number(selectedDoctorId),
        date: selectedDate,
        time_type: selectedSlot,
        patient_name: patientName.trim(),
        patient_phone: patientPhone.trim(),
        symptoms: symptoms.trim() || undefined,
      };

      const res = await createAppointment(payload);
      toast.success(res.message || "Đặt lịch khám thành công!");

      const appointmentResult: AppointmentData = (res.data as AppointmentData) || {
        id: Math.floor(Math.random() * 9000) + 1000,
        user_id: user.id,
        doctor_id: Number(selectedDoctorId),
        date: `${selectedDate}T00:00:00.000Z`,
        time_type: selectedSlot,
        status: "PENDING",
        patient_name: patientName.trim(),
        patient_phone: patientPhone.trim(),
        symptoms: symptoms.trim() || undefined,
      };

      setCreatedAppointment(appointmentResult);
      setIsSuccessModalOpen(true);
      fetchSchedules(Number(selectedDoctorId), selectedDate);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        let errorMsg = "Đặt lịch không thành công. Khung giờ này có thể đã hết chỗ hoặc bị trùng lịch.";
        if (Array.isArray(errorData?.message)) {
          errorMsg = errorData.message.join(" | ");
        } else if (typeof errorData?.message === "string") {
          errorMsg = errorData.message;
        }
        toast.error(errorMsg);
      } else {
        toast.error("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
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

  // Reset form về trạng thái ban đầu sau khi đặt lịch xong
  const handleResetForm = useCallback(() => {
    setIsSuccessModalOpen(false);
    setCreatedAppointment(null);
    setStep(1);
    setSelectedSlot("");
    setSymptoms("");
    setFormErrors({});
    setBookingFor("self");

    if (user) {
      setPatientName(user.full_name || "");
      setPatientPhone(user.phone_number || "");
    } else {
      setPatientName("");
      setPatientPhone("");
    }

    const today = getTodayVN();
    setSelectedDate(today);

    if (specialties.length > 0) {
      const firstSpec = specialties[0];
      setSelectedSpecialtyId(firstSpec.id);
      const matchedDoctor = doctors.find((d) => d.specialty_id === firstSpec.id) || doctors[0];
      if (matchedDoctor) {
        setSelectedDoctorId(matchedDoctor.id);
        fetchSchedules(matchedDoctor.id, today);
      }
    } else if (doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
      fetchSchedules(doctors[0].id, today);
    }
  }, [user, specialties, doctors, fetchSchedules]);

  return (
    <div
      className={`bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 border-teal-600/70 shadow-[0_12px_36px_-6px_rgba(13,148,136,0.22)] p-5 sm:p-6 w-full max-w-[390px] sm:max-w-[430px] transition-all text-slate-800 ${className}`}
    >
      {/* Header title synchronized with Banner Teal theme */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-teal-100/60">
        <h3 className="text-teal-800 text-lg sm:text-xl font-extrabold tracking-tight uppercase flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span>{step === 1 ? "ĐẶT LỊCH HẸN KHÁM" : "THÔNG TIN ĐẶT KHÁM"}</span>
        </h3>
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs text-slate-500 hover:text-teal-700 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        )}
      </div>

      {step === 1 ? (
        /* STEP 1: CHỌN KHOA, BÁC SĨ, NGÀY & GIỜ KHÁM */
        <div className="space-y-3.5">
          {/* 1. Chọn Khoa / Chuyên khoa */}
          <div className="relative">
            <select
              value={selectedSpecialtyId}
              onChange={handleSpecialtyChange}
              className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-9 text-sm text-slate-800 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer shadow-2xs hover:border-teal-400"
            >
              <option value="">-- Chọn khoa khám --</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 2. Chọn Bác sĩ */}
          <div className="relative">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              disabled={isLoadingDoctors}
              className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-9 text-sm text-slate-800 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer shadow-2xs disabled:bg-slate-50 hover:border-teal-400"
            >
              <option value="">-- Chọn bác sĩ --</option>
              {filteredDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.user.full_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 3. Row 2 cột: Ngày khám & Chọn giờ khám */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Cột trái: Ngày khám */}
            <div className="relative">
              <input
                type="date"
                min={getTodayVN()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer shadow-2xs hover:border-teal-400"
              />
            </div>

            {/* Cột phải: Chọn giờ khám (Dropdown) */}
            <div className="relative">
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value as TimeType)}
                className="w-full appearance-none bg-white border border-teal-500/80 rounded-lg px-3 py-2 pr-8 text-sm text-slate-800 font-medium focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer shadow-2xs"
              >
                <option value="">Chọn giờ khám</option>
                {slotOptions.map((slot) => {
                  const isAvailable = slot.status === "AVAILABLE";
                  const isPassed = slot.status === "PASSED";
                  const isFull = slot.status === "FULL";

                  return (
                    <option
                      key={slot.key}
                      value={slot.key}
                      disabled={!isAvailable}
                    >
                      {slot.startTime} {isPassed ? "(Đã qua)" : isFull ? "(Kín)" : ""}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Price & mini doctor hint */}
          {selectedDoctor && (
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1 px-0.5">
              <span>Phí khám niêm yết:</span>
              <span className="font-bold text-teal-800">{formattedPrice}</span>
            </div>
          )}

          {/* Button: Tiếp theo (Đồng bộ màu Teal của Banner) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm px-7 py-2.5 rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Tiếp theo</span>
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: NHẬP THÔNG TIN NGƯỜI KHÁM & XÁC NHẬN */
        <form onSubmit={handleConfirmBooking} className="space-y-3">
          {/* Summary of chosen info */}
          <div className="bg-teal-50/70 rounded-xl p-2.5 border border-teal-100 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Bác sĩ:</span>
              <span className="font-bold text-slate-800">{selectedDoctor?.user?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian:</span>
              <span className="font-bold text-teal-800">
                {selectedSlot ? TIME_SLOTS[selectedSlot].label : ""} | {selectedDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Giá khám:</span>
              <span className="font-bold text-teal-800">{formattedPrice}</span>
            </div>
          </div>

          {/* Toggle "Cho tôi" / "Người thân" */}
          {isMounted && user && (
            <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => {
                  setBookingFor("self");
                  setPatientName(user.full_name || "");
                  setPatientPhone(user.phone_number || "");
                }}
                className={`flex-1 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  bookingFor === "self" ? "bg-white text-teal-800 shadow-2xs" : "text-slate-600"
                }`}
              >
                Cho tôi
              </button>
              <button
                type="button"
                onClick={() => {
                  setBookingFor("relative");
                  setPatientName("");
                  setPatientPhone("");
                }}
                className={`flex-1 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  bookingFor === "relative" ? "bg-white text-teal-800 shadow-2xs" : "text-slate-600"
                }`}
              >
                Người thân
              </button>
            </div>
          )}

          {/* Họ tên */}
          <div>
            <input
              type="text"
              value={patientName}
              onChange={(e) => {
                setPatientName(e.target.value);
                if (formErrors.patient_name) {
                  setFormErrors((prev) => ({ ...prev, patient_name: undefined }));
                }
              }}
              placeholder="Họ và tên người khám *"
              className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 ${
                formErrors.patient_name ? "border-rose-400" : "border-slate-300"
              }`}
            />
            {formErrors.patient_name && (
              <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.patient_name}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <input
              type="tel"
              value={patientPhone}
              maxLength={10}
              onChange={(e) => {
                setPatientPhone(e.target.value);
                if (formErrors.patient_phone) {
                  setFormErrors((prev) => ({ ...prev, patient_phone: undefined }));
                }
              }}
              placeholder="Số điện thoại liên hệ (10 số) *"
              className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 ${
                formErrors.patient_phone ? "border-rose-400" : "border-slate-300"
              }`}
            />
            {formErrors.patient_phone && (
              <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.patient_phone}</p>
            )}
          </div>

          {/* Lý do khám */}
          <div>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Triệu chứng / Lý do khám (tùy chọn)"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 resize-none"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            * Thanh toán tại quầy lễ tân khi đến thăm khám.
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Xác nhận đặt lịch</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Modal yêu cầu đăng nhập */}
      <LoginPromptModal
        isOpen={showLoginModal}
        redirectUrl="/"
        onClose={() => setShowLoginModal(false)}
      />

      {/* Modal thành công */}
      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        appointment={createdAppointment}
        doctor={doctorDetailForModal}
        onClose={handleResetForm}
        onBookAnother={handleResetForm}
        onGoHome={handleResetForm}
      />
    </div>
  );
};

export default QuickBookingCard;
