"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Search,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Award,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Activity,
  Smile,
  Ear,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import { Banner } from "../types/Banner";
import { Article, ArticlePagination } from "../types/Article";
import { Doctor } from "../types/Doctor";
import { getBanners } from "../lib/banner.api";
import { getArticles } from "../lib/article.api";
import { getDoctors } from "../lib/doctor.api";

// Danh mục Chuyên khoa mẫu
const SPECIALTIES = [
  {
    id: 1,
    name: "Sản - Phụ khoa",
    description: "Khám thai, tầm soát ung thư phụ khoa, tư vấn tiền sản",
    icon: HeartPulse,
    doctorCount: 42,
    badge: "Phổ biến",
  },
  {
    id: 2,
    name: "Răng Hàm Mặt",
    description: "Nha khoa thẩm mỹ, nhổ răng khôn, điều trị tủy",
    icon: Smile,
    doctorCount: 36,
    badge: "Chất lượng cao",
  },
  {
    id: 4,
    name: "Tai Mũi Họng",
    description: "Nội soi vòm họng, điều trị viêm xoang, thanh quản",
    icon: Ear,
    doctorCount: 28,
    badge: "Tiên tiến",
  },
  {
    id: 3,
    name: "Tim Mạch Can Thiệp",
    description: "Tầm soát xơ vữa, đo điện tim Holter, kiểm soát huyết áp",
    icon: Activity,
    doctorCount: 25,
    badge: "Chuyên gia",
  },
  {
    id: 5,
    name: "Cơ Xương Khớp",
    description: "Thoái hóa khớp, cột sống, chấn thương thể thao",
    icon: Stethoscope,
    doctorCount: 31,
    badge: "Hàng đầu",
  },
  {
    id: 6,
    name: "Nhi Khoa Toàn Diện",
    description: "Khám dinh dưỡng, tiêm chủng, bệnh lý hô hấp trẻ em",
    icon: Award,
    doctorCount: 39,
    badge: "Tận tâm",
  },
];

// Danh sách Bác sĩ tiêu biểu
const TOP_DOCTORS = [
  {
    id: 1,
    name: "BS.CKII Nguyễn Văn An",
    specialty: "Sản - Phụ khoa",
    experience: "18 năm kinh nghiệm",
    hospital: "BV Phụ Sản Trung Ương",
    rating: 4.9,
    reviews: 320,
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "ThS.BS Lê Hồng Nam",
    specialty: "Răng Hàm Mặt",
    experience: "12 năm kinh nghiệm",
    hospital: "Viện Răng Hàm Mặt Quốc Gia",
    rating: 4.95,
    reviews: 284,
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 7,
    name: "BS.CKI Hoàng Quốc Bảo",
    specialty: "Tai Mũi Họng",
    experience: "15 năm kinh nghiệm",
    hospital: "BV Tai Mũi Họng Trung Ương",
    rating: 4.88,
    reviews: 215,
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
  },
];

export default function MainPage() {
  // Banner state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loadingBanners, setLoadingBanners] = useState(true);

  // Articles state & filters (4 params: page, search, specialty_id, author_id)
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<ArticlePagination>({
    page: 1,
    pageSize: 5,
    total: 0,
    totalPages: 1,
  });
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Doctors state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filter params
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Quick Hero Search
  const [heroSearchInput, setHeroSearchInput] = useState("");

  // Fetch Banners
  useEffect(() => {
    let isMounted = true;
    async function fetchBannersData() {
      try {
        const data = await getBanners();
        if (isMounted && data.length > 0) {
          setBanners(data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách banner:", err);
      } finally {
        if (isMounted) setLoadingBanners(false);
      }
    }
    fetchBannersData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Doctors
  useEffect(() => {
    let isMounted = true;
    async function fetchDoctorsData() {
      try {
        const data = await getDoctors({ pageSize: 6 });
        if (isMounted && data.doctors && data.doctors.length > 0) {
          setDoctors(data.doctors);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách bác sĩ:", err);
      } finally {
        if (isMounted) setLoadingDoctors(false);
      }
    }
    fetchDoctorsData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Banner auto-play interval
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Fetch Articles with the 4 parameters
  const loadArticles = useCallback(
    async (page: number, search: string, specialtyId: string, authorId: string) => {
      setLoadingArticles(true);
      try {
        const data = await getArticles({
          page,
          search: search || undefined,
          specialty_id: specialtyId ? Number(specialtyId) : undefined,
          author_id: authorId ? Number(authorId) : undefined,
        });
        setArticles(data.articles);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Lỗi khi tải bài viết:", err);
      } finally {
        setLoadingArticles(false);
      }
    },
    []
  );

  useEffect(() => {
    loadArticles(currentPage, searchQuery, selectedSpecialty, selectedAuthor);
  }, [currentPage, searchQuery, selectedSpecialty, selectedAuthor, loadArticles]);

  // Banner navigation helpers
  const handleNextBanner = () => {
    if (banners.length === 0) return;
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    if (banners.length === 0) return;
    setCurrentBannerIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  // Helper when clicking Hero search
  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      setSearchQuery(heroSearchInput.trim());
      setCurrentPage(1);
      const articlesSection = document.getElementById("articles");
      if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Helper when clicking a Specialty card
  const handleSelectSpecialtyFromCard = (id: number) => {
    setSelectedSpecialty(id.toString());
    setCurrentPage(1);
    const articlesSection = document.getElementById("articles");
    if (articlesSection) {
      articlesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
    setSelectedAuthor("");
    setCurrentPage(1);
  };

  return (
    <div className="w-full flex flex-col space-y-16 md:space-y-24">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Split-Screen, Double-Bezel Search & Dynamic Banner Carousel) */}
      {/* ========================================================================= */}
      <section className="relative pt-6 sm:pt-10 pb-8 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Subtle Background Glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-80 bg-teal-200/35 blur-3xl rounded-full pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & Interactive Search Island */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 w-max px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Nền Tảng Y Tế Số MediCare 4.0</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Đặt Lịch Khám Chuyên Gia{" "}
              <span className="text-teal-600">Nhanh Chóng</span> & Chu Đáo.
            </h1>

            {/* Subtext */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-[55ch]">
              Kết nối trực tiếp với hơn 500+ bác sĩ giỏi tại các chuyên khoa hàng
              đầu. Không xếp hàng chờ đợi, bảo mật hồ sơ bệnh án chuẩn quốc tế.
            </p>

            {/* Double-Bezel Quick Search Island */}
            <div className="p-2 rounded-2xl bg-slate-200/70 shadow-xs border border-slate-200/90 max-w-xl">
              <form
                onSubmit={handleHeroSearchSubmit}
                className="flex flex-col sm:flex-row gap-2 bg-white p-2.5 rounded-xl shadow-inner border border-slate-100"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={heroSearchInput}
                    onChange={(e) => setHeroSearchInput(e.target.value)}
                    placeholder="Tìm theo triệu chứng, tên bác sĩ..."
                    className="w-full pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-200 shadow-sm shadow-teal-600/30"
                >
                  <span>Tìm ngay</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </button>
              </form>
            </div>

            {/* Quick Keyword Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-medium">Gợi ý khám:</span>
              {[
                { label: "Sản - Phụ khoa", id: 1 },
                { label: "Răng Hàm Mặt", id: 2 },
                { label: "Tai Mũi Họng", id: 4 },
                { label: "Tim Mạch", id: 3 },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleSelectSpecialtyFromCard(chip.id)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200/80 transition-colors"
                >
                  #{chip.label}
                </button>
              ))}
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/70 max-w-lg">
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-slate-900">
                  99.2%
                </span>
                <span className="text-xs text-slate-500">Bệnh nhân hài lòng</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-slate-900">
                  500+
                </span>
                <span className="text-xs text-slate-500">Bác sĩ chuyên khoa</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-bold text-slate-900">
                  24/7
                </span>
                <span className="text-xs text-slate-500">Tư vấn trực tuyến</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Banner Carousel (Double-Bezel Hardware Frame) */}
          <div className="lg:col-span-6">
            <div className="p-2.5 sm:p-3 rounded-3xl bg-slate-200/70 border border-slate-200 shadow-md">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] sm:aspect-[16/9] shadow-inner group">
                {/* Banner Slide Content */}
                {loadingBanners ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-2" />
                    <span className="text-xs font-medium">Đang tải chương trình ưu đãi...</span>
                  </div>
                ) : banners.length > 0 ? (
                  <>
                    <img
                      src={banners[currentBannerIndex]?.image_url}
                      alt={banners[currentBannerIndex]?.title || "Banner MediCare"}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Gradient Overlay & Text Caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-5 sm:p-7 text-white">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/90 text-slate-950 text-[10px] font-bold w-max uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3" />
                        <span>Chương trình nổi bật</span>
                      </div>
                      <h3 className="text-base sm:text-xl font-bold text-white line-clamp-2 drop-shadow-sm mb-2">
                        {banners[currentBannerIndex]?.title}
                      </h3>
                      {banners[currentBannerIndex]?.link_url && (
                        <a
                          href={banners[currentBannerIndex]?.link_url}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 hover:text-white transition-colors"
                        >
                          <span>Xem chi tiết ưu đãi</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Carousel Nav Controls */}
                    <button
                      type="button"
                      onClick={handlePrevBanner}
                      aria-label="Banner trước"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextBanner}
                      aria-label="Banner tiếp theo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Slide Dots Indicator */}
                    <div className="absolute bottom-3 right-5 flex items-center gap-1.5 z-10">
                      {banners.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentBannerIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            currentBannerIndex === idx
                              ? "w-6 bg-teal-400"
                              : "w-1.5 bg-white/50 hover:bg-white/80"
                          }`}
                          aria-label={`Đi tới banner ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CHUYÊN KHOA TIÊU BIỂU (Asymmetric Bento Grid) */}
      {/* ========================================================================= */}
      <section
        id="specialties"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">
              Đa Dạng Dịch Vụ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Chuyên Khoa Thăm Khám Hàng Đầu
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Hệ thống phòng khám chuyên khoa được trang bị thiết bị y tế hiện đại, đảm bảo chẩn đoán chính xác và phác đồ chuẩn y khoa.
            </p>
          </div>
          <a
            href="#articles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 shrink-0"
          >
            <span>Xem tất cả bài viết liên quan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SPECIALTIES.map((spec) => {
            const IconComponent = spec.icon;
            return (
              <div
                key={spec.id}
                onClick={() => handleSelectSpecialtyFromCard(spec.id)}
                className="group cursor-pointer p-1.5 rounded-3xl bg-slate-200/50 hover:bg-teal-200/40 border border-slate-200/80 transition-all duration-300 hover:shadow-md"
              >
                <div className="h-full p-6 rounded-[calc(1.5rem-0.375rem)] bg-white border border-slate-100 flex flex-col justify-between transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-800 transition-colors">
                        {spec.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {spec.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {spec.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
                    <span className="text-teal-600 font-semibold">
                      {spec.doctorCount}+ Bác sĩ đang trực
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-teal-600 transition-colors">
                      Lọc bài viết <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUY TRÌNH ĐẶT LỊCH 4 BƯỚC TIỆN LỢI */}
      {/* ========================================================================= */}
      <section
        id="booking-flow"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-24"
      >
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          {/* Subtle Ambient Pattern */}
          <div
            className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mb-12">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">
              Đơn Giản & Minh Bạch
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              Quy Trình 4 Bước Đặt Lịch Khám Trực Tuyến
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Giúp bạn và người thân chủ động thời gian, loại bỏ hoàn toàn cảnh chen lấn, chờ đợi mệt mỏi tại cơ sở y tế.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              {
                step: "01",
                title: "Chọn Chuyên Khoa & Bác Sĩ",
                desc: "Tra cứu danh sách bác sĩ chuyên môn phù hợp với tình trạng sức khỏe của bạn.",
                icon: Search,
              },
              {
                step: "02",
                title: "Chọn Ngày & Khung Giờ",
                desc: "Chủ động chọn ngày khám và khung giờ còn trống thuận tiện nhất với lịch trình cá nhân.",
                icon: Calendar,
              },
              {
                step: "03",
                title: "Điền Hồ Sơ & Xác Nhận",
                desc: "Cung cấp triệu chứng ban đầu và số điện thoại để nhận mã phiếu khám điện tử.",
                icon: CheckCircle2,
              },
              {
                step: "04",
                title: "Đến Khám Ưu Tiên",
                desc: "Có mặt trước 10 phút tại phòng khám, quét mã QR vào thẳng phòng bác sĩ không cần bốc số.",
                icon: Award,
              },
            ].map((st, i) => {
              const StepIcon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-teal-400 font-mono">
                        {st.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                        <StepIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-base mb-2">
                      {st.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION BÀI VIẾT & CẨM NANG Y KHOA (API INTEGRATION FULL 4 PARAMETERS) */}
      {/* ========================================================================= */}
      <section
        id="articles"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">
              Kiến Thức Y Học
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Cẩm Nang Sức Khỏe & Bài Viết Y Khoa
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Cập nhật thông tin y khoa chính thống được biên soạn trực tiếp bởi đội ngũ y bác sĩ đầu ngành MediCare.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Hiển thị {articles.length} / {pagination.total} bài viết
          </div>
        </div>

        {/* Filter Controls Bar (Search, Specialty, Author, Reset) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* 1. Search input (param: search) */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm bài viết theo từ khóa..."
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* 2. Filter by Specialty (param: specialty_id) */}
            <div className="md:col-span-3">
              <select
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="">Tất cả chuyên khoa</option>
                <option value="1">Sản - Phụ khoa (ID: 1)</option>
                <option value="2">Răng Hàm Mặt (ID: 2)</option>
                <option value="4">Tai Mũi Họng (ID: 4)</option>
              </select>
            </div>

            {/* 3. Filter by Author (param: author_id) */}
            <div className="md:col-span-3">
              <select
                value={selectedAuthor}
                onChange={(e) => {
                  setSelectedAuthor(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="">Tất cả bác sĩ tác giả</option>
                <option value="1">BS. Nguyễn Văn An (ID: 1)</option>
                <option value="3">BS. Lê Hồng Nam (ID: 3)</option>
                <option value="7">BS. Hoàng Quốc Bảo (ID: 7)</option>
              </select>
            </div>

            {/* 4. Reset Filters Button */}
            <div className="md:col-span-2 flex items-center justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(searchQuery || selectedSpecialty || selectedAuthor) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">Bộ lọc đang áp dụng:</span>
              {searchQuery && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium border border-teal-200">
                  Từ khóa: &quot;{searchQuery}&quot;
                </span>
              )}
              {selectedSpecialty && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium border border-teal-200">
                  Chuyên khoa ID: {selectedSpecialty}
                </span>
              )}
              {selectedAuthor && (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium border border-teal-200">
                  Tác giả ID: {selectedAuthor}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Articles List / Cards */}
        {loadingArticles ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((sk) => (
              <div
                key={sk}
                className="p-4 rounded-3xl bg-white border border-slate-100 animate-pulse space-y-4"
              >
                <div className="w-full aspect-[16/10] bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              // Extract author full name safely
              let authorName = "Chuyên gia MediCare";
              if (article.author?.user) {
                if (typeof article.author.user === "string") {
                  // In case backend returns raw string representation like "@{id=4; full_name=...}"
                  const match = article.author.user.match(/full_name=([^;]+)/);
                  if (match && match[1]) authorName = match[1].trim();
                } else if (article.author.user.full_name) {
                  authorName = article.author.user.full_name;
                }
              }

              return (
                <Link
                  key={article.id}
                  href={`/articles/${encodeURIComponent(article.slug)}`}
                  className="group flex flex-col justify-between p-2 rounded-3xl bg-slate-200/50 hover:bg-teal-200/40 border border-slate-200/80 transition-all duration-300 cursor-pointer"
                >
                  <div className="p-4 rounded-[calc(1.5rem-0.375rem)] bg-white border border-slate-100 flex flex-col h-full justify-between">
                    <div>
                      {/* Thumbnail with Double-Bezel Frame */}
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-4">
                        <img
                          src={
                            article.thumbnail_url ||
                            "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {article.specialty?.name && (
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-semibold text-teal-800 shadow-xs">
                            {article.specialty.name}
                          </span>
                        )}
                      </div>

                      {/* Meta Information (Author & Date) */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                        <span className="font-medium text-slate-700">
                          {authorName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-slate-400" />
                            {article.views || 0}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(article.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {article.short_description || "Bấm để xem chi tiết bài viết y khoa."}
                      </p>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-teal-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Đọc toàn bộ bài viết <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">
              Không tìm thấy bài viết phù hợp
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc chuyên khoa / tác giả.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
            >
              Xem tất cả bài viết
            </button>
          </div>
        )}

        {/* Pagination Bar (param: page) */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                    currentPage === p
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              disabled={currentPage >= pagination.totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. ĐỘI NGŨ CHUYÊN GIA BÁC SĨ HÀNG ĐẦU */}
      {/* ========================================================================= */}
      <section
        id="doctors"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">
              Đội Ngũ Bác Sĩ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Chuyên Gia Đầu Ngành Tận Tâm
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Đội ngũ bác sĩ giàu kinh nghiệm công tác tại các bệnh viện lớn, luôn sẵn sàng lắng nghe và đồng hành cùng người bệnh.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 shrink-0"
          >
            <span>Đăng ký khám cùng chuyên gia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Doctors Grid from API */}
        {loadingDoctors ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((sk) => (
              <div
                key={sk}
                className="p-5 rounded-3xl bg-white border border-slate-100 animate-pulse space-y-4"
              >
                <div className="w-full aspect-[4/3] bg-slate-200 rounded-2xl" />
                <div className="h-5 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-10 bg-slate-200 rounded-xl w-full mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => {
              const formattedPrice = doc.price
                ? new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(doc.price))
                : "Liên hệ";

              const avatarUrl =
                doc.user.avatar ||
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={doc.id}
                  className="group p-1.5 rounded-3xl bg-slate-200/50 hover:bg-teal-200/40 border border-slate-200/80 transition-all duration-300"
                >
                  <div className="p-5 rounded-[calc(1.5rem-0.375rem)] bg-white border border-slate-100 flex flex-col justify-between h-full">
                    <div>
                      {/* Doctor Avatar */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4">
                        <img
                          src={avatarUrl}
                          alt={doc.user.full_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {doc.specialty?.name && (
                          <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-teal-800 shadow-xs">
                            {doc.specialty.name}
                          </span>
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-semibold text-white shadow-xs">
                          {formattedPrice}
                        </span>
                      </div>

                      {/* Doctor Info */}
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {doc.user.full_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {doc.description || "Bác sĩ giàu kinh nghiệm, tận tâm với bệnh nhân."}
                      </p>

                      <div className="flex items-center gap-2 mt-3 text-xs text-amber-500 font-semibold">
                        <span>★ 5.0</span>
                        <span className="text-slate-400 font-normal">
                          (Được người bệnh tin tưởng)
                        </span>
                      </div>
                    </div>

                    {/* Booking Action Button */}
                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <Link
                        href={`/login`}
                        className="w-full py-2.5 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Đặt lịch khám với bác sĩ</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION BANNER (Final Trust Touchpoint) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white relative overflow-hidden shadow-xl shadow-teal-700/15">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chăm Sóc Sức Khỏe Toàn Diện</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Bắt Đầu Hành Trình Khỏe Mạnh Cho Gia Đình Ngay Hôm Nay
            </h2>
            <p className="text-teal-50 text-sm sm:text-base mt-3 leading-relaxed">
              Hơn 120.000 bệnh nhân đã tin tưởng đặt khám tại MediCare. Trải nghiệm dịch vụ y tế văn minh, tận tâm và không xếp hàng chờ đợi.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 pl-5 pr-2 py-2.5 rounded-full bg-white text-teal-800 hover:bg-teal-50 text-xs sm:text-sm font-bold shadow-md transition-all duration-200"
              >
                <span>Tạo tài khoản khám ngay</span>
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <a
                href="tel:19006868"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-teal-800/60 hover:bg-teal-800/90 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-teal-300" />
                <span>Tổng đài miễn cước: 1900 6868</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}