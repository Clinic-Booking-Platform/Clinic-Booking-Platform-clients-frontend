"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/app/store/CartStore";
import {
  X,
  Trash2,
  Plus,
  Minus,
  CalendarCheck,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export const CartPopup: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getTotalAmount,
    getTotalItems,
    syncWithBackend,
  } = useCartStore();

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        isCartOpen
      ) {
        closeCart();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const totalAmount = getTotalAmount();
  const totalItems = getTotalItems();
  const hasItems = items.length > 0;

  const formatVND = (price: number | string) => {
    return Number(price || 0).toLocaleString("vi-VN") + " đ";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={popupRef}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/60 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">
                  Giỏ hàng gói khám
                </h3>
                <p className="text-xs text-slate-500">
                  {hasItems ? `${totalItems} gói khám đã chọn` : "Chưa có gói khám"}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!hasItems ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h4 className="text-base font-semibold text-slate-800 mb-1">
                  Giỏ hàng của bạn đang trống
                </h4>
                <p className="text-sm text-slate-500 max-w-xs mb-6">
                  Bạn chưa thêm gói khám nào. Hãy khám phá các gói khám chất lượng cao của MediCare để chăm sóc sức khỏe.
                </p>
                <a
                  href="#packages"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors shadow-sm shadow-teal-700/20"
                >
                  <span>Khám phá gói khám</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const unitPrice = Number(
                    item.package.discount_price ?? item.package.price ?? item.price ?? 0
                  );
                  const originalPrice = item.package.discount_price
                    ? Number(item.package.price)
                    : null;

                  return (
                    <div
                      key={item.package_id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-teal-200 transition-all shadow-xs flex gap-3.5"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {item.package.thumbnail_url ? (
                          <img
                            src={item.package.thumbnail_url}
                            alt={item.package.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-teal-600 bg-teal-50">
                            <ShoppingBag className="w-7 h-7" />
                          </div>
                        )}
                      </div>

                      {/* Info & Actions */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-semibold text-slate-800 text-sm line-clamp-1">
                              {item.package.name}
                            </h5>
                            <button
                              onClick={() => removeItem(item.package_id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              title="Xóa khỏi giỏ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-teal-700 font-bold text-sm">
                              {formatVND(unitPrice)}
                            </span>
                            {originalPrice && originalPrice > unitPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatVND(originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                          <span className="text-xs text-slate-500">Số lượng:</span>
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200/60">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.package_id, item.quantity - 1);
                                }
                              }}
                              disabled={item.quantity <= 1}
                              className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                                item.quantity <= 1
                                  ? "text-slate-300 opacity-40 cursor-not-allowed"
                                  : "text-slate-600 hover:bg-white hover:shadow-xs cursor-pointer"
                              }`}
                              title={item.quantity <= 1 ? "Số lượng tối thiểu là 1" : "Giảm số lượng"}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-semibold px-1 text-slate-800 min-w-[18px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.package_id, item.quantity + 1)
                              }
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with Checkout / Book Appointment */}
          {hasItems && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/70 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Tổng số gói khám:</span>
                  <span className="font-medium text-slate-800">{totalItems}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-slate-800 font-medium">Tạm tính:</span>
                  <span className="text-xl font-bold text-teal-700">
                    {formatVND(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Nút thanh toán VNPay (hiển thị giao diện, chưa kích hoạt chức năng) */}
              <div className="space-y-2 pt-1">
                <button
                  id="btn-checkout-vnpay-cart"
                  type="button"
                  onClick={() => {
                    // Chưa thực hiện chức năng thanh toán qua VNPay theo yêu cầu
                  }}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <CreditCard className="w-5 h-5 text-teal-200" />
                  <span>Thanh toán qua VNPay</span>
                </button>
                <p className="text-[11px] text-center text-slate-500">
                  Thanh toán trước để nhận lượt khám & Đặt lịch tư vấn trực tuyến (Jitsi Meet)
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Cam kết bảo mật thông tin & Hỗ trợ tư vấn y tế 24/7</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
