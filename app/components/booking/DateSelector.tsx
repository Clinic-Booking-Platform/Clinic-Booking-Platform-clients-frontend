"use client";

import React, { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export interface DateItem {
  dateStr: string; // "YYYY-MM-DD"
  dayOfWeek: string;
  dayNumber: string;
  monthNumber: string;
  fullFormatted: string;
  isToday: boolean;
}

interface DateSelectorProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (dateStr: string) => void;
  daysCount?: number; // 7 to 14 days, default 14
}

const VI_DAYS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

export default function DateSelector({
  selectedDate,
  onSelectDate,
  daysCount = 14,
}: DateSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate 14 upcoming days starting from Vietnam's current date
  const dateList: DateItem[] = useMemo(() => {
    const list: DateItem[] = [];
    const now = new Date();

    // Get current date string in VN timezone
    const vnFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const todayStr = vnFormatter.format(now);
    const [tYear, tMonth, tDay] = todayStr.split("-").map(Number);

    // Anchor base date at midnight UTC of today in VN
    const baseDate = new Date(Date.UTC(tYear, tMonth - 1, tDay));

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(baseDate);
      d.setUTCDate(baseDate.getUTCDate() + i);

      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const dayOfWeekIndex = d.getUTCDay();
      let dayOfWeek = VI_DAYS[dayOfWeekIndex];

      if (i === 0) {
        dayOfWeek = "Hôm nay";
      } else if (i === 1) {
        dayOfWeek = "Ngày mai";
      }

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
  }, [daysCount]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const selectedDateItem = dateList.find((d) => d.dateStr === selectedDate);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
      {/* Header section with selected date text & navigation buttons */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <CalendarIcon className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Chọn ngày khám
            </h3>
            <p className="text-xs text-slate-500">
              {selectedDateItem
                ? selectedDateItem.fullFormatted
                : "Vui lòng chọn ngày"}
            </p>
          </div>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Cuộn sang trái"
            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-600 hover:text-teal-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Cuộn sang phải"
            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-600 hover:text-teal-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Date Items */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth snap-x snap-mandatory focus:outline-hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dateList.map((item) => {
          const isSelected = item.dateStr === selectedDate;

          return (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => onSelectDate(item.dateStr)}
              className={`snap-start shrink-0 min-w-[76px] sm:min-w-[84px] py-2.5 px-2 rounded-xl text-center border transition-all duration-200 cursor-pointer select-none flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/25 ring-2 ring-teal-700/20 scale-[1.02]"
                  : "bg-slate-50/70 hover:bg-teal-50/60 text-slate-700 border-slate-200/80 hover:border-teal-200"
              }`}
            >
              <span
                className={`text-[11px] font-semibold tracking-tight ${
                  isSelected
                    ? "text-teal-100"
                    : item.isToday
                    ? "text-teal-700"
                    : "text-slate-500"
                }`}
              >
                {item.dayOfWeek}
              </span>

              <span
                className={`text-lg sm:text-xl font-bold my-0.5 ${
                  isSelected ? "text-white" : "text-slate-900"
                }`}
              >
                {item.dayNumber}
              </span>

              <span
                className={`text-[10px] uppercase tracking-wider font-medium ${
                  isSelected ? "text-teal-100" : "text-slate-400"
                }`}
              >
                Th{item.monthNumber}
              </span>

              {item.isToday && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

