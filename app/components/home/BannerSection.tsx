"use client";

import React, { useState, useEffect } from "react";
import { Banner } from "@/app/types/Clinic";
import { getBanners, MOCK_BANNERS } from "@/app/lib/clinic.api";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Activity,
  PhoneCall,
  Sparkles,
  Image as ImageIcon
} from "lucide-react";
import QuickBookingCard from "@/app/components/booking/QuickBookingCard";

export const BannerSection: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Tải danh sách Banner trực tiếp từ Database
  useEffect(() => {
    getBanners().then((res) => {
      if (res && res.length > 0) {
        setBanners(res);
      }
    });
  }, []);

  // Tự động xoay vòng banner mỗi 6 giây
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

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
      className="relative bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 text-white overflow-hidden py-10 sm:py-14 lg:py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Banner Image with medical theme overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={currentBanner.image_url}
          alt={currentBanner.title}
          className="w-full h-full object-cover object-center opacity-25 filter blur-xs scale-105 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/95 via-slate-900/90 to-slate-950/95" />
      </div>

      {/* Decorative ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left: Banner information & Real Banner Image from DB (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Phòng Khám Đa Khoa Chuẩn Quốc Tế MediCare</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight min-h-[56px] flex items-center">
              {currentBanner.title}
            </h1>

            {/* Ảnh Banner thực tế hiển thị từ Database */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/8] sm:aspect-[16/7] border border-white/20 shadow-2xl group bg-slate-800">
              <img
                src={currentBanner.image_url}
                alt={currentBanner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="font-semibold text-teal-300 flex items-center gap-1.5 truncate max-w-[70%]">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{currentBanner.title}</span>
                </span>
                <span className="bg-teal-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-teal-200 border border-teal-500/40 shrink-0">
                  Banner #{currentBanner.id}
                </span>
              </div>
            </div>

            {/* Quick Micro-assurances */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-xs">
                <Award className="w-4 h-4 text-teal-400" /> 100% Bác sĩ Chuyên khoa
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-xs">
                <Activity className="w-4 h-4 text-teal-400" /> Máy móc xét nghiệm tự động
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-xs">
                <PhoneCall className="w-4 h-4 text-teal-400" /> Hotline 1900 6868
              </span>
            </div>

            {/* Banner Slider Controls & Indicators */}
            {banners.length > 1 && (
              <div className="pt-1 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-teal-600 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                    title="Banner trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-teal-600 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                    title="Banner sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentIndex === idx ? "w-6 bg-teal-400" : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                      title={`Chuyển tới slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Booking Card (5 cols) - Đồng bộ màu sắc với Banner */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative z-20">
            <QuickBookingCard />
          </div>

        </div>
      </div>
    </section>
  );
};

export default BannerSection;
