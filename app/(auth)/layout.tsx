import React from "react";
import Link from "next/link";
import { ArrowLeftIcon, HeartPulseIcon } from "../components/auth/AuthIcons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-50/70 text-slate-800 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Background subtle pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors py-1.5 px-3 rounded-lg hover:bg-white/80 border border-transparent hover:border-slate-200"
        >
          <ArrowLeftIcon size={16} />
          <span>Về trang chủ</span>
        </Link>

        {/* Clinic Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30">
            <HeartPulseIcon size={18} />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-base">
            MediCare
          </span>
        </Link>
      </header>

      {/* Centered Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full max-w-md mx-auto px-4 py-8 sm:py-12">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-20 w-full text-center py-4 text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} Nền tảng Đặt lịch Khám MediCare. Bảo mật
          thông tin y tế chuẩn HIPAA.
        </p>
      </footer>
    </div>
  );
}
