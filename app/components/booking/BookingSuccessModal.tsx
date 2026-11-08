"use client";

import React from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  ArrowRight, 
  Home, 
  RotateCcw,
  Stethoscope
} from "lucide-react";
import { AppointmentData } from "@/app/types/appointment";
import { DoctorDetail } from "@/app/types/Doctor";
import { TIME_SLOTS, TimeType } from "@/app/types/schedule";

interface BookingSuccessModalProps {
  isOpen: boolean;
  appointment: AppointmentData | null;
  doctor: DoctorDetail | null;
  onBookAnother: () => void;
}

export default function BookingSuccessModal({
  isOpen,
  appointment,
  doctor,
  onBookAnother,
}: BookingSuccessModalProps) {
  if (!isOpen || !appointment) return null;

  const slotInfo = TIME_SLOTS[appointment.time_type as TimeType];

  const formattedDate = (() => {
    try {
      const cleanDate = appointment.date.split("T")[0];
      const [year, month, day] = cleanDate.split("-").map(Number);
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    } catch {
      return appointment.date;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all animate-in zoom-in-95 duration-200">
        {/* Success Header banner */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 ring-4 ring-white/10 animate-in zoom-in-50">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-1">
            Đặt lịch khám thành công!
          </h3>
          <p className="text-teal-100 text-xs sm:text-sm">
            Mã cuộc hẹn: <span className="font-mono font-bold text-white">#{appointment.id}</span>
          </p>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs sm:text-sm">
            {/* Doctor */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-slate-400" />
                <span>Bác sĩ:</span>
              </span>
              <span className="font-semibold text-slate-900 text-right">
                {doctor?.user?.full_name || `Bác sĩ #${appointment.doctor_id}`}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Ngày khám:</span>
              </span>
              <span className="font-semibold text-slate-900 text-right">
                {formattedDate}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Khung giờ:</span>
              </span>
              <span className="font-bold text-teal-700 text-right">
                {slotInfo ? slotInfo.label : appointment.time_type}
              </span>
            </div>

            {/* Patient Name */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>Người khám:</span>
              </span>
              <span className="font-semibold text-slate-900 text-right">
                {appointment.patient_name}
              </span>
            </div>

            {/* Patient Phone */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Điện thoại:</span>
              </span>
              <span className="font-semibold text-slate-900 text-right">
                {appointment.patient_phone}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-xs text-center">
            Trạng thái: <span className="font-bold uppercase tracking-wider">{appointment.status}</span>. Hệ thống đã ghi nhận lịch hẹn của bạn và gửi thông báo xác nhận.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 space-y-2.5">
          <Link
            href="/my-appointments"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-md shadow-teal-700/20 transition-all cursor-pointer"
          >
            <span>Xem danh sách lịch hẹn của tôi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={onBookAnother}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Đặt lịch khác</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

