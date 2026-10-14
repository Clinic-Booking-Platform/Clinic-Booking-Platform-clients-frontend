"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package } from "@/app/types/Clinic";
import { getPackages } from "@/app/lib/clinic.api";
import { useCartStore } from "@/app/store/CartStore";
import {
  ShoppingBag,
  CheckCircle,
  Tag,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { userStore } from "@/app/store/AuthStore";
import { LoginRequiredModal } from "../common/LoginRequiredModal";

export const PackageSection: React.FC = () => {
  const { token } = userStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    getPackages({ status: "active" })
      .then((res) => {
        if (res && res.length > 0) {
          // Trang chủ: Chỉ lấy ra vài gói khám tiêu biểu (tối đa 4 gói)
          setPackages(res.slice(0, 4));
        }
      })
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <section id="packages" className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/60">
            <Tag className="w-3.5 h-3.5 text-teal-600" />
            <span>Chăm Sóc Toàn Diện</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Gói Khám Sức Khỏe Tiêu Biểu
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Các gói khám được thiết kế chuyên sâu bởi hội đồng y khoa, giúp tầm soát sớm các bệnh lý tiềm ẩn với chi phí tối ưu nhất.
          </p>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse space-y-4"
              >
                <div className="w-full aspect-[4/3] bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-10 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const price = Number(pkg.price);
              const discountPrice = pkg.discount_price
                ? Number(pkg.discount_price)
                : null;
              const hasDiscount = discountPrice !== null && discountPrice < price;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail Link */}
                    <Link
                      href={`/packages/${pkg.id}`}
                      className="block relative aspect-[4/3] overflow-hidden bg-slate-100"
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

                      {/* Discount badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-bold shadow-xs">
                            Tiết kiệm{" "}
                            {Math.round(((price - discountPrice!) / price) * 100)}%
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <Link href={`/packages/${pkg.id}`} className="block">
                        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
                          {pkg.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {pkg.description || "Gói khám bao gồm các xét nghiệm sinh hóa cơ bản và chẩn đoán hình ảnh chuyên sâu."}
                      </p>

                      {/* Highlights */}
                      <ul className="space-y-1.5 pt-2 text-xs text-slate-600">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Bác sĩ chuyên khoa trực tiếp khám</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Trả kết quả nhanh chóng, bảo mật</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="p-5 pt-0 space-y-3">
                    <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <div className="text-lg font-bold text-teal-700">
                          {formatVND(hasDiscount ? discountPrice! : price)}
                        </div>
                        {hasDiscount && (
                          <div className="text-xs text-slate-400 line-through">
                            {formatVND(price)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleAddToCart(pkg)}
                        disabled={addingId === pkg.id}
                        className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-teal-700/20 active:scale-[0.99] transition-all cursor-pointer"
                        title="Thêm gói khám vào giỏ hàng"
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

        {/* View all packages button */}
        <div className="mt-12 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-teal-600 text-teal-800 text-sm font-semibold hover:bg-teal-50 transition-colors shadow-2xs"
          >
            <span>Xem tất cả gói khám sức khỏe</span>
            <span className="text-teal-600">→</span>
          </Link>
        </div>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
};
