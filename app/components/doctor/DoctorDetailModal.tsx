"use client";

import React from "react";
import { Doctor } from "@/app/types/Clinic";
import {
  X,
  Stethoscope,
  Award,
  GraduationCap,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  onClose,
}) => {
  if (!doctor) return null;

  const isAvailable = !doctor.deleted_at && doctor.status !== "INACTIVE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-800 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Stethoscope className="w-4 h-4 text-teal-300" />
            <span>Hồ Sơ Chuyên Môn Bác Sĩ</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Profile Summary */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 shadow-sm shrink-0 border-2 border-teal-100">
              {doctor.user.avatar ? (
                <img
                  src={doctor.user.avatar}
                  alt={doctor.user.full_name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-700 font-bold text-2xl">
                  {doctor.user.full_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {isAvailable ? "Đang hoạt động • Sẵn sàng nhận lịch" : "Tạm ngưng tiếp nhận"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {doctor.user.full_name}
              </h2>

              <p className="text-sm font-semibold text-teal-700">
                {doctor.specialty?.name || "Bác sĩ chuyên khoa"}
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
                {doctor.experience_years && (
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-teal-600" />
                    <strong>{doctor.experience_years} năm</strong> kinh nghiệm chuyên môn
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Biography / Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Tiểu sử & Quá trình công tác</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {doctor.description ||
                "Bác sĩ có nhiều năm kinh nghiệm công tác tại các bệnh viện tuyến đầu, chuyên sâu trong chẩn đoán và điều trị các bệnh lý phức tạp."}
            </p>
          </div>

          {/* Qualifications & Degrees */}
          {doctor.qualifications && doctor.qualifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                <span>Bằng cấp & Chứng chỉ chuyên môn</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {doctor.qualifications.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Working Schedule */}
          {doctor.work_schedule && (
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs sm:text-sm text-teal-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                <span><strong>Lịch trực khám:</strong> {doctor.work_schedule}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
