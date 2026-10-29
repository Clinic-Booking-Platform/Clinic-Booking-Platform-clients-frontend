"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { verifyPaymentReturnAPI } from "@/app/lib/clinic.api";
import { useCartStore } from "@/app/store/CartStore";

function PaymentResult() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Đang xác nhận kết quả thanh toán...");

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => { params[key] = value; });
      try {
        const result = await verifyPaymentReturnAPI(params);
        if (!active) return;
        if (result?.isSuccess || result?.data?.isSuccess) {
          clearCart();
          setStatus("success");
          setMessage(result?.message || result?.data?.message || "Thanh toán thành công");
        } else {
          setStatus("failed");
          setMessage(result?.message || result?.data?.message || "Thanh toán không thành công");
        }
      } catch {
        if (!active) return;
        setStatus("failed");
        setMessage("Không thể xác nhận kết quả thanh toán. Vui lòng kiểm tra lại đơn hàng.");
      }
    };
    verify();
    return () => { active = false; };
  }, [searchParams, clearCart]);

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {status === "loading" && <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-teal-700" />}
        {status === "success" && <CheckCircle2 className="mx-auto h-12 w-12 text-teal-600" />}
        {status === "failed" && <XCircle className="mx-auto h-12 w-12 text-rose-600" />}
        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          {status === "loading" ? "Đang xác nhận" : status === "success" ? "Thanh toán thành công" : "Thanh toán thất bại"}
        </h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <Link href="/profile" className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">
          Xem đơn hàng của tôi
        </Link>
      </div>
    </main>
  );
}

export default function VNPayReturnPage() {
  return <Suspense fallback={<main className="min-h-[70vh] bg-slate-50" />}><PaymentResult /></Suspense>;
}
