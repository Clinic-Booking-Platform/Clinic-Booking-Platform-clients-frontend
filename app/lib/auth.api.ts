import { LoginReq, RegisterReq } from "../types/Auth";
import type { User } from "../store/AuthStore";
import api from "./api.clients";

export type LoginResponse = {
    access_token: string;
    user: User;
};

export type UpdateProfileRequest = {
    full_name?: string;
    phone_number?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    avatar?: string | null;
};

type ProfileApiResponse = {
    status?: string;
    data?: Omit<Partial<User>, "role"> & {
        role?: string | { name?: string } | null;
    };
};

type LoginApiResponse = LoginResponse | {
    status: string;
    data: LoginResponse;
};

export const login = async (data: LoginReq): Promise<LoginResponse> => {
    const res = await api.post<LoginApiResponse>("/login", data);
    const payload = "data" in res.data ? res.data.data : res.data;

    if (!payload.access_token || !payload.user) {
        throw new Error("Phản hồi đăng nhập không đúng định dạng.");
    }

    return payload;
}

export const getMyProfile = async (): Promise<Partial<User>> => {
    const res = await api.get<ProfileApiResponse>("/me");
    if (!res.data?.data) {
        throw new Error("Phản hồi hồ sơ cá nhân không đúng định dạng.");
    }

    const { role, ...profile } = res.data.data;
    return {
        ...profile,
        ...(typeof role === "string" ? { role } : role?.name ? { role: role.name } : {}),
    };
};

export const updateMyProfile = async (
    data: UpdateProfileRequest
): Promise<Partial<User>> => {
    const res = await api.put<ProfileApiResponse>("/me", data);
    if (!res.data?.data) {
        throw new Error("Phản hồi cập nhật hồ sơ không đúng định dạng.");
    }

    const { role, ...profile } = res.data.data;
    return {
        ...profile,
        ...(typeof role === "string" ? { role } : role?.name ? { role: role.name } : {}),
    };
};

export const uploadProfileAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<{
        status?: string;
        data?: { url?: string };
    }>("/upload/single", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    const url = res.data?.data?.url;

    if (!url) {
        throw new Error("Phản hồi tải ảnh không có đường dẫn ảnh.");
    }

    return url;
};

export const register = async (data: RegisterReq) => {
    const res = await api.post("/register", data);
    return res.data;
}