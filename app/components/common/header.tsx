"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulse,
  PhoneCall,
  User as UserIcon,
  LogOut,
  CalendarDays,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Search,
  FileText,
} from "lucide-react";
import { userStore } from "../../store/AuthStore";

export const Header = () => {
  const pathname = usePathname();
  const { user, token, setLogout } = userStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect scroll for refined glass elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Chuyên khoa", href: "#specialties" },
    { label: "Quy trình khám", href: "#booking-flow" },
    { label: "Cẩm nang y khoa", href: "#articles" },
    { label: "Bác sĩ giỏi", href: "#doctors" },
  ];

  const handleLogout = () => {
    setLogout();
    setUserDropdownOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs py-3"
          : "bg-white/95 backdrop-blur-md border-b border-slate-100 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-600/25 group-hover:scale-105 transition-transform duration-300">
              <HeartPulse className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                Medi<span className="text-teal-600">Care</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                Phòng Khám Đa Khoa
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? "text-teal-700 bg-teal-50/80 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Island */}
          <div className="flex items-center gap-3">
            {/* Quick Hotline Pill (Desktop) */}
            <a
              href="tel:19006868"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200/60 transition-colors text-xs font-semibold"
            >
              <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                <PhoneCall className="w-3 h-3" />
              </div>
              <span>1900 6868</span>
            </a>

            {/* User Auth Section */}
            {mounted && token && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-teal-100">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.full_name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-tight max-w-[110px] truncate">
                      {user.full_name || "Khách hàng"}
                    </span>
                    <span className="text-[10px] text-teal-600 font-medium leading-none">
                      {user.role === "ADMIN" ? "Quản trị viên" : "Bệnh nhân"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-150 shadow-xl shadow-slate-200/50 p-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="font-semibold text-slate-800 truncate">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>

                    <Link
                      href="/my-appointments"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition-colors"
                    >
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      <span>Lịch khám đã đặt</span>
                    </Link>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-100/70 rounded-full transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] rounded-full shadow-sm shadow-teal-600/25 transition-all duration-200"
                >
                  <span>Đăng ký</span>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-6 border-t border-slate-100 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-base font-medium rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <a
                  href="tel:19006868"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold"
                >
                  <PhoneCall className="w-4 h-4 text-teal-600" />
                  <span>Tổng đài tư vấn: 1900 6868</span>
                </a>
                {mounted && !token && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center text-sm font-medium rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700"
                    >
                      Đăng ký ngay
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
