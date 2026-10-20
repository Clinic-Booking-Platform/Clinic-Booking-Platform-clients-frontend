"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Doctor } from "@/app/types/Clinic";
import { getDoctors } from "@/app/lib/clinic.api";
import { DoctorDetailModal } from "@/app/components/doctor/DoctorDetailModal";
import { Pagination } from "@/app/components/common/Pagination";
import {
  Stethoscope,
  Award,
  Search,
  Sparkles,
  UserCheck,
  ShieldCheck,
  Building2,
  GraduationCap,
  Eye,
  CalendarCheck,
} from "lucide-react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  useEffect(() => {
    // Lấy danh sách tất cả các bác sĩ
    getDoctors()
      .then((res) => {
        if (res && res.length > 0) {
          setDoctors(res);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Reset page to 1 when search or specialty changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialty]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const name = doc.user.full_name.toLowerCase();
      const specialty = doc.specialty?.name?.toLowerCase() || "";
      const desc = doc.description?.toLowerCase() || "";
      const term = searchTerm.toLowerCase();

      const matchSearch =
        name.includes(term) || specialty.includes(term) || desc.includes(term);

      const matchSpecialty =
        selectedSpecialty === "all" ||
        (doc.specialty?.name &&
          doc.specialty.name.toLowerCase().includes(selectedSpecialty.toLowerCase()));

      return matchSearch && matchSpecialty;
    });
  }, [doctors, searchTerm, selectedSpecialty]);

  // Paginated items
  const totalPages = Math.ceil(filteredDoctors.length / pageSize) || 1;
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDoctors.slice(start, start + pageSize);
  }, [filteredDoctors, currentPage, pageSize]);

  return (
    <>
      <div className="min-h-screen bg-slate-50/60 pb-24">
        {/* Page Hero Header */}
        <div className="bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-16 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold backdrop-blur-xs">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>Đội Ngũ Chuyên Gia Y Khoa</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Đội Ngũ Bác Sĩ
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Danh sách đầy đủ các bác sĩ chuyên khoa giàu kinh nghiệm, tận tâm và chuyên nghiệp. Nhấp vào hồ sơ để xem chi tiết quá trình đào tạo và lịch khám của từng bác sĩ.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-4 sm:p-5 flex flex-col md:flex-row items-center gap-4 justify-between">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ theo họ tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
              />
            </div>

            {/* Specialty Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {(() => {
                const specMap = new Map<string, string>();
                doctors.forEach((d) => {
                  if (d.specialty?.name) {
                    specMap.set(d.specialty.name.toLowerCase(), d.specialty.name);
                  }
                });
                const tabs = [
                  { id: "all", label: "Tất cả chuyên khoa" },
                  ...Array.from(specMap.entries()).map(([id, label]) => ({ id, label })),
                ];
                return tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedSpecialty(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      selectedSpecialty === tab.id
                        ? "bg-teal-700 text-white shadow-xs font-semibold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    {tab.label}
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Doctors Grid - Shows all doctors with status and view detail action */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse space-y-4"
                >
                  <div className="w-full aspect-[4/5] bg-slate-200 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-16 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-4">
                <UserCheck className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Không tìm thấy bác sĩ phù hợp
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc chuyên khoa.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialty("all");
                }}
                className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
              >
                Xem tất cả bác sĩ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedDoctors.map((doctor) => {
                const avatar = doctor.user.avatar;
                const name = doctor.user.full_name;
                const specialtyName = doctor.specialty?.name || "Bác sĩ chuyên khoa";
                const description =
                  doctor.description ||
                  "Nhiều năm kinh nghiệm thăm khám và điều trị bệnh lý chuyên khoa sâu.";
                const isAvailable = !doctor.deleted_at && doctor.status !== "INACTIVE";

                return (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Doctor Portrait Image */}
                      <div className="relative aspect-[4/4] overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-teal-700 bg-teal-50">
                            <UserCheck className="w-16 h-16 stroke-[1.2]" />
                            <span className="text-xs font-semibold mt-2">Bác sĩ MediCare</span>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs ${
                              isAvailable
                                ? "bg-emerald-500/90 text-white"
                                : "bg-slate-700/90 text-slate-200"
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span>{isAvailable ? "Đang hoạt động" : "Tạm nghỉ"}</span>
                          </span>
                        </div>

                        {/* Specialty Badge */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="inline-block px-3 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md text-teal-300 text-xs font-semibold shadow-xs">
                            {specialtyName}
                          </span>
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="p-6 space-y-3">
                        <div>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 uppercase tracking-wider mb-1">
                            <Award className="w-3.5 h-3.5" />
                            <span>Học vị & Chuyên khoa</span>
                          </div>
                          <h2 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                            {name}
                          </h2>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                          {description}
                        </p>

                        {/* Quick Highlights */}
                        <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                          {doctor.experience_years && (
                            <div className="flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span>{doctor.experience_years} năm kinh nghiệm lâm sàng</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>Trực tiếp hội chẩn & thăm khám</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions: Button to View Doctor Details (No price, no direct booking) */}
                    <div className="p-6 pt-0">
                      <div className="pt-3 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedDoctor(doctor)}
                          className="w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-teal-200/60 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-4 h-4 text-teal-700" />
                          <span>Xem chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDoctors.length}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 350, behavior: "smooth" });
            }}
            itemName="bác sĩ"
          />
        </div>

        {/* Medical Ethics Pledge */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 flex flex-col md:flex-row items-center gap-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div className="space-y-2 text-center md:text-left flex-1">
              <h3 className="text-xl font-bold text-slate-900">
                Cam Kết Chuẩn Mực Y Đức & Chuyên Môn
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Mọi quyết định chẩn đoán và chỉ định điều trị tại MediCare đều dựa trên bằng chứng y học thực nghiệm (Evidence-Based Medicine), tôn trọng sự an toàn và lợi ích cao nhất của người bệnh.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Detail Modal */}
      <DoctorDetailModal
        doctor={selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
      />
    </>
  );
}
