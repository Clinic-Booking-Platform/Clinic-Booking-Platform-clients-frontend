import { create } from 'zustand'
export type User = {
    id: number
    email: string,
    full_name: string,
    phone_number: string,
    avatar: string | null
    roleId: number
    role: string
}

type AuthStore = {
    token: string | null
    user: User | null
    setLogin: (token: string, user: User) => void
    setLogout: () => void
}
const getinitialUser = () => {
    if (typeof window === "undefined") {
        return {
            token: null,
            user: null
        };
    }
    try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        return {
            token: token || null,
            user: user ? JSON.parse(user) : null
        };
    } catch {
        return {
            token: null,
            user: null
        };
    }
};

const initialUser = getinitialUser();

export const userStore = create<AuthStore>()((set) => ({
    token: initialUser.token,
    user: initialUser.user,
    setLogin: (token: string, user: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        set({
            token,
            user
        });
    },
    setLogout() {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        set({
            token: null,
            user: null
        });
    },
}));

