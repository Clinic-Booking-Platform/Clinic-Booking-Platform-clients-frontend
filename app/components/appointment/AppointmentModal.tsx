"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "@/app/store/CartStore";
import { userStore } from "@/app/store/AuthStore";
import { Doctor, TIME_SLOTS } from "@/app/types/Clinic";
import { getDoctors, createAppointmentAPI } from "@/app/lib/clinic.api";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Sparkles,
  MapPin,
  CalendarCheck,
} from "lucide-react";

export const AppointmentModal: React.FC = () => {
  const {
    isAppointmentModalOpen,
    closeAppointmentModal,
    selectedPackage,
    items,
  } = useCartStore();

  const currentUser = userStore((state) => state.user);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Form states
  const [selectedPkgId, setSelectedPkgId] = useState<number>(0);
  const [doctorId, setDoctorId] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [timeType, setTimeType] = useState<string>("T1");
  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");

  // Get tomorrow's date or today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  // Load doctors and populate defaults when modal opens
  useEffect(() => {
    if (isAppointmentModalOpen) {
      setBookingSuccess(null);
      setErrorMsg(null);

      // Pre-fill patient info if logged in
      if (currentUser) {
        setPatientName(currentUser.full_name || "");
        setPatientPhone(currentUser.phone_number || "");
      }

      // Default date to today or tomorrow
      if (!date) {
        setDate(todayStr);
      }

      // Set initial selected package from store or first item in cart
      if (selectedPackage) {
        setSelectedPkgId(selectedPackage.id);
      } else if (items.length > 0) {
        setSelectedPkgId(items[0].package_id);
      }

      // Load doctors list
      setLoadingDoctors(true);
      getDoctors()
        .then((docList) => {
          setDoctors(docList);
          if (docList.length > 0 && doctorId === 0) {
            setDoctorId(docList[0].id);
          }
        })
        .finally(() => setLoadingDoctors(false));
    }
  }, [isAppointmentModalOpen, selectedPackage, items, currentUser]);

  if (!isAppointmentModalOpen) return null;

  // Selected package details
  const activePackage =
    items.find((i) => i.package_id === selectedPkgId)?.package ||
    selectedPackage ||
    (items.length > 0 ? items[0].package : null);

  const selectedDoctorObj = doctors.find((d) => d.id === doctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic client validations
    if (!patientName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên bệnh nhân.");
      return;
    }
    if (!patientPhone.trim() || !/^0[0-9]{9}$/.test(patientPhone.trim())) {
      setErrorMsg("Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số (VD: 0901234567).");
      return;
    }
    if (!doctorId) {
      setErrorMsg("Vui lòng chọn bác sĩ phụ trách.");
      return;
    }
    if (!date) {
      setErrorMsg("Vui lòng chọn ngày khám.");
      return;
    }
    if (date < todayStr) {
      setErrorMsg("Ngày khám không được trong quá khứ.");
      return;
    }
    if (!timeType) {
      setErrorMsg("Vui lòng chọn ca khám.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createAppointmentAPI({
        doctor_id: doctorId,
        date,
        time_type: timeType,
        patient_name: patientName.trim(),
        patient_phone: patientPhone.trim(),
        symptoms: symptoms.trim() || undefined,
        package_id: selectedPkgId || undefined,
      });

      setBookingSuccess({
        appointmentId: res?.data?.id || `APT-${Math.floor(100000 + Math.random() * 900000)}`,
        doctorName: selectedDoctorObj?.user?.full_name || "Bác sĩ chuyên khoa",
        specialty: selectedDoctorObj?.specialty?.name || "Đa khoa",
        date,
        timeSlot: TIME_SLOTS.find((s) => s.key === timeType)?.label || timeType,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        packageName: activePackage?.name || "Khám tư vấn",
      });
    } catch (err: any) {
      // If error from backend, show message
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể đặt lịch khám lúc này. Vui lòng thử lại hoặc đăng nhập trước khi đặt.";
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-800 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-teal-200 border border-white/10">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Đặt lịch hẹn khám</h3>
              <p className="text-xs text-teal-100/90">
                Phòng khám Quốc tế MediCare - Chu đáo, Tận tâm, Nhanh chóng
              </p>
            </div>
          </div>
          <button
            onClick={closeAppointmentModal}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {bookingSuccess ? (
            /* Success View */
            <div className="text-center py-6 px-2 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800">
                  Đặt lịch hẹn thành công!
                </h4>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Cảm ơn bạn đã tin tưởng dịch vụ của MediCare. Chúng tôi đã ghi nhận lịch hẹn và gửi tin nhắn xác nhận.
                </p>
              </div>

              {/* Appointment Ticket Card */}
              <div className="bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-2xl p-5 border border-teal-100/80 text-left space-y-3 max-w-lg mx-auto shadow-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                    Phiếu xác nhận cuộc hẹn
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                    #{bookingSuccess.appointmentId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Bệnh nhân:</span>
                    <strong className="text-slate-800">{bookingSuccess.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Số điện thoại:</span>
                    <strong className="text-slate-800 font-mono">{bookingSuccess.patientPhone}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Gói khám:</span>
                    <strong className="text-teal-700">{bookingSuccess.packageName}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Bác sĩ tiếp nhận:</span>
                    <strong className="text-slate-800">{bookingSuccess.doctorName}</strong>
                    <span className="text-xs text-slate-500 block">{bookingSuccess.specialty}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Ngày khám:</span>
                    <strong className="text-slate-800">{bookingSuccess.date}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Khung giờ:</span>
                    <strong className="text-slate-800 text-teal-700">{bookingSuccess.timeSlot}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Địa chỉ phòng khám: Tầng 3, Tòa nhà Y Tế MediCare, Số 123 Đường Sức Khỏe, Quận 1, TP.HCM</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={closeAppointmentModal}
                  className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Gói khám đã chọn từ giỏ hàng */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>1. Gói khám đăng ký</span>
                  <span className="text-[11px] text-teal-700 font-normal">
                    (Chọn từ các gói có trong giỏ hàng)
                  </span>
                </label>
                {items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((it) => {
                      const isSelected = selectedPkgId === it.package_id;
                      return (
                        <div
                          key={it.package_id}
                          onClick={() => setSelectedPkgId(it.package_id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected
                              ? "border-teal-600 bg-teal-50/60 shadow-xs ring-1 ring-teal-600"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-teal-100/70 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {isSelected ? <CheckCircle2 className="w-5 h-5 text-teal-700" /> : <Stethoscope className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-semibold text-slate-800 truncate">
                              {it.package.name}
                            </h5>
                            <span className="text-xs text-teal-700 font-bold">
                              {Number(it.package.discount_price ?? it.package.price).toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Chưa có gói khám trong giỏ hàng. Lịch hẹn sẽ được đặt theo hình thức Khám Tổng Quát.</span>
                  </div>
                )}
              </div>

              {/* 2. Chọn Bác sĩ phụ trách */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  2. Chọn Bác sĩ thăm khám <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {loadingDoctors ? (
                    <div className="col-span-2 py-4 text-center text-xs text-slate-400">
                      Đang tải danh sách bác sĩ...
                    </div>
                  ) : (
                    doctors.map((doc) => {
                      const isSelected = doctorId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setDoctorId(doc.id)}
                          className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? "border-teal-600 bg-teal-50/70 ring-1 ring-teal-600"
                              : "border-slate-100 hover:border-slate-200 bg-white"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                            {doc.user.avatar ? (
                              <img
                                src={doc.user.avatar}
                                alt={doc.user.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-teal-700 font-bold text-xs bg-teal-100">
                                {doc.user.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h6 className="text-xs font-bold text-slate-800 truncate">
                              {doc.user.full_name}
                            </h6>
                            <p className="text-[11px] text-teal-700 truncate">
                              {doc.specialty?.name || "Bác sĩ chuyên khoa"}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 3. Ngày khám & Ca khám */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ngày khám <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ca khám trong ngày <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    value={timeType}
                    onChange={(e) => setTimeType(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all bg-white"
                  >
                    <optgroup label="Buổi Sáng (08:00 - 12:00)">
                      {TIME_SLOTS.filter((s) => s.period === "morning").map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.key} ({s.label})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Buổi Chiều (13:00 - 17:00)">
                      {TIME_SLOTS.filter((s) => s.period === "afternoon").map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.key} ({s.label})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* 4. Thông tin người khám */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  4. Thông tin người bệnh
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Họ và tên bệnh nhân <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>Số điện thoại <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0901234567"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      required
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Triệu chứng hoặc nhu cầu thăm khám (Tùy chọn)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả sơ lược triệu chứng, tiền sử dị ứng thuốc hoặc mong muốn của bạn..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAppointmentModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-medium shadow-md shadow-teal-700/20 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang xử lý đặt lịch...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận đặt lịch hẹn</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
