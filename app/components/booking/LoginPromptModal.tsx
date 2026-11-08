"use client";

import React from "react";
import Link from "next/link";
import { LogIn, ShieldAlert, ArrowRight, UserPlus } from "lucide-react";

interface LoginPromptModalProps {
  isOpen: boolean;
  redirectUrl: string;
}

export default function LoginPromptModal({
  isOpen,
  redirectUrl,
}: LoginPromptModalProps) {
  if (!isOpen) return null;

  const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(redirectUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all animate-in zoom-in-95 duration-200 p-6 sm:p-7 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-xs">
          <ShieldAlert className="w-8 h-8 text-teal-600" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Yêu cầu đăng nhập
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Để đảm bảo thông tin hồ sơ y tế và quản lý lịch hẹn khám bệnh chính xác, quý khách vui lòng đăng nhập trước khi thực hiện đặt lịch.
        </p>

        <div className="space-y-3">
          <Link
            href={loginUrl}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-md shadow-teal-700/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập ngay</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>

          <Link
            href={registerUrl}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Chưa có tài khoản? Đăng ký</span>
          </Link>

          <Link
            href="/"
            className="block text-xs text-slate-400 hover:text-slate-600 pt-2 transition-colors"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

