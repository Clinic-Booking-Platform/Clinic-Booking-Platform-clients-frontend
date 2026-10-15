import React from "react";
import { Header } from "@/app/components/common/header";
import { Footer } from "@/app/components/common/footer";
import { AppointmentModal } from "@/app/components/appointment/AppointmentModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Global Appointment Booking Modal triggered from Cart Popup */}
      <AppointmentModal />
    </div>
  );
}
