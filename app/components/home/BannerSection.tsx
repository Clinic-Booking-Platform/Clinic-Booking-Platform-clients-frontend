"use client";

import React, { useState, useEffect } from "react";
import { Banner } from "@/app/types/Clinic";
import { getBanners } from "@/app/lib/clinic.api";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Users,
  Activity,
} from "lucide-react";

export const BannerSection: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    getBanners().then((res) => {
      if (res && res.length > 0) {
        setBanners(res);
      }
    });
  }, []);

  // Autoplay rotation every 5 seconds
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section
      className="relative bg-gradient-to-b from-teal-900 via-slate-900 to-slate-950 text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Banner Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[420px]">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Phòng Khám Đạt Chuẩn Quốc Tế JCI</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {currentBanner.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Trải nghiệm dịch vụ y tế hiện đại, chẩn đoán chính xác với đội ngũ chuyên gia đầu ngành. Không gian thăm khám văn minh, tận tình và chuyên nghiệp.
            </p>

            {/* Micro assurances */}
            <div className="pt-4 flex flex-wrap gap-6 text-xs text-slate-400 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-teal-400" /> 100% Bác sĩ chuyên khoa II & Thạc sĩ
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-400" /> Máy móc xét nghiệm tự động
              </span>
            </div>
          </div>

          {/* Right Banner Image with Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-white/15 group">
              <img
                src={currentBanner.image_url}
                alt={currentBanner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

              {/* Float badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">Hỗ trợ tư vấn y tế 24/7</p>
                  <p className="text-[11px] text-teal-300">Tổng đài tiếp nhận miễn phí</p>
                </div>
                <span className="font-mono font-bold text-sm text-teal-300">
                  1900 6868
                </span>
              </div>
            </div>

            {/* Slider Navigation Buttons */}
            {banners.length > 1 && (
              <div className="absolute -bottom-5 right-6 flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-teal-700 text-white flex items-center justify-center border border-slate-700 shadow-md transition-colors cursor-pointer"
                  title="Banner trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-slate-800/90 hover:bg-teal-700 text-white flex items-center justify-center border border-slate-700 shadow-md transition-colors cursor-pointer"
                  title="Banner sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Indicators */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? "w-8 bg-teal-400"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                title={`Chuyển tới slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trust Stats Bar */}
      <div className="border-t border-white/10 bg-slate-900/60 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">
              50+
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              Bác sĩ & Chuyên gia hàng đầu
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">
              150.000+
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              Lượt khám bệnh nhân hài lòng
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">
              99.2%
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              Tỷ lệ hài lòng chất lượng dịch vụ
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">
              15+ Năm
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              Kinh nghiệm chăm sóc sức khỏe
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
