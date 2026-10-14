"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { userStore } from "@/app/store/AuthStore";
import { useCartStore } from "@/app/store/CartStore";
import { CartPopup } from "../cart/CartPopup";
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  HeartPulse,
  PhoneCall,
  PackageCheck,
} from "lucide-react";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, setLogout } = userStore();
  const { toggleCart, getTotalItems } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;
  const isLoggedIn = mounted && !!token && !!user;

  const handleLogout = () => {
    setLogout();
    setUserDropdownOpen(false);
    router.push("/");
  };

  const navLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Gói khám bệnh", href: "/packages" },
    { label: "Bác sĩ", href: "/doctors" },
    { label: "Cẩm nang y tế", href: "/articles" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        {/* Top announcement bar */}
        <div className="hidden md:flex items-center justify-between px-6 lg:px-12 py-1.5 bg-slate-900 text-slate-300 text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
              <span>Hotline 24/7: <strong className="text-white">1900 6868</strong></span>
            </span>
            <span className="text-slate-400">|</span>
            <span>Địa chỉ: 123 Đường Sức Khỏe, Quận 1, TP. Hồ Chí Minh</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-teal-400 flex items-center gap-1 font-medium">
              <HeartPulse className="w-3.5 h-3.5" /> Khám chữa bệnh uy tín - Chuẩn y khoa
            </span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-teal-700/25 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  MediCare
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-teal-100 text-teal-800 rounded-md">
                  CLINIC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Nền tảng đặt lịch khám chất lượng cao
              </p>
            </div>
          </Link>

          {/* Navigation Links (Desktop) - Switching between dedicated pages */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    active
                      ? "font-bold text-teal-800 bg-teal-50 border border-teal-200/60 shadow-2xs"
                      : "font-medium text-slate-600 hover:text-teal-700 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Function Actions on the right */}
          <div className="flex items-center gap-3">
            {/* Shopping Cart Button */}
            <button
              id="cart-popup-trigger-button"
              onClick={toggleCart}
              className="relative w-11 h-11 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-200 transition-all flex items-center justify-center cursor-pointer group"
              title="Xem giỏ hàng gói khám"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in duration-150">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account State */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.full_name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate hidden md:inline-block">
                    {user?.full_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-100 transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-sm py-2 px-3 rounded-xl transition-colors ${
                    active
                      ? "font-bold text-teal-800 bg-teal-50"
                      : "font-medium text-slate-600 hover:text-teal-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {!isLoggedIn && (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl text-xs font-semibold bg-teal-700 text-white"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Cart Popup Component */}
      <CartPopup />
    </>
  );
};
