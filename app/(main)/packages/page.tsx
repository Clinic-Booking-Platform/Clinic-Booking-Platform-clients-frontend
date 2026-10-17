"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Package } from "@/app/types/Clinic";
import { getPackages } from "@/app/lib/clinic.api";
import { useCartStore } from "@/app/store/CartStore";
import {
  ShoppingBag,
  CheckCircle,
  Tag,
  CalendarCheck,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { userStore } from "@/app/store/AuthStore";
import { LoginRequiredModal } from "@/app/components/common/LoginRequiredModal";
import { Pagination } from "@/app/components/common/Pagination";

export default function PackagesPage() {
  const { token } = userStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;
  const [addingId, setAddingId] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    // Lấy tất cả các gói khám còn trạng thái hoạt động
    getPackages({ status: "active" })
      .then((res) => {
        if (res && res.length > 0) {
          setPackages(res);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceFilter]);

  const handleAddToCart = async (pkg: Package) => {
    const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!currentToken) {
      setShowLoginModal(true);
      return;
    }

    setAddingId(pkg.id);
    await addItem(pkg, 1);
    setTimeout(() => {
      setAddingId(null);
    }, 400);
  };

  const formatVND = (price: number | string) => {
    return Number(price || 0).toLocaleString("vi-VN") + " đ";
  };

  // Filter packages based on search and price
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchSearch =
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.description &&
          pkg.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const finalPrice = Number(pkg.discount_price ?? pkg.price);
      let matchPrice = true;
      if (priceFilter === "under-2m") {
        matchPrice = finalPrice < 2000000;
      } else if (priceFilter === "2m-3m") {
        matchPrice = finalPrice >= 2000000 && finalPrice <= 3000000;
      } else if (priceFilter === "over-3m") {
        matchPrice = finalPrice > 3000000;
      }

      return matchSearch && matchPrice;
    });
  }, [packages, searchTerm, priceFilter]);

  // Paginated items
  const totalPages = Math.ceil(filteredPackages.length / pageSize) || 1;
  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPackages.slice(start, start + pageSize);
  }, [filteredPackages, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Page Hero Header */}
      <div className="bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold backdrop-blur-xs">
            <Tag className="w-3.5 h-3.5 text-teal-400" />
            <span>Danh Mục Dịch Vụ Khám Y Khoa</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Gói Khám Sức Khỏe Toàn Diện
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Hệ thống gói khám được nghiên cứu bài bản bởi hội đồng chuyên gia y tế, giúp tầm soát sớm các bệnh lý tiềm ẩn với chi phí minh bạch và trang thiết bị hiện đại.
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
              placeholder="Tìm kiếm gói khám..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
            />
          </div>

          {/* Price Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
              <span>Khoảng giá:</span>
            </span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "under-2m", label: "Dưới 2 triệu" },
              { id: "2m-3m", label: "2 - 3 triệu" },
              { id: "over-3m", label: "Trên 3 triệu" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPriceFilter(f.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  priceFilter === f.id
                    ? "bg-teal-700 text-white shadow-xs font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse space-y-4"
              >
                <div className="w-full aspect-[16/10] bg-slate-200 rounded-2xl" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded w-full" />
                <div className="h-10 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Không tìm thấy gói khám phù hợp
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc giá.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setPriceFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
            >
              Xem tất cả gói khám
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedPackages.map((pkg) => {
              const price = Number(pkg.price);
              const discountPrice = pkg.discount_price
                ? Number(pkg.discount_price)
                : null;
              const hasDiscount = discountPrice !== null && discountPrice < price;
              const finalPrice = hasDiscount ? discountPrice! : price;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail Image Link */}
                    <Link
                      href={`/packages/${pkg.id}`}
                      className="block relative aspect-[16/10] overflow-hidden bg-slate-100"
                    >
                      {pkg.thumbnail_url ? (
                        <img
                          src={pkg.thumbnail_url}
                          alt={pkg.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600">
                          <ShoppingBag className="w-12 h-12 stroke-[1.2]" />
                        </div>
                      )}

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs">
                            Giảm {Math.round(((price - discountPrice!) / price) * 100)}%
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
                          Gói khám chuẩn y khoa
                        </span>
                        <Link href={`/packages/${pkg.id}`} className="block">
                          <h2 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-teal-700 transition-colors">
                            {pkg.name}
                          </h2>
                        </Link>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                        {pkg.description ||
                          "Gói khám kiểm tra toàn diện chức năng các cơ quan, xét nghiệm sinh hóa máu, nước tiểu và tư vấn phác đồ phòng bệnh."}
                      </p>

                      {/* Key Checklist */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Bác sĩ chuyên khoa trực tiếp thăm khám</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Hệ thống xét nghiệm tự động hóa tiêu chuẩn</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Bảo lưu và đối chiếu hồ sơ bệnh án trực tuyến</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="p-6 pt-0 space-y-4">
                    <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block mb-0.5">Chi phí trọn gói:</span>
                        <span className="text-xl font-bold text-teal-700">
                          {formatVND(finalPrice)}
                        </span>
                      </div>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatVND(price)}
                        </span>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        id={`btn-add-cart-${pkg.id}`}
                        onClick={() => handleAddToCart(pkg)}
                        disabled={addingId === pkg.id}
                        className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-teal-700/20 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{addingId === pkg.id ? "Đã thêm vào giỏ!" : "Thêm vào giỏ"}</span>
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
          totalItems={filteredPackages.length}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 350, behavior: "smooth" });
          }}
          itemName="gói khám"
        />
      </div>

      {/* Assurance banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-gradient-to-r from-teal-800 to-teal-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold">Cần Tư Vấn Gói Khám Phù Hợp Với Bạn?</h3>
            <p className="text-sm text-teal-100 max-w-xl">
              Đội ngũ điều dưỡng và chuyên gia y tế của MediCare sẵn sàng hỗ trợ bạn lựa chọn danh mục khám tối ưu theo độ tuổi và tiền sử bệnh lý.
            </p>
          </div>
          <a
            href="tel:19006868"
            className="px-7 py-3.5 rounded-xl bg-white text-teal-900 font-bold text-sm hover:bg-teal-50 transition-colors shadow-md shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Tổng đài tư vấn: 1900 6868</span>
          </a>
        </div>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
