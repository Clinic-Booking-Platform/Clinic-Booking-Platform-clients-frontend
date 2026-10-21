"use client";

import React, { ChangeEvent, useState } from "react";
import Link from "next/link";
import {
    MailIcon,
    LockIcon,
    EyeIcon,
    EyeOffIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    AlertCircleIcon,
} from "../../components/auth/AuthIcons";
import { login } from "@/app/lib/auth.api";
import { userStore } from "@/app/store/AuthStore";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    Card,
    CardInner,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { toast } from "react-toastify";
import axios from "axios";

interface FieldErrors {
    email?: string;
    password?: string;
    general?: string;
}

export default function LoginPage() {
    const { setLogin } = userStore();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const onLogin = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Tự động xóa lỗi của ô đang nhập khi người dùng gõ phím
        if (fieldErrors[name as "email" | "password"] || fieldErrors.general) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: undefined,
                general: undefined,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        try {
            setIsLoading(true);
            const res = await login(formData);
            setLogin(res.access_token, res.user);
            toast.success("Đăng nhập thành công")
            router.push("/");
        } catch (err: unknown) {
            const parsed: FieldErrors = {};

            if (axios.isAxiosError<{ message?: string | string[]; errors?: (string | { field?: string; message?: string })[] }>(err)) {
                const data = err.response?.data;

                // Gom tất cả tin nhắn lỗi từ backend (mảng strings hoặc mảng objects hoặc chuỗi đơn)
                let rawList: (string | { field?: string; message?: string })[] = [];
                if (Array.isArray(data?.message)) {
                    rawList = data.message;
                } else if (Array.isArray(data?.errors)) {
                    rawList = data.errors;
                } else if (typeof data?.message === "string") {
                    rawList = [data.message];
                }

                for (const item of rawList) {
                    let msg = "";
                    let field = "";

                    if (typeof item === "string") {
                        msg = item;
                        const lower = msg.toLowerCase();

                        // Nhận diện lỗi của trường Email: "Email không đúng định dạng (email)"
                        if (lower.includes("(email)") || lower.includes("email") || lower.includes("username")) {
                            field = "email";
                            msg = msg.replace(/\s*\(email\)\s*/gi, "").trim();
                        }
                        // Nhận diện lỗi của trường Password: "Mật khẩu phải có ít nhất 6 ký tự (password)"
                        else if (lower.includes("(password)") || lower.includes("mật khẩu") || lower.includes("password")) {
                            field = "password";
                            msg = msg.replace(/\s*\(password\)\s*/gi, "").trim();
                        }
                    } else if (typeof item === "object" && item !== null) {
                        field = item.field || "";
                        msg = item.message || "";
                    }

                    if (field === "email" && !parsed.email) {
                        parsed.email = msg;
                    } else if (field === "password" && !parsed.password) {
                        parsed.password = msg;
                    } else if (!field && msg && !parsed.general) {
                        parsed.general = msg;
                    }
                }

                // Nếu không gắn vào ô nào cụ thể (như 401 hoặc lỗi hệ thống)
                if (!parsed.email && !parsed.password) {
                    parsed.general =
                        parsed.general ||
                        (typeof data?.message === "string" ? data.message : "Đăng nhập không thành công. Vui lòng thử lại.");
                }
            } else {
                parsed.general = "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";
            }

            setFieldErrors(parsed);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Card>
                <CardInner>
                    <CardHeader>
                        <CardTitle>Đăng nhập</CardTitle>
                        <CardDescription>
                            Nhập email và mật khẩu của bạn để truy cập hồ sơ khám bệnh
                        </CardDescription>
                    </CardHeader>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Chỉ hiển thị banner thông báo khi có lỗi chung (ví dụ lỗi 401 / sai tài khoản mật khẩu) */}
                        {fieldErrors.general && (
                            <Alert variant="destructive">
                                <AlertCircleIcon size={16} className="text-rose-600 shrink-0" />
                                <AlertDescription className="text-rose-900 font-medium">
                                    {fieldErrors.general}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Email Field */}
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <MailIcon size={17} />
                                </div>
                                <Input
                                    name="email"
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={onLogin}
                                    hasError={!!fieldErrors.email}
                                    placeholder="name@example.com"
                                    className="pl-10"
                                />
                            </div>
                            {/* Hiển thị lỗi dưới chân input Email */}
                            {fieldErrors.email && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1.5">
                                    <AlertCircleIcon size={13} className="shrink-0 text-rose-500" />
                                    <span>{fieldErrors.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <LockIcon size={17} />
                                </div>
                                <Input
                                    name="password"
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={onLogin}
                                    hasError={!!fieldErrors.password}
                                    placeholder="Nhập mật khẩu"
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                                </button>
                            </div>
                            {/* Hiển thị lỗi dưới chân input Password */}
                            {fieldErrors.password && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1.5">
                                    <AlertCircleIcon size={13} className="shrink-0 text-rose-500" />
                                    <span>{fieldErrors.password}</span>
                                </p>
                            )}
                        </div>

                        {/* Primary Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex items-center justify-between"
                            >
                                <span>{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
                                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
                                    <ArrowRightIcon size={15} />
                                </div>
                            </Button>
                        </div>
                    </form>

                    {/* Register Prompt */}
                    <div className="mt-6 text-center text-xs text-slate-600">
                        <span>Chưa có tài khoản? </span>
                        <Link
                            href="/register"
                            className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>

                    {/* Footnote */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-600 text-[11px]">
                        <ShieldCheckIcon size={14} className="text-teal-600 shrink-0" />
                        <span>Bảo mật thông tin bệnh nhân theo tiêu chuẩn y tế</span>
                    </div>
                </CardInner>
            </Card>
        </div>
    );
}
