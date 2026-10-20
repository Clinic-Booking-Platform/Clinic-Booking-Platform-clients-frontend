"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ImagePlus,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import axios from "axios";
import { Input } from "@/app/components/ui/input";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileAvatar,
} from "@/app/lib/auth.api";
import { getUserAppointmentsAPI } from "@/app/lib/clinic.api";
import { userStore } from "@/app/store/AuthStore";
import type { Appointment } from "@/app/types/Clinic";

type ProfileFormData = {
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  avatar: string;
};

const subscribeToHydration = () => () => {};
const getHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function sortAppointmentsByDate(appointments: Appointment[]) {
  return [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

const statusLabels: Record<Appointment["status"], string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Không đến",
};

const statusStyles: Record<Appointment["status"], string> = {
  PENDING: "bg-amber-50 text-amber-800",
  CONFIRMED: "bg-teal-50 text-teal-800",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  NO_SHOW: "bg-slate-100 text-slate-600",
};

function formatAppointmentDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateOfBirth(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatGender(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  if (value.toUpperCase() === "MALE") return "Nam";
  if (value.toUpperCase() === "FEMALE") return "Nữ";
  return value;
}

function getProfileFormData(user: {
  full_name: string;
  phone_number: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  avatar: string | null;
}): ProfileFormData {
  const gender = user.gender?.toUpperCase();

  return {
    full_name: user.full_name,
    phone_number: user.phone_number ?? "",
    date_of_birth: user.date_of_birth?.slice(0, 10) ?? "",
    gender: gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : user.gender ?? "",
    avatar: user.avatar ?? "",
  };
}

function getProfileErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string; errors?: Array<{ message?: string }> }>(error)) {
    const response = error.response?.data;
    return (
      response?.errors?.find((item) => item.message)?.message ??
      response?.message ??
      "Không thể cập nhật hồ sơ. Vui lòng thử lại."
    );
  }

  return error instanceof Error
    ? error.message
    : "Không thể cập nhật hồ sơ. Vui lòng thử lại.";
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const status = statusLabels[appointment.status] ? appointment.status : "PENDING";
  const doctorName = appointment.doctor?.user.full_name ?? "Thông tin bác sĩ đang được cập nhật";

  return (
    <article className="flex flex-col gap-4 border-b border-slate-100 py-5 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Stethoscope className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{doctorName}</p>
          <p className="mt-1 truncate text-sm text-slate-500">
            {appointment.package?.name ?? appointment.doctor?.specialty?.name ?? "Lịch khám"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatAppointmentDate(appointment.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {appointment.time_type}
            </span>
          </div>
        </div>
      </div>
      <span
        className={`w-fit shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold ${statusStyles[status]}`}
      >
        {statusLabels[status]}
      </span>
    </article>
  );
}

export default function ProfilePage() {
  const { user, token, updateUser } = userStore();
  const isReady = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileError, setProfileError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    full_name: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    avatar: "",
  });

  useEffect(() => {
    if (!avatarPreview?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  useEffect(() => {
    if (!isReady || !token) return;

    let isCurrent = true;
    getMyProfile()
      .then((profile) => {
        if (isCurrent) updateUser(profile);
      })
      .catch((error: unknown) => {
        console.error("Unable to load current user profile", error);
      });

    return () => {
      isCurrent = false;
    };
  }, [isReady, token, updateUser]);

  useEffect(() => {
    if (!isReady || !token || !user) return;

    let isCurrent = true;

    Promise.resolve()
      .then(() => {
        if (isCurrent) setIsLoadingAppointments(true);
        return getUserAppointmentsAPI();
      })
      .then((results) => {
        if (isCurrent) {
          setAppointments(sortAppointmentsByDate(results));
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load profile appointments", error);
        if (isCurrent) setAppointmentsError(true);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingAppointments(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isReady, token, user]);

  if (!isReady) {
    return (
      <div className="min-h-[60vh] bg-[#f6f8f7] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
          <div className="h-52 rounded-[28px] bg-slate-200" />
          <div className="h-72 rounded-[28px] bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <section className="flex min-h-[58vh] items-center bg-[#f6f8f7] px-4 py-16 sm:px-6">
        <div className="mx-auto w-full max-w-xl rounded-[28px] border border-slate-200/80 bg-white p-8 text-center shadow-[0_20px_60px_-40px_rgba(15,23,42,0.28)] sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-teal-50 text-teal-700">
            <UserRound className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Hồ sơ khách hàng
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Đăng nhập để xem hồ sơ
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Thông tin cá nhân và lịch hẹn của bạn được lưu trong tài khoản MediCare.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.98]"
          >
            Đăng nhập tài khoản
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  const firstName = user.full_name.trim().split(/\s+/).at(-1) || user.full_name;
  const initials = user.full_name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const visibleAppointments = showAllAppointments
    ? appointments
    : appointments.slice(0, 4);

  const handleEditProfile = () => {
    setProfileForm(getProfileFormData(user));
    setAvatarPreview(null);
    setProfileError("");
    setIsEditingProfile(true);
  };

  const handleAvatarSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Vui lòng chọn một tệp hình ảnh.");
      return;
    }

    setProfileError("");
    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingAvatar(true);

    try {
      const avatarUrl = await uploadProfileAvatar(file);
      setProfileForm((form) => ({ ...form, avatar: avatarUrl }));
      setAvatarPreview(null);
    } catch (error: unknown) {
      console.error("Unable to upload profile avatar", error);
      setProfileError(getProfileErrorMessage(error));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isUploadingAvatar) return;
    const fullName = profileForm.full_name.trim();
    if (!fullName) {
      setProfileError("Vui lòng nhập họ và tên.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");

    const payload = {
      full_name: fullName,
      phone_number: profileForm.phone_number.trim() || null,
      date_of_birth: profileForm.date_of_birth || null,
      gender: profileForm.gender || null,
      avatar: profileForm.avatar.trim() || null,
    };

    try {
      const updatedProfile = await updateMyProfile(payload);
      updateUser({ ...payload, ...updatedProfile });
      setIsEditingProfile(false);
    } catch (error: unknown) {
      console.error("Unable to update current user profile", error);
      setProfileError(getProfileErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <nav aria-label="Đường dẫn" className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="transition hover:text-teal-700">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium text-slate-800">Hồ sơ cá nhân</span>
        </nav>

        <header className="relative overflow-hidden rounded-[28px] bg-[#123b39] px-6 py-8 text-white sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-20 h-56 w-56 rounded-full border border-white/10" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[24px] bg-[#d7eee6] text-xl font-bold tracking-wide text-[#15534b] ring-4 ring-white/10">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={`Ảnh đại diện của ${user.full_name}`}
                    width={72}
                    height={72}
                    className="h-full w-full rounded-[20px] object-cover"
                    unoptimized
                  />
                ) : (
                  initials || "KH"
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-teal-100">Xin chào, {firstName}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Hồ sơ cá nhân
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Quản lý thông tin và theo dõi lịch khám của bạn.
                </p>
              </div>
            </div>
            <a
              href="#appointments"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Xem lịch hẹn
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
          <main className="space-y-6">
            <section
              aria-labelledby="personal-info-title"
              className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.3)] sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                    Tài khoản của bạn
                  </p>
                  <h2 id="personal-info-title" className="mt-2 text-xl font-semibold text-slate-900">
                    Thông tin cá nhân
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {user.role || "Tài khoản khách hàng"}
                  </span>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="pt-5">
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    <label className="space-y-2 text-xs font-medium text-slate-600">
                      Họ và tên
                      <Input
                        autoComplete="name"
                        maxLength={100}
                        required
                        value={profileForm.full_name}
                        onChange={(event) =>
                          setProfileForm((form) => ({ ...form, full_name: event.target.value }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-xs font-medium text-slate-600">
                      Email
                      <Input value={user.email} disabled readOnly />
                      <span className="block text-[11px] font-normal text-slate-400">
                        Email không thể thay đổi tại đây.
                      </span>
                    </label>
                    <label className="space-y-2 text-xs font-medium text-slate-600">
                      Số điện thoại
                      <Input
                        type="tel"
                        autoComplete="tel"
                        value={profileForm.phone_number}
                        onChange={(event) =>
                          setProfileForm((form) => ({ ...form, phone_number: event.target.value }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-xs font-medium text-slate-600">
                      Ngày sinh
                      <Input
                        type="date"
                        autoComplete="bday"
                        value={profileForm.date_of_birth}
                        onChange={(event) =>
                          setProfileForm((form) => ({ ...form, date_of_birth: event.target.value }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-xs font-medium text-slate-600">
                      Giới tính
                      <Input
                        value={profileForm.gender}
                        placeholder="Ví dụ: Nam"
                        onChange={(event) =>
                          setProfileForm((form) => ({ ...form, gender: event.target.value }))
                        }
                      />
                    </label>
                    <label className="space-y-2 text-xs font-medium text-slate-600">
                      Ảnh đại diện
                      <span className="flex items-center gap-4 rounded-xl border border-slate-200 p-3">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-50 text-teal-800">
                          {avatarPreview || profileForm.avatar ? (
                            <Image
                              src={avatarPreview || profileForm.avatar}
                              alt="Ảnh đại diện xem trước"
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <UserRound className="h-6 w-6" aria-hidden="true" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleAvatarSelect}
                            aria-label="Chọn ảnh đại diện"
                          />
                          <button
                            type="button"
                            disabled={isUploadingAvatar || isSavingProfile}
                            onClick={() => avatarInputRef.current?.click()}
                            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-60"
                          >
                            {isUploadingAvatar ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <ImagePlus className="h-4 w-4" aria-hidden="true" />
                            )}
                            {isUploadingAvatar ? "Đang tải ảnh..." : "Chọn ảnh"}
                          </button>
                          <span className="mt-1.5 block text-[11px] font-normal text-slate-400">
                            Ảnh sẽ được tải lên và lưu khi nhấn “Lưu thay đổi”.
                          </span>
                        </span>
                      </span>
                    </label>
                    <label className="space-y-2 text-xs font-medium text-slate-600">
                      URL ảnh đại diện (tùy chọn)
                      <Input
                        type="url"
                        value={profileForm.avatar}
                        placeholder="Hoặc nhập https://..."
                        onChange={(event) => {
                          setAvatarPreview(null);
                          setProfileForm((form) => ({ ...form, avatar: event.target.value }));
                        }}
                      />
                    </label>
                  </div>

                  {profileError && (
                    <p
                      role="alert"
                      className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                    >
                      {profileError}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      disabled={isSavingProfile}
                      onClick={() => {
                        setProfileError("");
                        setIsEditingProfile(false);
                      }}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProfile || isUploadingAvatar}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                    >
                      {isSavingProfile ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Save className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <dl className="grid gap-x-8 sm:grid-cols-2">
                    <div className="border-b border-slate-100 py-5">
                      <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        Họ và tên
                      </dt>
                      <dd className="mt-2 pl-6 text-sm font-semibold text-slate-900">
                        {user.full_name || "Chưa cập nhật"}
                      </dd>
                    </div>
                    <div className="border-b border-slate-100 py-5">
                      <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        Ngày sinh
                      </dt>
                      <dd className="mt-2 pl-6 text-sm font-semibold text-slate-900">
                        {formatDateOfBirth(user.date_of_birth)}
                      </dd>
                    </div>
                    <div className="border-b border-slate-100 py-5">
                      <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        Email
                      </dt>
                      <dd className="mt-2 break-all pl-6 text-sm font-semibold text-slate-900">
                        {user.email || "Chưa cập nhật"}
                      </dd>
                    </div>
                    <div className="border-b border-slate-100 py-5">
                      <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        Số điện thoại
                      </dt>
                      <dd className="mt-2 pl-6 text-sm font-semibold text-slate-900">
                        {user.phone_number || "Chưa cập nhật"}
                      </dd>
                    </div>
                    <div className="border-b border-slate-100 py-5 sm:border-b-0">
                      <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        Giới tính
                      </dt>
                      <dd className="mt-2 pl-6 text-sm font-semibold text-slate-900">
                        {formatGender(user.gender)}
                      </dd>
                    </div>
                    <div className="py-5">
                      <dt className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        Mã tài khoản
                      </dt>
                      <dd className="mt-2 pl-6 text-sm font-semibold tabular-nums text-slate-900">
                        MC-{user.id}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-1 rounded-xl bg-[#f6f8f7] px-4 py-3 text-xs leading-5 text-slate-500">
                    Cập nhật thông tin để hồ sơ và lịch hẹn của bạn luôn chính xác.
                  </p>
                </>
              )}
            </section>

            <section
              id="appointments"
              aria-labelledby="appointments-title"
              className="scroll-mt-28 rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.3)] sm:p-8"
            >
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                    Chăm sóc sức khỏe
                  </p>
                  <h2 id="appointments-title" className="mt-2 text-xl font-semibold text-slate-900">
                    Lịch hẹn của tôi
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Theo dõi các cuộc hẹn khám gần đây.
                  </p>
                </div>
                <Link
                  href="/doctors"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 transition hover:text-teal-950"
                >
                  Đặt lịch khám
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {appointmentsError ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-rose-700">
                    Không thể tải lịch hẹn lúc này.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAppointmentsError(false);
                      setIsLoadingAppointments(true);
                      getUserAppointmentsAPI()
                        .then((results) => setAppointments(sortAppointmentsByDate(results)))
                        .catch((error: unknown) => {
                          console.error("Unable to reload profile appointments", error);
                          setAppointmentsError(true);
                        })
                        .finally(() => setIsLoadingAppointments(false));
                    }}
                    className="mt-2 rounded-lg text-sm font-semibold text-teal-800 transition hover:text-teal-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                  >
                    Thử tải lại
                  </button>
                </div>
              ) : isLoadingAppointments ? (
                <div className="space-y-4 py-6" aria-label="Đang tải lịch hẹn">
                  {[0, 1].map((item) => (
                    <div key={item} className="flex animate-pulse gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-slate-100" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 w-1/3 rounded bg-slate-100" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : appointments.length ? (
                <>
                  <div>
                    {visibleAppointments.map((appointment) => (
                      <AppointmentRow key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                  {appointments.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllAppointments((value) => !value)}
                      className="mt-5 rounded-lg text-sm font-semibold text-teal-800 transition hover:text-teal-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                    >
                      {showAllAppointments ? "Thu gọn lịch hẹn" : "Xem tất cả lịch hẹn"}
                    </button>
                  )}
                </>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-50 text-slate-500">
                    <CalendarDays className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">Chưa có lịch hẹn nào</h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                    Lịch khám đã đặt sẽ xuất hiện tại đây để bạn tiện theo dõi.
                  </p>
                  <Link
                    href="/doctors"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.98]"
                  >
                    Tìm bác sĩ
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </section>
          </main>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[24px] border border-[#d5e9e2] bg-[#eaf4f0] p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-800">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Thông tin của bạn được bảo vệ
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hồ sơ tài khoản giúp chúng tôi hỗ trợ đặt lịch và chăm sóc bạn tốt hơn.
              </p>
              <div className="mt-5 flex items-start gap-2.5 border-t border-[#d3e5df] pt-4 text-xs leading-5 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-800" aria-hidden="true" />
                <span>Cần hỗ trợ? Gọi hotline MediCare: <strong className="text-slate-800">1900 6868</strong></span>
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.3)]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                Bắt đầu chăm sóc
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">
                Bạn cần thăm khám?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tìm bác sĩ phù hợp và chọn thời gian khám thuận tiện cho bạn.
              </p>
              <Link
                href="/doctors"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:text-teal-950"
              >
                Khám phá đội ngũ bác sĩ
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
