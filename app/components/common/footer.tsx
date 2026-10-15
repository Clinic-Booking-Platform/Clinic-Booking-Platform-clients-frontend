import React from "react";
import Link from "next/link";
import {
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Brand and Clinic Intro */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                MediCare Clinic
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Hệ thống phòng khám đa khoa quốc tế ứng dụng công nghệ hiện đại, mang đến trải nghiệm thăm khám ân cần, chính xác và tiện lợi hàng đầu cho mọi người dân.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-xs text-teal-400 border border-slate-700/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Chuẩn Y Tế Quốc Tế</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-xs text-teal-400 border border-slate-700/60">
                <Award className="w-3.5 h-3.5" />
                <span>Bác Sĩ Đầu Ngành</span>
              </div>
            </div>
          </div>

          {/* Col 3: Dịch vụ & Gói khám */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">
              Dịch vụ y tế
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/packages" className="hover:text-teal-400 transition-colors">
                  Khám sức khỏe tổng quát
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-teal-400 transition-colors">
                  Tầm soát tim mạch chuyên sâu
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-teal-400 transition-colors">
                  Nội soi tiêu hóa không đau
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-teal-400 transition-colors">
                  Khám sức khỏe nhi khoa
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-teal-400 transition-colors">
                  Tất cả gói khám bệnh
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Liên kết nhanh */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">
              Thông tin hỗ trợ
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/doctors" className="hover:text-teal-400 transition-colors">
                  Đội ngũ bác sĩ
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-teal-400 transition-colors">
                  Cẩm nang & Bài viết sức khỏe
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Tra cứu lịch hẹn khám
                </Link>
              </li>
              <li>
                <span className="hover:text-teal-400 transition-colors cursor-pointer">
                  Chính sách bảo mật hồ sơ
                </span>
              </li>
              <li>
                <span className="hover:text-teal-400 transition-colors cursor-pointer">
                  Quy trình thanh toán VNPay
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Liên hệ & Giờ làm việc */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase">
              Liên hệ trực tiếp
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>123 Đường Sức Khỏe, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Hotline: <strong className="text-white">1900 6868</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>contact@medicare.vn</span>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-slate-800">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Giờ hoạt động:</p>
                  <p>Thứ 2 - Chủ Nhật: 07:30 - 20:00</p>
                  <p className="text-[11px] text-teal-400">(Khám cả ngày lễ và Tết)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Phòng khám Đa khoa MediCare. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
              Đã thông báo Bộ Y Tế
            </span>
            <span>•</span>
            <span>Giấy phép hoạt động số: 0458/SYT-GPHĐ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
