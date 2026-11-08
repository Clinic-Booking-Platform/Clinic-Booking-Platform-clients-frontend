"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Video, 
  ExternalLink, 
  Stethoscope, 
  Package, 
  FileText, 
  Pill, 
  CreditCard, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Receipt
} from "lucide-react";
import { AppointmentDetail } from "@/app/types/appointment";
import { getAppointmentDetail } from "@/app/lib/appointment.api";
import { TIME_SLOTS, TimeType } from "@/app/types/schedule";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  appointmentId: number | null;
  onClose: () => void;
}

export default function AppointmentDetailModal({
  isOpen,
  appointmentId,
  onClose,
}: AppointmentDetailModalProps) {
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch detail whenever modal opens
  useEffect(() => {
    if (!isOpen || !appointmentId) {
      setDetail(null);
      return;
    }

    let isSubscribed = true;
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAppointmentDetail(appointmentId);
        if (isSubscribed) {
          setDetail(data);
        }
      } catch (err: unknown) {
        if (isSubscribed) {
          setError("Không thể tải thông tin chi tiết cuộc hẹn. Vui lòng thử lại sau.");
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, appointmentId]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all animate-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Chi tiết lịch hẹn</span>
                {detail && (
                  <span className="text-xs font-mono font-medium text-slate-500">
                    #{detail.id}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Thông tin hồ sơ và kết quả khám bệnh
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">
                Đang tải dữ liệu chi tiết cuộc hẹn...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-rose-700 font-medium">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          ) : detail ? (
            <>
              {/* Status and Type Header */}
              <div className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Trạng thái:
                  </span>
                  <AppointmentStatusBadge status={detail.status} />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Hình thức:
                  </span>
                  {isOnline ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/70">
                      <Video className="w-3.5 h-3.5 text-sky-600" />
                      <span>Tư vấn trực tuyến</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-teal-700" />
                      <span>Khám tại phòng khám</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Online Meeting Banner if Confirmed */}
              {canJoinMeeting && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-teal-950">
                        Phòng khám Online đã sẵn sàng!
                      </h4>
                      <p className="text-xs text-teal-800">
                        Nhấp nút bên dưới để tham gia phòng tư vấn video call với bác sĩ.
                      </p>
                    </div>
                  </div>
                  <a
                    href={detail.meeting_link!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition-all shrink-0 cursor-pointer"
                  >
                    <span>Vào phòng khám ngay</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Doctor Details */}
              {detail.doctor && (
                <div className="p-4 rounded-2xl bg-white border border-teal-100/90 shadow-2xs space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Bác sĩ phụ trách</span>
                  </div>

                  <div className="flex items-start sm:items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 overflow-hidden">
                      {detail.doctor.user?.avatar ? (
                        <Image
                          src={detail.doctor.user.avatar}
                          alt={detail.doctor.user.full_name || "Bác sĩ"}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Stethoscope className="w-7 h-7 text-teal-600" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {detail.doctor.user?.full_name}
                      </h4>
                      <p className="text-xs font-semibold text-teal-700">
                        Chuyên khoa: {detail.doctor.specialty?.name || "Đa khoa"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                        {detail.doctor.user?.phone_number && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {detail.doctor.user.phone_number}
                          </span>
                        )}
                        {detail.doctor.user?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {detail.doctor.user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Package Details if Booked via Package */}
              {detail.package && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-teal-600" />
                    <span>Gói khám đã mua</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {detail.package.name}
                      </h4>
                      {detail.order?.order_code && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Receipt className="w-3 h-3 text-slate-400" />
                          <span>Mã đơn: {detail.order.order_code}</span>
                        </p>
                      )}
                    </div>
                    {detail.package.price && (
                      <span className="text-sm font-extrabold text-teal-800">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(detail.package.price)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Appointment Schedule & Patient Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs sm:text-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Thời gian & Người khám</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-xs">Ngày khám:</span>
                    <strong className="text-slate-900">{formattedDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Khung giờ:</span>
                    <strong className="text-teal-700">{timeLabel}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Bệnh nhân:</span>
                    <strong className="text-slate-900">{detail.patient_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Số điện thoại:</span>
                    <strong className="text-slate-900">{detail.patient_phone}</strong>
                  </div>
                </div>

                {detail.symptoms && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500 block text-xs mb-1">
                      Mô tả triệu chứng / Lý do khám:
                    </span>
                    <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200/70 text-xs leading-relaxed">
                      {detail.symptoms}
                    </p>
                  </div>
                )}
              </div>

              {/* Medical Record & Prescriptions (If COMPLETED) */}
              {detail.medical_record && (
                <div className="p-4.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Kết quả chẩn đoán y khoa & Bệnh án</span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-emerald-900/70 block text-xs font-medium">
                        Chẩn đoán:
                      </span>
                      <p className="font-bold text-emerald-950 mt-0.5">
                        {detail.medical_record.diagnosis}
                      </p>
                    </div>

                    {detail.medical_record.treatment && (
                      <div>
                        <span className="text-emerald-900/70 block text-xs font-medium">
                          Phác đồ điều trị / Lời dặn:
                        </span>
                        <p className="text-emerald-900 mt-0.5 leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-100">
                          {detail.medical_record.treatment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Prescriptions Table */}
                  {detail.medical_record.prescriptions &&
                    detail.medical_record.prescriptions.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <Pill className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đơn thuốc chỉ định ({detail.medical_record.prescriptions.length} loại thuốc)</span>
                        </div>

                        {/* Mobile Scrollable Table */}
                        <div className="overflow-x-auto rounded-xl border border-emerald-200 bg-white shadow-2xs">
                          <table className="w-full text-left text-xs min-w-[460px]">
                            <thead className="bg-emerald-100/60 text-emerald-900 font-bold border-b border-emerald-200">
                              <tr>
                                <th className="p-2.5">Tên thuốc</th>
                                <th className="p-2.5">Liều dùng</th>
                                <th className="p-2.5">Cách dùng / Tần suất</th>
                                <th className="p-2.5">Thời gian</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-100 text-slate-700">
                              {detail.medical_record.prescriptions.map((p, idx) => (
                                <tr key={p.id || idx} className="hover:bg-emerald-50/40">
                                  <td className="p-2.5 font-semibold text-slate-900">
                                    {p.medicine_name}
                                  </td>
                                  <td className="p-2.5">{p.dosage}</td>
                                  <td className="p-2.5">{p.frequency}</td>
                                  <td className="p-2.5 font-medium text-emerald-800">
                                    {p.duration}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

