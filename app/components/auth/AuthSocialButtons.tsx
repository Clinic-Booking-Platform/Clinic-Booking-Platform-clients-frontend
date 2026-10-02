import React from "react";
import { GoogleIcon, ZaloIcon } from "./AuthIcons";

interface AuthSocialButtonsProps {
  onGoogleClick?: () => void;
  onZaloClick?: () => void;
  isLoading?: boolean;
}

export function AuthSocialButtons({
  onGoogleClick,
  onZaloClick,
  isLoading = false,
}: AuthSocialButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={isLoading}
        onClick={onGoogleClick}
        className="group relative flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-xs transition-all duration-200 active:scale-[0.98] hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GoogleIcon size={18} />
        <span>Google</span>
      </button>

      <button
        type="button"
        disabled={isLoading}
        onClick={onZaloClick}
        className="group relative flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-xs transition-all duration-200 active:scale-[0.98] hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ZaloIcon size={18} />
        <span>Zalo</span>
      </button>
    </div>
  );
}
