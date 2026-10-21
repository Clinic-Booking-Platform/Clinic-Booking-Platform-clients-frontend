"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Article } from "@/app/types/Clinic";
import { getArticles } from "@/app/lib/clinic.api";
import { Pagination } from "@/app/components/common/Pagination";
import {
  BookOpen,
  Calendar,
  Eye,
  Search,
  ArrowRight,
  Sparkles,
  User,
  HeartPulse,
} from "lucide-react";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  useEffect(() => {
    getArticles()
      .then((res) => {
        if (res && res.length > 0) {
          setArticles(res);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Reset page to 1 when search or specialty changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialty]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchSearch =
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (art.short_description &&
          art.short_description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSpecialty =
        selectedSpecialty === "all" ||
        (art.specialty?.name &&
          art.specialty.name.toLowerCase().includes(selectedSpecialty.toLowerCase()));

      return matchSearch && matchSpecialty;
    });
  }, [articles, searchTerm, selectedSpecialty]);

  // Paginated items
  const totalPages = Math.ceil(filteredArticles.length / pageSize) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-b from-teal-900 to-teal-800 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold border border-teal-700">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Thư Viện Kiến Thức Y Khoa</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Cẩm Nang Sức Khỏe & Phòng Ngừa
          </h1>
          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed">
            Tổng hợp các bài viết chuyên sâu, tư vấn chế độ dinh dưỡng và lối sống lành mạnh được biên soạn, kiểm chứng bởi đội ngũ y bác sĩ MediCare.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-4 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, triệu chứng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
            />
          </div>

          {/* Specialty Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {(() => {
              const specMap = new Map<string, string>();
              articles.forEach((a) => {
                if (a.specialty?.name) {
                  specMap.set(a.specialty.name.toLowerCase(), a.specialty.name);
                }
              });
              const tabs = [
                { id: "all", label: "Tất cả chủ đề" },
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

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse space-y-4"
              >
                <div className="w-full aspect-[16/10] bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-4/5" />
                <div className="h-12 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Không tìm thấy bài viết phù hợp
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ chọn chủ đề lọc.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("all");
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedArticles.map((art) => {
              const dateStr = new Date(art.created_at).toLocaleDateString(
                "vi-VN",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }
              );

              return (
                <Link
                  key={art.id}
                  href={`/articles/${art.id}`}
                  className="group rounded-3xl overflow-hidden border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      {art.thumbnail_url ? (
                        <img
                          src={art.thumbnail_url}
                          alt={art.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600">
                          <BookOpen className="w-12 h-12 stroke-[1.2]" />
                        </div>
                      )}

                      {/* Category Tag */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-teal-800 text-xs font-bold shadow-xs">
                          {art.specialty?.name || "Y tế đời sống"}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {art.views} lượt xem
                        </span>
                      </div>

                      <h2 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
                        {art.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                        {art.short_description ||
                          "Tìm hiểu các dấu hiệu và phương pháp phòng ngừa bệnh lý hiệu quả được khuyên dùng bởi các bác sĩ chuyên khoa."}
                      </p>
                    </div>
                  </div>

                  {/* Author & CTA */}
                  <div className="p-6 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-600 truncate max-w-[170px] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>
                          {art.author?.user?.full_name
                            ? `BS. ${art.author.user.full_name}`
                            : "Ban Cố Vấn Y Khoa"}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform">
                        <span>Đọc chi tiết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredArticles.length}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 350, behavior: "smooth" });
          }}
          itemName="bài viết"
        />
      </div>
    </div>
  );
}
