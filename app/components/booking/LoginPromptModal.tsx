"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { LogIn, ShieldAlert, ArrowRight, UserPlus, X } from "lucide-react";

interface LoginPromptModalProps {
  isOpen: boolean;
  redirectUrl: string;
  onClose?: () => void;
}

export default function LoginPromptModal({
  isOpen,
  redirectUrl,
  onClose,
}: LoginPromptModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(redirectUrl)}`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fullscreen Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all p-6 sm:p-7 text-center">
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        )}

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

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="block w-full text-center text-xs text-slate-400 hover:text-slate-600 pt-2 transition-colors cursor-pointer"
            >
              Để sau, tiếp tục xem
            </button>
          ) : (
            <Link
              href="/"
              className="block text-xs text-slate-400 hover:text-slate-600 pt-2 transition-colors"
            >
              Quay về trang chủ
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
