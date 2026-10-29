"use client";

import React from "react";
import { Article } from "@/app/types/Clinic";
import { X, Calendar, Eye, User, BookOpen, Share2 } from "lucide-react";

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
}) => {
  if (!article) return null;

  const dateStr = new Date(article.created_at).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-teal-800 text-xs font-semibold">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>Cẩm nang y tế & Bài viết sức khỏe</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Category & Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200/50">
                {article.specialty?.name || "Y học thường thức"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {dateStr}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {article.views} lượt đọc
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {article.title}
            </h1>

            {/* Author */}
            {article.author?.user && (
              <div className="flex items-center gap-2.5 pt-1 text-xs text-slate-600">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span>
                  Tác giả: <strong>{article.author.user.full_name}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail */}
          {article.thumbnail_url && (
            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-xs">
              <img
                src={article.thumbnail_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Short description callout */}
          {article.short_description && (
            <div className="p-4 rounded-2xl bg-teal-50/70 border-l-4 border-teal-600 text-sm text-slate-700 font-medium italic">
              {article.short_description}
            </div>
          )}

          {/* HTML body or text content */}
          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed space-y-4 text-slate-700">
            {article.article_detail?.html_content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: article.article_detail.html_content,
                }}
              />
            ) : (
              <p>
                Để được tư vấn và chẩn đoán chính xác nhất, người bệnh nên chủ động thăm khám định kỳ tại các cơ sở y tế uy tín. Đội ngũ bác sĩ MediCare luôn sẵn sàng hỗ trợ bạn và gia đình.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Nguồn: Ban Biên Tập Y Khoa MediCare
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
