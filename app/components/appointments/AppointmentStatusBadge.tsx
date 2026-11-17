"use client";

import React from "react";
import { AppointmentStatus } from "@/app/types/appointment";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  size?: "sm" | "md";
}

export default function AppointmentStatusBadge({
  status,
  size = "md",
}: AppointmentStatusBadgeProps) {
  const normalizedStatus = String(status).toUpperCase();

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case "PENDING":
        return {
          label: "Chờ xác nhận",
          bg: "bg-amber-50",
          text: "text-amber-800",
          border: "border-amber-200/80",
          dot: "bg-amber-500",
          icon: Clock,
        };
      case "CONFIRMED":
        return {
          label: "Đã xác nhận",
          bg: "bg-teal-50",
          text: "text-teal-800",
          border: "border-teal-200/80",
          dot: "bg-teal-500",
          icon: CheckCircle2,
        };
      case "COMPLETED":
        return {
          label: "Đã hoàn thành",
          bg: "bg-emerald-50",
          text: "text-emerald-800",
          border: "border-emerald-200/80",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          label: "Đã hủy",
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200/80",
          dot: "bg-rose-500",
          icon: XCircle,
        };
      case "NO_SHOW":
        return {
          label: "Không đến khám",
          bg: "bg-slate-100",
          text: "text-slate-700",
          border: "border-slate-200",
          dot: "bg-slate-400",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          bg: "bg-slate-100",
          text: "text-slate-700",
          border: "border-slate-200",
          dot: "bg-slate-400",
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1 font-medium"
      : "text-xs px-2.5 py-1 gap-1.5 font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
      <span>{config.label}</span>
    </span>
  );
}

