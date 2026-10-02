"use client";

import React, { ChangeEvent, useState } from "react";
import Link from "next/link";
import {
    UserIcon,
    MailIcon,
    LockIcon,
    EyeIcon,
    EyeOffIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    AlertCircleIcon,
} from "../../components/auth/AuthIcons";
import { register } from "@/app/lib/auth.api";
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
    fullname?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const onRegister = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Tự động xóa lỗi của trường tương ứng khi người dùng gõ phím
        if (fieldErrors[name as keyof FieldErrors] || fieldErrors.general) {
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

        // Validate cơ bản phía client trước khi gửi
        const clientErrors: FieldErrors = {};
        if (!formData.fullname.trim()) {
            clientErrors.fullname = "Vui lòng nhập họ và tên của bạn.";
        }
        if (!formData.email.trim()) {
            clientErrors.email = "Vui lòng nhập địa chỉ email.";
        }
        if (!formData.password) {
            clientErrors.password = "Vui lòng nhập mật khẩu.";
        } else if (formData.password.length < 6) {
            clientErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }
        if (!formData.confirmPassword) {
            clientErrors.confirmPassword = "Vui lòng nhập lại mật khẩu xác nhận.";
        } else if (formData.password !== formData.confirmPassword) {
            clientErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp.";
        }

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            return;
        }

        try {
            setIsLoading(true);
            await register(formData);
            toast.success("Đăng ký thành công")
            router.push("/login");
        } catch (err: unknown) {
            const parsed: FieldErrors = {};

            if (axios.isAxiosError<{ message?: string | string[]; errors?: (string | { field?: string; message?: string })[] }>(err)) {
                const data = err.response?.data;

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

                        // Nhận diện lỗi của fullname: "fullname không được để trống (fullname)"
                        if (lower.includes("(fullname)") || lower.includes("fullname") || lower.includes("họ và tên") || lower.includes("tên")) {
                            field = "fullname";
                            msg = msg.replace(/\s*\(fullname\)\s*/gi, "").trim();
                        }
                        // Nhận diện lỗi của email: "Email không đúng định dạng (email)"
                        else if (lower.includes("(email)") || lower.includes("email") || lower.includes("username")) {
                            field = "email";
                            msg = msg.replace(/\s*\(email\)\s*/gi, "").trim();
                        }
                        // Nhận diện lỗi của confirmPassword: "(confirmpassword)"
                        else if (lower.includes("(confirmpassword)") || lower.includes("xác nhận") || lower.includes("confirmpassword")) {
                            field = "confirmPassword";
                            msg = msg.replace(/\s*\(confirmpassword\)\s*/gi, "").trim();
                        }
                        // Nhận diện lỗi của password: "(password)"
                        else if (lower.includes("(password)") || lower.includes("mật khẩu") || lower.includes("password")) {
                            field = "password";
                            msg = msg.replace(/\s*\(password\)\s*/gi, "").trim();
                        }
                    } else if (typeof item === "object" && item !== null) {
                        field = item.field || "";
                        msg = item.message || "";
                    }

                    if (field === "fullname" && !parsed.fullname) {
                        parsed.fullname = msg;
                    } else if (field === "email" && !parsed.email) {
                        parsed.email = msg;
                    } else if (field === "password" && !parsed.password) {
                        parsed.password = msg;
                    } else if (field === "confirmPassword" && !parsed.confirmPassword) {
                        parsed.confirmPassword = msg;
                    } else if (!field && msg && !parsed.general) {
                        parsed.general = msg;
                    }
                }

                // Nếu không gắn vào ô cụ thể
                if (!parsed.fullname && !parsed.email && !parsed.password && !parsed.confirmPassword) {
                    parsed.general =
                        parsed.general ||
                        (typeof data?.message === "string" ? data.message : "Đăng ký không thành công. Vui lòng thử lại.");
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
                        <CardTitle>Đăng ký tài khoản</CardTitle>
                        <CardDescription>
                            Tạo tài khoản bệnh nhân để đặt khám và quản lý lịch hẹn
                        </CardDescription>
                    </CardHeader>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Thông báo lỗi chung (nếu có lỗi hệ thống hoặc không theo field) */}
                        {fieldErrors.general && (
                            <Alert variant="destructive">
                                <AlertCircleIcon size={16} className="text-rose-600 shrink-0" />
                                <AlertDescription className="text-rose-900 font-medium">
                                    {fieldErrors.general}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Họ và tên Field */}
                        <div>
                            <Label htmlFor="fullname">Họ và tên</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <UserIcon size={17} />
                                </div>
                                <Input
                                    name="fullname"
                                    id="fullname"
                                    type="text"
                                    autoComplete="name"
                                    value={formData.fullname}
                                    onChange={onRegister}
                                    hasError={!!fieldErrors.fullname}
                                    placeholder="Nguyễn Văn A"
                                    className="pl-10"
                                />
                            </div>
                            {/* Lỗi dưới chân input Họ và tên */}
                            {fieldErrors.fullname && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1.5">
                                    <AlertCircleIcon size={13} className="shrink-0 text-rose-500" />
                                    <span>{fieldErrors.fullname}</span>
                                </p>
                            )}
                        </div>

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
                                    onChange={onRegister}
                                    hasError={!!fieldErrors.email}
                                    placeholder="name@example.com"
                                    className="pl-10"
                                />
                            </div>
                            {/* Lỗi dưới chân input Email */}
                            {fieldErrors.email && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1.5">
                                    <AlertCircleIcon size={13} className="shrink-0 text-rose-500" />
                                    <span>{fieldErrors.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Mật khẩu Field */}
                        <div>
                            <Label htmlFor="password">Mật khẩu</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <LockIcon size={17} />
                                </div>
                                <Input
                                    name="password"
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={onRegister}
                                    hasError={!!fieldErrors.password}
                                    placeholder="Tối thiểu 6 ký tự"
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
                            {/* Lỗi dưới chân input Password */}
                            {fieldErrors.password && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1.5">
                                    <AlertCircleIcon size={13} className="shrink-0 text-rose-500" />
                                    <span>{fieldErrors.password}</span>
                                </p>
                            )}
                        </div>

                        {/* Xác nhận Mật khẩu Field */}
                        <div>
                            <Label htmlFor="confirmPassword">Xác nhận lại mật khẩu</Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <LockIcon size={17} />
                                </div>
                                <Input
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
                                    onChange={onRegister}
                                    hasError={!!fieldErrors.confirmPassword}
                                    placeholder="Nhập lại mật khẩu"
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                                    aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showConfirmPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                                </button>
                            </div>
                            {/* Lỗi dưới chân input Confirm Password */}
                            {fieldErrors.confirmPassword && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1.5">
                                    <AlertCircleIcon size={13} className="shrink-0 text-rose-500" />
                                    <span>{fieldErrors.confirmPassword}</span>
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
                                <span>{isLoading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}</span>
                                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
                                    <ArrowRightIcon size={15} />
                                </div>
                            </Button>
                        </div>
                    </form>

                    {/* Login Prompt */}
                    <div className="mt-6 text-center text-xs text-slate-600">
                        <span>Đã có tài khoản? </span>
                        <Link
                            href="/login"
                            className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                        >
                            Đăng nhập ngay
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
