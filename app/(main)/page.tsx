import React from "react";
import { BannerSection } from "@/app/components/home/BannerSection";
import { PackageSection } from "@/app/components/home/PackageSection";
import { DoctorSection } from "@/app/components/home/DoctorSection";
import { ArticleSection } from "@/app/components/home/ArticleSection";

export const metadata = {
  title: "MediCare Clinic - Phòng Khám Đa Khoa & Đặt Lịch Khám Trực Tuyến",
  description:
    "Hệ thống phòng khám đa khoa tiêu chuẩn quốc tế. Cung cấp gói khám toàn diện, đội ngũ bác sĩ đầu ngành, cẩm nang sức khỏe và đặt lịch khám tiện lợi.",
};

export default function MainPage() {
  return (
    <div className="flex flex-col">
      {/* 1. Homepage Banners Carousel */}
      <BannerSection />

      {/* 2. Gói khám sức khỏe (Cho phép người dùng thêm gói khám vào giỏ hàng) */}
      <PackageSection />

      {/* 3. Bác sĩ tiêu biểu (Chỉ hiển thị hình ảnh và text, hoàn toàn không thao tác được) */}
      <DoctorSection />

      {/* 4. Các bài viết về sức khỏe */}
      <ArticleSection />
    </div>
  );
}