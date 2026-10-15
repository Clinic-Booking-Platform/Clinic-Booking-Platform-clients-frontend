"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X, Lock, LogIn, UserPlus } from "lucide-react";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
  message = "Bạn cần đăng nhập để thêm gói khám vào giỏ hàng và thực hiện quy trình mua gói khám.",
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
          <Lock className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">
            Yêu Cầu Đăng Nhập
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              router.push("/login");
            }}
            className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập ngay</span>
          </button>

          <button
            onClick={() => {
              onClose();
              router.push("/register");
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>Đăng ký tài khoản</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-1 text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer"
          >
            Tiếp tục xem (chưa thêm giỏ)
          </button>
        </div>
      </div>
    </div>
  );
};
