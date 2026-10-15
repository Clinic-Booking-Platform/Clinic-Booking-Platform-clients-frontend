"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Doctor } from "@/app/types/Clinic";
import { getDoctors } from "@/app/lib/clinic.api";
import { Stethoscope, Award, Sparkles, UserCheck } from "lucide-react";

export const DoctorSection: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trang chủ: Chỉ lấy ra vài bác sĩ tiêu biểu (tối đa 4 bác sĩ)
    getDoctors()
      .then((res) => {
        if (res && res.length > 0) {
          setDoctors(res.slice(0, 4));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="doctors" className="py-20 bg-slate-50/60 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/60">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Đội Ngũ Chuyên Gia Y Tế</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Bác Sĩ Tiêu Biểu
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Hội tụ các giáo sư, phó giáo sư, tiến sĩ và bác sĩ chuyên khoa II giàu kinh nghiệm, từng giữ vị trí chủ chốt tại các bệnh viện tuyến đầu cả nước.
          </p>
        </div>

        {/* Doctors Grid - Non-interactive text and image only (as specified) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse space-y-4"
              >
                <div className="w-full aspect-[4/5] bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-12 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => {
              const avatar = doctor.user.avatar;
              const name = doctor.user.full_name;
              const specialtyName = doctor.specialty?.name || "Bác sĩ chuyên khoa";
              const description = doctor.description || "Nhiều năm kinh nghiệm thăm khám và điều trị bệnh lý chuyên khoa sâu.";

              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col select-none cursor-default"
                >
                  {/* Doctor Portrait Image (Non-interactive) */}
                  <div className="relative aspect-[4/4.5] overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-teal-700 bg-teal-50">
                        <UserCheck className="w-16 h-16 stroke-[1.2]" />
                        <span className="text-xs font-semibold mt-2">Bác sĩ MediCare</span>
                      </div>
                    )}

                    {/* Specialty overlay badge */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="inline-block px-3 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md text-teal-300 text-xs font-semibold shadow-xs">
                        {specialtyName}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info (Text Only - Non-interactive) */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 uppercase tracking-wider mb-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Chuyên gia hàng đầu</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {description}
                      </p>
                    </div>

                    {/* Informational feature chip */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>Bác sĩ phụ trách chuyên môn</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        Đang công tác
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View all doctors button */}
        <div className="mt-12 text-center">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-teal-600 text-teal-800 text-sm font-semibold hover:bg-teal-50 transition-colors shadow-2xs"
          >
            <span>Xem tất cả danh sách bác sĩ</span>
            <span className="text-teal-600">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
