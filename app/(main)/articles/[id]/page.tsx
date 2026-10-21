"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Article } from "@/app/types/Clinic";
import { getArticleByIdOrSlug, getArticles } from "@/app/lib/clinic.api";
import {
  BookOpen,
  Calendar,
  Eye,
  ArrowLeft,
  Share2,
  Clock,
  Sparkles,
  User,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  CheckCircle2,
  Bookmark,
  Heart,
  Stethoscope,
} from "lucide-react";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (articleId) {
      setLoading(true);
      getArticleByIdOrSlug(articleId)
        .then((res) => {
          setArticle(res);
          // Fetch related articles
          getArticles().then((all) => {
            if (all && all.length > 0) {
              const others = all.filter(
                (a) => String(a.id) !== String(articleId) && a.slug !== articleId
              );
              setRelatedArticles(others.slice(0, 3));
            }
          });
        })
        .finally(() => setLoading(false));
    }
  }, [articleId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 pb-24">
        {/* Breadcrumb Skeleton */}
        <div className="bg-white border-b border-slate-200/80 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-5 bg-slate-200 rounded-lg w-64 animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded-full w-36" />
          <div className="h-12 bg-slate-200 rounded-2xl w-full" />
          <div className="h-10 bg-slate-200 rounded-2xl w-3/4" />
          <div className="h-5 bg-slate-200 rounded-lg w-48" />
          <div className="w-full aspect-[16/9] bg-slate-200 rounded-3xl mt-8" />
          <div className="space-y-4 pt-6">
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
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-200/80 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            Không tìm thấy bài viết
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Bài viết bạn đang tìm có thể đã được cập nhật hoặc không còn tồn tại trên hệ thống.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-md shadow-teal-700/25"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại cẩm nang bài viết</span>
          </Link>
        </div>
      </div>
    );
  }

  const dateStr = new Date(article.created_at).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const authorName = article.author?.user?.full_name || "Ban Biên Tập Y Khoa MediCare";
  const authorAvatar = article.author?.user?.avatar;
  const specialtyName = article.specialty?.name || "Y học thường thức";

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-teal-700 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-teal-700 transition-colors">
              Cẩm nang sức khỏe
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-xs">
              {article.title}
            </span>
          </div>

          <Link
            href="/articles"
            className="flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-semibold text-xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Tất cả bài viết</span>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Article Content (8 cols) */}
          <article className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.3)] space-y-8">
            {/* Header info */}
            <div className="space-y-4 pb-6 border-b border-slate-100">
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200/60">
                  {specialtyName}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>5 phút đọc</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {article.title}
              </h1>

              {/* Metadata bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-200">
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      {authorName}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views} lượt xem
                      </span>
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copied ? "Đã chép link!" : "Chia sẻ bài viết"}</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Banner */}
            {article.thumbnail_url && (
              <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 shadow-sm border border-slate-100">
                <img
                  src={article.thumbnail_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Lead Short Description Callout */}
            {article.short_description && (
              <div className="p-5 rounded-2xl bg-teal-50/70 border-l-4 border-teal-600 text-sm sm:text-base text-slate-700 font-medium italic leading-relaxed">
                "{article.short_description}"
              </div>
            )}

            {/* Article Main HTML Body */}
            <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-5">
              {article.article_detail?.html_content ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: article.article_detail.html_content,
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <p>
                    Để duy trì sức khỏe tối ưu và phòng ngừa sớm các biến chứng nguy hiểm, các chuyên gia y tế khuyến cáo mỗi người nên duy trì chế độ dinh dưỡng cân bằng, tập luyện thể dục đều đặn và thực hiện thăm khám sức khỏe định kỳ ít nhất 6 tháng một lần.
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 mt-4">
                    Khi nào cần đi khám ngay?
                  </h3>
                  <p>
                    Nếu xuất hiện các dấu hiệu bất thường như mệt mỏi kéo dài, đau tức bất thường hoặc các triệu chứng kéo dài không thuyên giảm, người bệnh không nên tự ý dùng thuốc mà cần đến ngay cơ sở y tế uy tín để được chẩn đoán chính xác.
                  </p>
                </div>
              )}
            </div>

            {/* Medical Ethics & Disclaimer Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 text-xs text-slate-600 leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block mb-0.5">
                  Lưu ý tham vấn y khoa:
                </strong>
                Nội dung trong bài viết được biên soạn nhằm mục đích cung cấp kiến thức tham khảo, không thay thế cho việc chẩn đoán, điều trị hay chỉ định của bác sĩ chuyên môn.
              </div>
            </div>

            {/* Author Footer Profile Card */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-teal-50/40 border border-teal-100/60">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0 border border-teal-200">
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Stethoscope className="w-7 h-7 text-teal-700" />
                )}
              </div>
              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                  Tác giả bài viết
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {authorName}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bác sĩ chuyên khoa tại MediCare, phụ trách tư vấn sức khỏe và đồng hành cùng người bệnh trong các chương trình y tế cộng đồng.
                </p>
              </div>
              {article.author?.id && (
                <Link
                  href={`/doctors/${article.author.id}`}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors shrink-0"
                >
                  Xem hồ sơ bác sĩ
                </Link>
              )}
            </div>
          </article>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Consultation CTA Banner */}
            <div className="bg-gradient-to-br from-teal-800 to-teal-900 rounded-[2rem] p-6 sm:p-7 text-white shadow-lg shadow-teal-900/20 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold">
                Bạn cần tư vấn sức khỏe trực tiếp?
              </h3>
              <p className="text-xs text-teal-100/90 leading-relaxed">
                Đặt lịch khám với các bác sĩ chuyên khoa giàu kinh nghiệm tại MediCare để được chẩn đoán và tư vấn phác đồ phù hợp.
              </p>
              <div className="space-y-2 pt-1">
                <Link
                  href="/doctors"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-teal-900 text-xs font-bold hover:bg-teal-50 transition-colors cursor-pointer"
                >
                  <span>Tìm bác sĩ chuyên khoa</span>
                  <ChevronRight className="w-4 h-4 text-teal-700" />
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-teal-700/80 text-white text-xs font-bold hover:bg-teal-700 transition-colors cursor-pointer border border-teal-600/60"
                >
                  <span>Xem các gói tầm soát</span>
                </Link>
              </div>
            </div>

            {/* Hotline Support Box */}
            <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
                <PhoneCall className="w-4 h-4 text-teal-600" />
                <span>Tổng đài hỗ trợ 24/7</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                1900 6868
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đội ngũ điều dưỡng và tư vấn viên MediCare luôn sẵn sàng hỗ trợ giải đáp thắc mắc và hướng dẫn đăng ký khám.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Kiến thức sức khỏe
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Bài Viết Cùng Chủ Đề
              </h2>
            </div>
            <Link
              href="/articles"
              className="text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((art) => (
              <Link
                key={art.id}
                href={`/articles/${art.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {art.thumbnail_url ? (
                    <img
                      src={art.thumbnail_url}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600">
                      <BookOpen className="w-10 h-10 stroke-[1.2]" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-teal-800 text-xs font-bold shadow-xs">
                      {art.specialty?.name || "Y tế đời sống"}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {art.short_description || "Đọc bài viết để tìm hiểu thêm thông tin y khoa hữu ích."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>{art.views} lượt đọc</span>
                    <span className="font-semibold text-teal-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Đọc tiếp →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
