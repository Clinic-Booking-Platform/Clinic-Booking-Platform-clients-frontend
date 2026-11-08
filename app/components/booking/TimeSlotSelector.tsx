"use client";

import React, { useMemo } from "react";
import { 
  Sun, 
  Sunset, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CalendarX2,
  Users
} from "lucide-react";
import { 
  TIME_SLOTS, 
  TimeType, 
  Schedule, 
  isSlotPassedInVN,
  SlotAvailabilityStatus 
} from "@/app/types/schedule";

interface TimeSlotSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  schedules: Schedule[];
  selectedSlot: TimeType | null;
  onSelectSlot: (slot: TimeType) => void;
  isLoading?: boolean;
}

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

export default function TimeSlotSelector({
  selectedDate,
  schedules,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}: TimeSlotSelectorProps) {
  // Map and determine status for all 8 time slots
  const { morningSlots, afternoonSlots, hasAnyAvailableSlot, totalScheduledCount } = useMemo(() => {
    // Ensure safe array handling even if backend returns non-array or null
    const safeSchedules = Array.isArray(schedules) ? schedules : [];
    const morningKeys: TimeType[] = ["T1", "T2", "T3", "T4"];
    const afternoonKeys: TimeType[] = ["T5", "T6", "T7", "T8"];

    const buildSlotItem = (key: TimeType): SlotViewItem => {
      const config = TIME_SLOTS[key];
      const schedule = safeSchedules.find((s) => s.time_type === key);
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

    const morning = morningKeys.map(buildSlotItem);
    const afternoon = afternoonKeys.map(buildSlotItem);

    const hasAnyAvailable = [...morning, ...afternoon].some(
      (s) => s.status === "AVAILABLE"
    );

    const totalScheduled = [...morning, ...afternoon].filter(
      (s) => s.schedule !== undefined
    ).length;

    return {
      morningSlots: morning,
      afternoonSlots: afternoon,
      hasAnyAvailableSlot: hasAnyAvailable,
      totalScheduledCount: totalScheduled,
    };
  }, [selectedDate, schedules]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-5 w-40 bg-slate-200 rounded-md animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-28 bg-slate-200 rounded-md animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-28 bg-slate-200 rounded-md animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[5, 6, 7, 8].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state if doctor has zero schedules for this date
  if (totalScheduledCount === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-10 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 mb-3.5">
          <CalendarX2 className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1">
          Bác sĩ chưa có lịch khám vào ngày này
        </h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
          Bác sĩ không có ca khám trực tuyến trong ngày đã chọn. Quý khách vui lòng chọn ngày khác trên thanh lịch phía trên.
        </p>
      </div>
    );
  }

  // Render an individual time slot card
  const renderSlotCard = (slot: SlotViewItem) => {
    const isSelected = selectedSlot === slot.key;
    const isAvailable = slot.status === "AVAILABLE";
    const isFull = slot.status === "FULL";
    const isPassed = slot.status === "PASSED";
    const isNotScheduled = slot.status === "NOT_SCHEDULED";

    return (
      <button
        key={slot.key}
        type="button"
        disabled={!isAvailable}
        onClick={() => {
          if (isAvailable) {
            onSelectSlot(slot.key);
          }
        }}
        className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 select-none ${
          isSelected
            ? "bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/25 ring-2 ring-teal-600/30 scale-[1.02] cursor-pointer"
            : isAvailable
            ? "bg-white hover:bg-teal-50/70 border-teal-300/80 text-slate-800 hover:border-teal-600 hover:shadow-xs cursor-pointer"
            : isFull
            ? "bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed opacity-80"
            : isPassed
            ? "bg-slate-50 border-slate-200/70 text-slate-400 cursor-not-allowed opacity-60"
            : "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50"
        }`}
      >
        {/* Top-right checkmark when selected */}
        {isSelected && (
          <span className="absolute top-1.5 right-1.5 text-white">
            <CheckCircle2 className="w-4 h-4 fill-white text-teal-700" />
          </span>
        )}

        <div className="flex items-center gap-1.5 mb-1">
          <Clock className={`w-3.5 h-3.5 ${isSelected ? "text-teal-100" : isAvailable ? "text-teal-600" : "text-slate-400"}`} />
          <span className={`text-xs font-bold tracking-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
            {slot.label}
          </span>
        </div>

        {/* Status badges */}
        {isAvailable && (
          <span
            className={`text-[11px] font-medium inline-flex items-center gap-1 ${
              isSelected ? "text-teal-100" : "text-teal-700"
            }`}
          >
            <Users className="w-3 h-3" />
            Còn {slot.remainingSlots} chỗ
          </span>
        )}

        {isFull && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
            Đã kín
          </span>
        )}

        {isPassed && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200/80 text-slate-500">
            Quá giờ
          </span>
        )}

        {isNotScheduled && (
          <span className="text-[10px] text-slate-400 italic">
            Chưa mở
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-6">
      {/* Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Chọn giờ khám
            </h3>
            <p className="text-xs text-slate-500">
              Mỗi ca khám kéo dài 60 phút
            </p>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex items-center flex-wrap gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span>Còn chỗ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>Đã kín</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Quá giờ / Chưa mở</span>
          </div>
        </div>
      </div>

      {/* Morning Section (T1 - T4) */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 tracking-wide uppercase">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Buổi sáng (08:00 - 12:00)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {morningSlots.map(renderSlotCard)}
        </div>
      </div>

      {/* Afternoon Section (T5 - T8) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 tracking-wide uppercase">
          <Sunset className="w-4 h-4 text-orange-500" />
          <span>Buổi chiều (13:00 - 17:00)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {afternoonSlots.map(renderSlotCard)}
        </div>
      </div>

      {/* If day has schedules but all slots are full or passed */}
      {!hasAnyAvailableSlot && totalScheduledCount > 0 && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Tất cả các ca khám trong ngày này đã kín chỗ hoặc đã quá giờ. Quý khách vui lòng chọn một ngày khác.
          </span>
        </div>
      )}
    </div>
  );
}

