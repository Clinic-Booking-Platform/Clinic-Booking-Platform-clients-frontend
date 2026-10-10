"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  HeartPulse,
  User,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  ArrowRight,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";
import { ArticleDetail, Article } from "../../../types/Article";
import { getArticleBySlug, getArticles } from "../../../lib/article.api";

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  // Decode slug in case it contains URL encoded Vietnamese characters or hyphens
  const rawSlug = decodeURIComponent(resolvedParams.slug);

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      setLoading(true);
      try {
        const data = await getArticleBySlug(rawSlug);
        if (isMounted) {
          setArticle(data);
          // If we got article specialty, fetch related articles
          if (data?.specialty_id) {
            const rel = await getArticles({
              specialty_id: data.specialty_id,
              pageSize: 3,
            } as any);
            if (isMounted && rel.articles) {
              setRelatedArticles(
                rel.articles.filter((a) => a.id !== data.id).slice(0, 3)
              );
            }
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết bài viết:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (rawSlug) {
      fetchDetail();
    }

    return () => {
      isMounted = false;
    };
  }, [rawSlug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper author name extractor
  let authorName = "Chuyên gia MediCare";
  if (article?.author?.user) {
    if (typeof article.author.user === "string") {
      const match = article.author.user.match(/full_name=([^;]+)/);
      if (match && match[1]) authorName = match[1].trim();
    } else if (article.author.user.full_name) {
      authorName = article.author.user.full_name;
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-10 bg-slate-200 rounded w-3/4" />
          <div className="h-5 bg-slate-200 rounded w-1/2" />
          <div className="aspect-[16/9] bg-slate-200 rounded-3xl" />
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
            <div className="h-4 bg-slate-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Không tìm thấy bài viết
        </h1>
        <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
          Bài viết có thể đã được gỡ xuống hoặc đường dẫn bài viết không chính xác.
        </p>
        <Link
          href="/#articles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại cẩm nang y khoa</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen py-8 sm:py-12 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-teal-700 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/#articles" className="hover:text-teal-700 transition-colors">
            Cẩm nang y khoa
          </Link>
          {article.specialty?.name && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-600 font-medium">
                {article.specialty.name}
              </span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400 truncate max-w-[240px]">
            {article.title}
          </span>
        </nav>

        {/* Article Header (Editorial Layout) */}
        <header className="max-w-3xl mb-8">
          <div className="flex items-center gap-3 mb-4">
            {article.specialty?.name && (
              <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                {article.specialty.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {article.views || 0} lượt xem
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">
              {new Date(article.created_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {article.short_description}
          </p>

          {/* Author Badge & Medical Reviewer */}
          <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-teal-100">
                {authorName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {authorName}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-teal-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tham vấn y khoa & Kiểm duyệt chuyên môn</span>
                </div>
              </div>
            </div>

            {/* Quick Share Pill */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-teal-700 font-semibold">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chia sẻ link</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Featured Image Frame (Double-Bezel) */}
        <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-200/60 border border-slate-200 shadow-sm mb-12">
          <div className="aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-900 relative">
            <img
              src={
                article.thumbnail_url ||
                "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80"
              }
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Article Body (col-span-8) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xs">
            {article.article_detail?.html_content ? (
              <div
                className="article-rich-text text-slate-800 leading-relaxed text-base space-y-4"
                dangerouslySetInnerHTML={{
                  __html: article.article_detail.html_content,
                }}
              />
            ) : (
              <div className="text-slate-600 leading-relaxed space-y-4 text-base">
                <p>{article.short_description}</p>
                <p>
                  Nội dung chi tiết của bài viết đang được các bác sĩ cập nhật thêm
                  những khuyến cáo y khoa mới nhất. Vui lòng quay lại sau ít phút hoặc
                  liên hệ tổng đài tư vấn sức khỏe để được hỗ trợ trực tiếp.
                </p>
              </div>
            )}

            {/* Disclaimer Alert */}
            <div className="mt-10 p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-1">
                  Khuyến cáo y khoa từ MediCare:
                </strong>
                Thông tin trong bài viết chỉ mang tính chất tham khảo và không thay thế
                cho việc chẩn đoán hoặc điều trị y khoa trực tiếp. Người bệnh vui lòng
                đến cơ sở y tế để được bác sĩ chuyên khoa thăm khám khi có triệu chứng
                bất thường.
              </div>
            </div>
          </div>

          {/* Right Sticky Sidebar (col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Doctor & Booking Action Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block mb-2">
                Chuyên Gia Phụ Trách
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {authorName}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {article.specialty?.name || "Bác sĩ chuyên khoa"} • MediCare Clinic
              </p>

              <div className="space-y-2 mb-5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Tư vấn tận tâm, chu đáo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Chọn khung giờ không xếp hàng</span>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-teal-600/25"
              >
                <span>Đặt lịch khám với chuyên gia</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Hotline Card */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Cần Tư Vấn Sức Khỏe Nhanh?
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Đội ngũ điều dưỡng và bác sĩ trực hỗ trợ 24/7 giải đáp mọi thắc mắc.
              </p>
              <a
                href="tel:19006868"
                className="block text-center py-2.5 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold hover:bg-teal-400 transition-colors"
              >
                Gọi ngay: 1900 6868 (Miễn phí)
              </a>
            </div>

            {/* Back to Home Button */}
            <Link
              href="/#articles"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Xem thêm bài viết khác</span>
            </Link>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Bài Viết Cùng Chuyên Khoa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/articles/${encodeURIComponent(rel.slug)}`}
                  className="group p-1.5 rounded-3xl bg-slate-200/50 hover:bg-teal-200/40 border border-slate-200/80 transition-all duration-300"
                >
                  <div className="p-4 rounded-[calc(1.5rem-0.375rem)] bg-white border border-slate-100 flex flex-col h-full justify-between">
                    <div>
                      <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <img
                          src={rel.thumbnail_url}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-teal-700 transition-colors">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {rel.short_description}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-teal-600">
                      <span>Đọc tiếp</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
