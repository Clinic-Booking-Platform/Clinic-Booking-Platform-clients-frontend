"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Video, 
  MapPin, 
  Eye, 
  X, 
  Stethoscope, 
  Package, 
  FileText,
  ExternalLink
} from "lucide-react";
import { AppointmentData } from "@/app/types/appointment";
import { TIME_SLOTS, TimeType } from "@/app/types/schedule";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

interface AppointmentCardProps {
  appointment: AppointmentData;
  onViewDetail?: (id: number) => void;
  onRequestCancel: (appointment: AppointmentData) => void;
}

export default function AppointmentCard({
  appointment,
  onViewDetail,
  onRequestCancel,
}: AppointmentCardProps) {
  // Time Slot config
  const slotConfig = TIME_SLOTS[appointment.time_type as TimeType];
  const timeLabel = slotConfig
    ? `${appointment.time_type} (${slotConfig.label})`
    : appointment.time_type;

  // Format date display (e.g. "Thứ Hai, 08/11/2026")
  const formattedDate = (() => {
    try {
      const cleanDate = appointment.date.slice(0, 10);
      const [year, month, day] = cleanDate.split("-").map(Number);
      const d = new Date(Date.UTC(year, month - 1, day));
      const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const dayOfWeek = days[d.getUTCDay()];
      return `${dayOfWeek}, ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    } catch {
      return appointment.date.slice(0, 10);
    }
  })();

  const isOnline = appointment.appointment_type === "ONLINE";
  const isPending = appointment.status === "PENDING";
  const canJoinMeeting =
    isOnline &&
    appointment.status === "CONFIRMED" &&
    Boolean(appointment.meeting_link);

  const titleName =
    appointment.doctor?.user?.full_name ||
    appointment.package?.name ||
    `Cuộc hẹn #${appointment.id}`;

  const subtitle =
    appointment.doctor?.specialty?.name ||
    (appointment.package ? "Gói khám sức khỏe toàn diện" : "Khám chuyên khoa");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-teal-200 hover:shadow-md transition-all space-y-4">
      {/* Top row: Badges & ID */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Appointment Type Badge */}
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
              <Video className="w-3.5 h-3.5 text-sky-600" />
              <span>Tư vấn trực tuyến</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-teal-700" />
              <span>Khám tại phòng khám</span>
            </span>
          )}

          <span className="text-xs font-mono font-medium text-slate-400">
            #{appointment.id}
          </span>
        </div>

        {/* Status Badge */}
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      {/* Main Card Body */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Doctor or Package Header Info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="relative w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 overflow-hidden shadow-2xs">
            {appointment.doctor?.user?.avatar ? (
              <Image
                src={appointment.doctor.user.avatar}
                alt={titleName}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            ) : appointment.package ? (
              <Package className="w-6 h-6 text-teal-600" />
            ) : (
              <Stethoscope className="w-6 h-6 text-teal-600" />
            )}
          </div>

          <div className="space-y-0.5 min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {titleName}
            </h3>
            <p className="text-xs font-medium text-slate-500 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Date & Time Highlights */}
        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 sm:gap-1 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-teal-700">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{timeLabel}</span>
          </div>
        </div>
      </div>

      {/* Patient & Symptoms summary */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            Người khám: <strong className="text-slate-800">{appointment.patient_name}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            SĐT: <strong className="text-slate-800">{appointment.patient_phone}</strong>
          </span>
        </div>
        {appointment.symptoms && (
          <div className="sm:col-span-2 flex items-start gap-2 pt-1 border-t border-slate-200/50">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="line-clamp-1 text-slate-600">
              Lý do khám: {appointment.symptoms}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions Row */}
      <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Join Online Meeting Button */}
          {canJoinMeeting && (
            <a
              href={appointment.meeting_link!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs shadow-teal-700/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Vào phòng khám Online</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Cancel Button (Only if PENDING) */}
          {isPending && (
            <button
              type="button"
              onClick={() => onRequestCancel(appointment)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-medium hover:border-rose-300 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hủy hẹn</span>
            </button>
          )}

          {/* View Details Link */}
          <Link
            href={`/my-appointments/${appointment.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold hover:border-teal-300 hover:text-teal-700 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Xem chi tiết</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

