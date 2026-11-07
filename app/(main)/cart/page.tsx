"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CreditCard, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { checkoutCartAPI } from "@/app/lib/clinic.api";
import { useCartStore } from "@/app/store/CartStore";

const formatVND = (price: number | string) => `${Number(price || 0).toLocaleString("vi-VN")} đ`;

export default function CartPage() {
  const { items, loading, syncWithBackend, updateQuantity, removeItem, getTotalAmount, getTotalItems } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => { syncWithBackend(); }, [syncWithBackend]);

  const handleCheckout = async () => {
    setCheckoutError("");
    setIsCheckingOut(true);
    try {
      const result = await checkoutCartAPI();
      if (result.payment_url) {
        window.location.assign(result.payment_url);
        return;
      }
      throw new Error("Không nhận được liên kết thanh toán từ máy chủ");
    } catch (error: any) {
      setCheckoutError(error?.response?.data?.message || error?.message || "Không thể tạo thanh toán. Vui lòng thử lại.");
      setIsCheckingOut(false);
    }
  };

  const hasItems = items.length > 0;

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/packages" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700">
          <ArrowLeft className="h-4 w-4" /> Tiếp tục chọn gói khám
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Giỏ hàng gói khám</h1>

        {loading && <p className="mt-6 text-sm text-slate-500">Đang đồng bộ giỏ hàng...</p>}

        {!hasItems && !loading ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-teal-600" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">Giỏ hàng đang trống</h2>
            <p className="mt-2 text-sm text-slate-500">Hãy chọn gói khám phù hợp để bắt đầu đặt lịch.</p>
            <Link href="/packages" className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">Xem gói khám</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="space-y-3">
              {items.map((item) => {
                const unitPrice = Number(item.package?.discount_price ?? item.package?.price ?? item.price ?? 0);
                return (
                  <article key={item.package_id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <Link href={`/packages/${item.package_id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-teal-50" title={`Xem chi tiết ${item.package?.name}`}>
                      {item.package?.thumbnail_url ? <img src={item.package.thumbnail_url} alt={item.package.name} className="h-full w-full object-cover" /> :                       <div className="flex h-full items-center justify-center"><ShoppingBag className="h-8 w-8 text-teal-600" /></div>}                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <div><Link href={`/packages/${item.package_id}`} className="font-bold text-slate-900 hover:text-teal-700">{item.package?.name}</Link><p className="mt-1 text-sm font-bold text-teal-700">{formatVND(unitPrice)}</p></div>
                        <button onClick={() => removeItem(item.package_id)} className="h-9 w-9 text-slate-400 hover:text-rose-600" title="Xóa khỏi giỏ"><Trash2 className="mx-auto h-4 w-4" /></button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Số lượng</span>
                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                          <button disabled={item.quantity <= 1} onClick={() => updateQuantity(item.package_id, item.quantity - 1)} className="p-2 disabled:opacity-30" aria-label="Giảm số lượng"><Minus className="h-4 w-4" /></button>
                          <span className="min-w-10 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.package_id, item.quantity + 1)} className="p-2" aria-label="Tăng số lượng"><Plus className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Tóm tắt đơn hàng</h2>
              <div className="mt-4 space-y-3 border-y border-slate-100 py-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Tổng số lượng</span><span className="font-semibold">{getTotalItems()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span className="text-xl font-bold text-teal-700">{formatVND(getTotalAmount())}</span></div>
              </div>
              {checkoutError && <p role="alert" className="mt-4 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{checkoutError}</p>}
              <button type="button" disabled={isCheckingOut} onClick={handleCheckout} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 font-bold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70">
                <CreditCard className="h-5 w-5" /> {isCheckingOut ? "Đang tạo thanh toán..." : "Thanh toán qua VNPay"}
              </button>
              <p className="mt-3 flex gap-2 text-xs text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />Thanh toán an toàn và bảo mật.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
