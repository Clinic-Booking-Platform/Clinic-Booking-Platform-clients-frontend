"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Phone, 
  FileText, 
  AlertCircle, 
  UserCheck, 
  Users2,
  Info
} from "lucide-react";
import { User as AuthUser } from "@/app/store/AuthStore";

export interface PatientFormData {
  patient_name: string;
  patient_phone: string;
  symptoms: string;
}

export interface PatientFormErrors {
  patient_name?: string;
  patient_phone?: string;
  symptoms?: string;
}

interface PatientInfoFormProps {
  currentUser: AuthUser | null;
  formData: PatientFormData;
  formErrors: PatientFormErrors;
  onChange: (field: keyof PatientFormData, value: string) => void;
  onClearError: (field: keyof PatientFormErrors) => void;
  isMounted?: boolean;
}

export default function PatientInfoForm({
  currentUser,
  formData,
  formErrors,
  onChange,
  onClearError,
  isMounted: isMountedProp,
}: PatientInfoFormProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [bookingFor, setBookingFor] = useState<"self" | "relative">("self");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const mounted = isMountedProp !== undefined ? isMountedProp : hasMounted;

  const handleSelectBookingFor = (type: "self" | "relative") => {
    setBookingFor(type);
    if (type === "self" && currentUser) {
      onChange("patient_name", currentUser.full_name || "");
      onChange("patient_phone", currentUser.phone_number || "");
      onClearError("patient_name");
      onClearError("patient_phone");
    } else if (type === "relative") {
      // Clear for relative input
      onChange("patient_name", "");
      onChange("patient_phone", "");
    }
  };

  const handleChange = (
    field: keyof PatientFormData,
    value: string
  ) => {
    onChange(field, value);
    if (formErrors[field]) {
      onClearError(field);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <User className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Thông tin người khám
            </h3>
            <p className="text-xs text-slate-500">
              Thông tin này sẽ được gửi tới bác sĩ phụ trách ca khám
            </p>
          </div>
        </div>

        {/* Toggle: Book for self vs relative (only render after mount to avoid hydration mismatch with localStorage) */}
        {mounted && currentUser && (
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => handleSelectBookingFor("self")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                bookingFor === "self"
                  ? "bg-white text-teal-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Cho bản thân</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectBookingFor("relative")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                bookingFor === "relative"
                  ? "bg-white text-teal-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Cho người thân</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Patient Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Họ và tên người khám <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={formData.patient_name}
              onChange={(e) => handleChange("patient_name", e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              maxLength={255}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                formErrors.patient_name
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-teal-600/20"
              }`}
            />
          </div>
          {formErrors.patient_name && (
            <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formErrors.patient_name}</span>
            </p>
          )}
        </div>

        {/* Patient Phone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Số điện thoại liên hệ <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={formData.patient_phone}
              onChange={(e) => handleChange("patient_phone", e.target.value)}
              placeholder="VD: 0912345678"
              maxLength={10}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                formErrors.patient_phone
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-teal-600/20"
              }`}
            />
          </div>
          {formErrors.patient_phone && (
            <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formErrors.patient_phone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Symptoms / Reason for visit */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            Mô tả triệu chứng / Lý do khám{" "}
            <span className="text-slate-400 font-normal">(Tùy chọn)</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {formData.symptoms.length}/2000
          </span>
        </div>
        <div className="relative">
          <textarea
            value={formData.symptoms}
            onChange={(e) => handleChange("symptoms", e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Mô tả cụ thể triệu chứng, thời gian xuất hiện, tiền sử dị ứng thuốc (nếu có) để bác sĩ chuẩn bị tốt nhất..."
            className={`w-full p-3.5 rounded-xl border text-sm transition-all bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 resize-y min-h-[90px] ${
              formErrors.symptoms
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-teal-600/20"
            }`}
          />
        </div>
        {formErrors.symptoms && (
          <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{formErrors.symptoms}</span>
          </p>
        )}
      </div>

      {/* Helpful Hint */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-teal-50/60 border border-teal-100 text-teal-800 text-xs">
        <Info className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
        <p className="text-teal-900/80 leading-relaxed">
          Thông tin liên lạc chính xác giúp phòng khám gửi mã số khám bệnh và liên hệ hỗ trợ bạn kịp thời khi có thay đổi.
        </p>
      </div>
    </div>
  );
}

