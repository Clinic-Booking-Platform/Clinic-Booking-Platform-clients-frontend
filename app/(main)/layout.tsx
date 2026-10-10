import React from "react";
import { Header } from "../components/common/header";
import { Footer } from "../components/common/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 selection:bg-teal-500 selection:text-white">
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </div>
  );
}
