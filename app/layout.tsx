import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MediCare Clinic - Phòng Khám Đa Khoa & Đặt Lịch Khám Trực Tuyến",
    template: "%s | MediCare Clinic",
  },
  description:
    "Hệ thống phòng khám đa khoa tiêu chuẩn quốc tế MediCare Clinic. Đặt lịch khám bác sĩ chuyên khoa, gói tầm soát sức khỏe toàn diện và tư vấn y tế tận tâm.",
  keywords: [
    "MediCare Clinic",
    "phòng khám đa khoa",
    "đặt lịch khám",
    "bác sĩ chuyên khoa",
    "gói khám sức khỏe",
    "khám tổng quát",
  ],
  authors: [{ name: "MediCare Clinic" }],
  openGraph: {
    title: "MediCare Clinic - Phòng Khám Đa Khoa & Đặt Lịch Khám Trực Tuyến",
    description:
      "Hệ thống phòng khám đa khoa tiêu chuẩn quốc tế MediCare Clinic. Đặt lịch khám nhanh chóng, tiện lợi.",
    siteName: "MediCare Clinic",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
