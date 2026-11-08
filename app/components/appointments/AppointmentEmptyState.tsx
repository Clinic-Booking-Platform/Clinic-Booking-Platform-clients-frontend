"use client";

import React from "react";
import Link from "next/link";
import { CalendarX, PlusCircle, RotateCcw } from "lucide-react";

interface AppointmentEmptyStateProps {
  currentStatus?: string;
  onResetFilter?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

export default function AppointmentEmptyState({
  currentStatus = "ALL",
  onResetFilter,
}: AppointmentEmptyStateProps) {
  const isFiltered = currentStatus !== "ALL" && !!STATUS_LABELS[currentStatus];
  const filterLabel = STATUS_LABELS[currentStatus] || currentStatus;

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs max-w-xl mx-auto my-6">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-inner">
        <CalendarX className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
        {isFiltered
          ? `Không có lịch hẹn "${filterLabel}"`
          : "Chưa có lịch hẹn khám nào"}
      </h3>

      <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-md">
        {isFiltered
          ? `Hiện tại bạn không có lịch hẹn nào ở trạng thái ${filterLabel.toLowerCase()}. Bạn có thể chuyển sang trạng thái khác hoặc đặt lịch khám mới.`
          : "Bạn chưa có lịch hẹn khám nào được ghi nhận trên hệ thống. Hãy chủ động đặt lịch với các bác sĩ chuyên khoa đầu ngành để được chăm sóc sức khỏe tốt nhất."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isFiltered && onResetFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            Xem tất cả
          </button>
        )}

        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-semibold shadow-sm hover:shadow-teal-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Đặt lịch khám ngay
        </Link>
      </div>
    </div>
  );
}

