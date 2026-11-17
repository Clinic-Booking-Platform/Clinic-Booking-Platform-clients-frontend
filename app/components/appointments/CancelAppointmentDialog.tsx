"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { AppointmentData } from "@/app/types/appointment";
import { TIME_SLOTS, TimeType } from "@/app/types/schedule";

interface CancelAppointmentDialogProps {
  isOpen: boolean;
  appointment: AppointmentData | null;
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelAppointmentDialog({
  isOpen,
  appointment,
  isCancelling,
  onClose,
  onConfirm,
}: CancelAppointmentDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCancelling) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCancelling, onClose]);

  if (!isOpen || !appointment) return null;

  const slotConfig = TIME_SLOTS[appointment.time_type as TimeType];
  const timeLabel = slotConfig
    ? `${appointment.time_type} (${slotConfig.label})`
    : appointment.time_type;

  const formattedDate = (() => {
    try {
      const cleanDate = appointment.date.slice(0, 10);
      const [year, month, day] = cleanDate.split("-").map(Number);
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    } catch {
      return appointment.date.slice(0, 10);
    }
  })();

  const doctorOrPackageName =
    appointment.doctor?.user?.full_name ||
    appointment.package?.name ||
    `Cuộc hẹn #${appointment.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          if (!isCancelling) onClose();
        }}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all animate-in zoom-in-95 duration-200 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Xác nhận hủy lịch hẹn?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
            Bạn có chắc chắn muốn hủy lịch hẹn khám với{" "}
            <strong className="text-slate-900">{doctorOrPackageName}</strong> vào ngày{" "}
            <strong className="text-slate-900">{formattedDate}</strong> - Ca{" "}
            <strong className="text-slate-900">{timeLabel}</strong> không?
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
          Thao tác này sẽ giải phóng ca khám cho bệnh nhân khác và <strong>không thể hoàn tác</strong>.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
          >
            Không, giữ lại
          </button>

          <button
            type="button"
            disabled={isCancelling}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer min-w-[130px]"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang hủy...</span>
              </>
            ) : (
              <span>Xác nhận hủy lịch</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

