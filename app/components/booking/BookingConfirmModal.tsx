"use client";

import React, { useEffect } from "react";
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  CreditCard, 
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Stethoscope
} from "lucide-react";
import { DoctorDetail } from "@/app/types/Doctor";
import { TimeType, TIME_SLOTS } from "@/app/types/schedule";
import { PatientFormData } from "./PatientInfoForm";

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  doctor: DoctorDetail;
  selectedDate: string; // YYYY-MM-DD
  selectedSlot: TimeType;
  patientData: PatientFormData;
  isSubmitting: boolean;
}

export default function BookingConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  doctor,
  selectedDate,
  selectedSlot,
  patientData,
  isSubmitting,
}: BookingConfirmModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const slotInfo = TIME_SLOTS[selectedSlot];

  // Format date display: "Thứ ..., ngày DD tháng MM năm YYYY"
  const formattedDate = (() => {
    try {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const d = new Date(Date.UTC(year, month - 1, day));
      const daysOfWeek = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
      return `${daysOfWeek[d.getUTCDay()]}, ngày ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    } catch {
      return selectedDate;
    }
  })();

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(doctor.price) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Xác nhận đặt lịch khám
              </h3>
              <p className="text-xs text-slate-500">
                Vui lòng rà soát lại thông tin trước khi hoàn tất
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Đóng popup"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Doctor Brief */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-teal-700 block uppercase tracking-wider">
                  {doctor.specialty?.name || "Bác sĩ Chuyên khoa"}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {doctor.user?.full_name}
                </h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Phí khám</span>
              <span className="text-sm font-extrabold text-teal-800">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Appointment Details Grid */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs sm:text-sm">
            {/* Date */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200/60">
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium shrink-0">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Ngày khám:</span>
              </span>
              <span className="font-semibold text-slate-900 text-right">
                {formattedDate}
              </span>
            </div>

            {/* Time slot */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200/60">
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium shrink-0">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Khung giờ:</span>
              </span>
              <span className="font-semibold text-teal-700 text-right">
                {slotInfo ? slotInfo.label : selectedSlot}{" "}
                <span className="text-xs font-normal text-slate-500">
                  ({slotInfo?.session === "morning" ? "Buổi sáng" : "Buổi chiều"})
                </span>
              </span>
            </div>

            {/* Patient Name */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200/60">
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium shrink-0">
                <User className="w-4 h-4 text-slate-400" />
                <span>Bệnh nhân:</span>
              </span>
              <span className="font-semibold text-slate-900 text-right">
                {patientData.patient_name}
              </span>
            </div>

            {/* Patient Phone */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200/60">
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium shrink-0">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Số điện thoại:</span>
              </span>
              <span className="font-semibold text-slate-900 text-right">
                {patientData.patient_phone}
              </span>
            </div>

            {/* Symptoms */}
            {patientData.symptoms && (
              <div className="flex items-start justify-between gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium shrink-0">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Lý do khám:</span>
                </span>
                <span className="text-slate-700 text-right line-clamp-2 max-w-[65%]">
                  {patientData.symptoms}
                </span>
              </div>
            )}
          </div>

          {/* Clinic Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-900">Lưu ý trước khi đến khám:</p>
              <p className="text-amber-800/90 leading-relaxed">
                Vui lòng có mặt tại quầy tiếp đón trước giờ hẹn 15 phút và mang theo giấy tờ tùy thân (CCCD/BHYT nếu có) để hoàn tất thủ tục vào phòng khám.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
          >
            Quay lại chỉnh sửa
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-md shadow-teal-700/20 active:scale-[0.99] transition-all disabled:pointer-events-none disabled:opacity-60 cursor-pointer min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác nhận đặt lịch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

