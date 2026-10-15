"use client";

import React, { useState, useEffect } from "react";
import { Article } from "@/app/types/Clinic";
import { getArticles } from "@/app/lib/clinic.api";
import { ArticleModal } from "./ArticleModal";
import {
  BookOpen,
  Calendar,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const ArticleSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    getArticles()
      .then((res) => {
        if (res && res.length > 0) {
          setArticles(res);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section id="articles" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/60">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Kiến Thức Y Khoa Thường Thức</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Bài Viết Về Sức Khỏe
              </h2>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl">
                Cập nhật thông tin khoa học, kinh nghiệm phòng ngừa bệnh lý và lối sống lành mạnh được biên soạn bởi các bác sĩ chuyên khoa.
              </p>
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-100 p-4 space-y-4 animate-pulse"
                >
                  <div className="w-full aspect-[16/10] bg-slate-200 rounded-2xl" />
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-4/5" />
                  <div className="h-12 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.map((art) => {
                const dateStr = new Date(art.created_at).toLocaleDateString(
                  "vi-VN",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }
                );

                return (
                  <article
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className="group rounded-3xl overflow-hidden border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                  >
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

                      {/* Specialty Tag */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-teal-800 text-xs font-bold shadow-xs">
                          {art.specialty?.name || "Y tế đời sống"}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
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

                        <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
                          {art.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {art.short_description || "Đọc thêm để trang bị kiến thức sức khỏe phòng chống bệnh tật kịp thời cho bản thân và gia đình."}
                        </p>
                      </div>

                      {/* Author & Read CTA */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-600 truncate max-w-[170px]">
                          {art.author?.user?.full_name ? (
                            <span>BS. {art.author.user.full_name}</span>
                          ) : (
                            <span>Ban Cố Vấn Y Khoa</span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform">
                          <span>Chi tiết</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Article Detail Reading Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  );
};
