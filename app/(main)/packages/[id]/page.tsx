"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Package } from "@/app/types/Clinic";
import { getPackageById } from "@/app/lib/clinic.api";
import { useCartStore } from "@/app/store/CartStore";
import {
  ShoppingBag,
  CalendarCheck,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
  PhoneCall,
  Share2,
} from "lucide-react";
import { userStore } from "@/app/store/AuthStore";
import { LoginRequiredModal } from "@/app/components/common/LoginRequiredModal";

export default function PackageDetailPage() {
  const { token } = userStore();
  const params = useParams();
  const router = useRouter();
  const packageId = params?.id as string;

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    if (packageId) {
      setLoading(true);
      getPackageById(packageId)
        .then((res) => {
          setPkg(res);
        })
        .finally(() => setLoading(false));
    }
  }, [packageId]);

  const handleAddToCart = async () => {
    if (!pkg) return;

    const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!currentToken) {
      setShowLoginModal(true);
      return;
    }

    setAdding(true);
    await addItem(pkg, 1);
    setTimeout(() => {
      setAdding(false);
    }, 400);
  };

  const formatVND = (price: number | string) => {
    return Number(price || 0).toLocaleString("vi-VN") + " đ";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-slate-200 rounded-3xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-12 bg-slate-100 rounded w-full" />
            <div className="h-24 bg-slate-100 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Không tìm thấy thông tin gói khám
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Gói khám này có thể đã bị xóa hoặc tạm ngưng phục vụ.
        </p>
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh mục gói khám</span>
        </Link>
      </div>
    );
  }

  const price = Number(pkg.price);
  const discountPrice = pkg.discount_price ? Number(pkg.discount_price) : null;
  const hasDiscount = discountPrice !== null && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice! : price;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-teal-700 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/packages" className="hover:text-teal-700 transition-colors">
              Gói khám bệnh
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-xs">
              {pkg.name}
            </span>
          </div>

          <Link
            href="/packages"
            className="flex items-center gap-1 text-teal-700 hover:text-teal-800 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tất cả gói khám</span>
          </Link>
        </div>
      </div>

      {/* Main Detail Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Image */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-xs border border-slate-100">
                {pkg.thumbnail_url ? (
                  <img
                    src={pkg.thumbnail_url}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600">
                    <ShoppingBag className="w-16 h-16 stroke-[1.2]" />
                  </div>
                )}

                {hasDiscount && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md">
                      Tiết kiệm {Math.round(((price - discountPrice!) / price) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Chuẩn Y Tế Quốc Tế</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                  <Award className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Bác Sĩ Đầu Ngành</span>
                </div>
              </div>
            </div>

            {/* Right Information */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/60 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Gói Khám Chuyên Sâu</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {pkg.name}
                </h1>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  {pkg.description ||
                    "Kiểm tra và sàng lọc toàn diện sức khỏe với các xét nghiệm lâm sàng và cận lâm sàng hiện đại."}
                </p>
              </div>

              {/* Pricing Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50/80 to-slate-50 border border-teal-100 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">
                    Giá dịch vụ trọn gói (Đã bao gồm VAT & Tư vấn):
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-teal-700">
                      {formatVND(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatVND(price)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-teal-800 font-medium">
                  ✓ Không phát sinh chi phí phụ
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  id="btn-detail-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full h-13 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-base font-bold flex items-center justify-center gap-2.5 shadow-md shadow-teal-700/25 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{adding ? "Đang thêm vào giỏ..." : "Thêm vào giỏ hàng"}</span>
                </button>

                <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Quy trình Mua gói khám & Đặt lịch (Luồng 2):</span>
                    <p className="text-slate-600 mt-0.5">
                      1. Thêm gói vào giỏ hàng → 2. Thanh toán trực tuyến an toàn qua VNPay → 3. Đặt lịch khám và nhận link phòng khám trực tuyến (Jitsi Meet).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Hỗ trợ khám online qua Jitsi Meet hoặc trực tiếp tại phòng khám</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Detail HTML Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-teal-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Chi Tiết Danh Mục Các Hạng Mục Khám
            </h2>
          </div>

          {/* HTML Content Render */}
          {pkg.package_detail?.html_content ? (
            <div
              className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-4"
              dangerouslySetInnerHTML={{
                __html: pkg.package_detail.html_content,
              }}
            />
          ) : (
            <div className="space-y-4 text-sm text-slate-600">
              <p>Gói khám bao gồm đầy đủ các bước chuẩn đoán y khoa theo quy định của Bộ Y Tế:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Đo chỉ số sinh hiệu và khám thể lực tổng quát.</li>
                <li>Xét nghiệm công thức máu, đường huyết, mỡ máu, chức năng gan thận.</li>
                <li>Chẩn đoán hình ảnh: Chụp X-quang lồng ngực kỹ thuật số và siêu âm tổng quát.</li>
                <li>Bác sĩ chuyên khoa đọc kết quả và tư vấn chi tiết phác đồ chăm sóc sức khỏe.</li>
              </ul>
            </div>
          )}

          {/* Guidelines Box */}
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-900 space-y-2 mt-8">
            <h3 className="font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Hướng Dẫn Chuẩn Bị Trước Khi Đến Khám</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-amber-800/90 text-xs">
              <li>Nhịn ăn sáng ít nhất 6 - 8 tiếng trước khi làm xét nghiệm máu (chỉ được uống nước lọc).</li>
              <li>Không uống rượu bia, nước ngọt, cà phê, chất kích thích vào buổi tối trước ngày đi khám.</li>
              <li>Nên nhịn tiểu khoảng 1 giờ trước khi siêu âm ổ bụng hoặc tuyến tiền liệt để bàng quang căng vừa đủ.</li>
              <li>Mang theo các kết quả khám bệnh hoặc đơn thuốc đang sử dụng trong 3 tháng gần nhất nếu có.</li>
            </ul>
          </div>
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
