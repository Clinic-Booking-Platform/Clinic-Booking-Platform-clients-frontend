"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HeartPulse,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  Send,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800/80">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Bảo Mật Chuẩn Y Tế</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Hồ sơ bệnh án và lịch sử thăm khám được mã hóa bảo mật theo chuẩn HIPAA quốc tế.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Bác Sĩ Đầu Ngành</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                100% chuyên gia có chứng chỉ hành nghề, công tác tại các bệnh viện tuyến đầu.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Không Chờ Đợi</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Chọn đúng khung giờ khám, tiếp đón ưu tiên và tiết kiệm tối đa thời gian của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 py-12 border-b border-slate-800/80">
          {/* Col 1: Brand & About */}
          <div className="lg:col-span-2 flex flex-col">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
                <HeartPulse className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Medi<span className="text-teal-400">Care</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed pr-4 mb-6">
              Hệ thống kết nối người bệnh với mạng lưới bác sĩ chuyên khoa và cơ sở y tế uy tín hàng đầu. Cam kết trải nghiệm khám chữa bệnh chu đáo, văn minh và tận tâm.
            </p>

            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Số 120 Hoàng Hoa Thám, Quận Ba Đình, TP. Hà Nội</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="tel:19006868" className="hover:text-teal-300 font-semibold text-slate-200">
                  Hotline đặt khám: 1900 6868 (24/7)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="mailto:support@medicare.vn" className="hover:text-teal-300">
                  support@medicare.vn
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Chuyên Khoa */}
          <div>
            <h5 className="font-semibold text-white text-sm mb-4 tracking-wide uppercase">
              Chuyên Khoa
            </h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#specialties" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Sản - Phụ khoa
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Răng Hàm Mặt
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Tai Mũi Họng
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Tim mạch can thiệp
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Cơ Xương Khớp
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Dịch vụ & Tiện ích */}
          <div>
            <h5 className="font-semibold text-white text-sm mb-4 tracking-wide uppercase">
              Dịch Vụ Khám
            </h5>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#booking-flow" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Đặt khám theo Bác sĩ
                </a>
              </li>
              <li>
                <a href="#booking-flow" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Gói khám tổng quát
                </a>
              </li>
              <li>
                <a href="#booking-flow" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Tầm soát ung thư
                </a>
              </li>
              <li>
                <a href="#articles" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Cẩm nang sức khỏe
                </a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500/70" />
                  Danh bạ chuyên gia
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h5 className="font-semibold text-white text-sm mb-4 tracking-wide uppercase">
              Bản Tin Y Khoa
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Đăng ký để nhận kiến thức phòng bệnh và lịch khám ưu đãi định kỳ.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg flex items-center justify-center transition-colors text-xs font-semibold"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Cam kết không gửi thư rác.
              </span>
            </form>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} MediCare Platform. Giấy phép hoạt động khám chữa bệnh số 0489/BYT-GPHĐ.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Điều khoản dịch vụ</span>
            <span className="hover:text-slate-400 cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-slate-400 cursor-pointer">Quy chế hoạt động</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
