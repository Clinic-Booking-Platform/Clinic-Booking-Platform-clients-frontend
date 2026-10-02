import { LoginReq, RegisterReq } from "../types/Auth";
import api from "./api.clients";

export const login = async (data: LoginReq) => {
    const res = await api.post("/login", data);
    return res.data;
}
export const register = async (data: RegisterReq) => {
    const res = await api.post("/register", data);
    return res.data;
}