"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Stethoscope, 
  MapPin, 
  BadgeCheck, 
  ArrowLeftRight, 
  CreditCard,
  Building2,
  CalendarCheck2
} from "lucide-react";
import { DoctorDetail } from "@/app/types/Doctor";

interface DoctorSummaryCardProps {
  doctor: DoctorDetail | null;
  isLoading?: boolean;
  onChangeDoctor?: () => void;
}

export default function DoctorSummaryCard({
  doctor,
  isLoading = false,
  onChangeDoctor,
}: DoctorSummaryCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2.5 w-full">
            <div className="h-4 w-28 bg-slate-200 rounded-full" />
            <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-slate-200 rounded-md" />
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(doctor.price) || 0);

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-teal-100 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.08)] p-5 transition-all">
      {/* Decorative top accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Avatar & Info */}
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Avatar with fallback */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-teal-50 border border-teal-100 shrink-0 shadow-xs">
            {doctor.user?.avatar ? (
              <Image
                src={doctor.user.avatar}
                alt={doctor.user.full_name || "Bác sĩ"}
                fill
                sizes="88px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-teal-700 bg-teal-50 font-semibold text-xl">
                <Stethoscope className="w-8 h-8 mb-0.5 text-teal-600" />
                <span className="text-xs font-medium">Bác sĩ</span>
              </div>
            )}
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Đang sẵn sàng tiếp nhận lịch" />
          </div>

          {/* Details */}
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200/60">
              <BadgeCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{doctor.specialty?.name || "Bác sĩ Chuyên khoa"}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {doctor.user?.full_name || "Bác sĩ Chuyên khoa"}
            </h2>

            {doctor.clinic_name && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.clinic_name}</span>
              </div>
            )}

            {doctor.clinic_address && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="line-clamp-1">{doctor.clinic_address}</span>
              </div>
            )}

            {doctor.description && (
              <p className="text-xs text-slate-600 line-clamp-2 pt-0.5 max-w-xl">
                {doctor.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Price & Change Doctor button */}
        <div className="flex md:flex-col items-center md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0 gap-3">
          <div className="md:text-right">
            <span className="text-xs font-medium text-slate-500 block">
              Phí khám tư vấn
            </span>
            <div className="inline-flex items-baseline gap-1 text-teal-800 font-extrabold text-lg sm:text-xl">
              <span>{formattedPrice}</span>
              <span className="text-xs font-normal text-slate-500">/ lượt</span>
            </div>
          </div>

          {onChangeDoctor ? (
            <button
              type="button"
              onClick={onChangeDoctor}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-teal-50/80 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-200 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
              <span>Đổi bác sĩ</span>
            </button>
          ) : (
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-teal-50/80 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-200 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
              <span>Đổi bác sĩ</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

