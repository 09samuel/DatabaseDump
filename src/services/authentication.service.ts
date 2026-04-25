import { api } from "../lib/api"


export async function loginUser(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
}

export async function forgotPassword(email: string) {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
}

export async function registerUser(name: string, email: string, password: string) {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
}

export async function me() {
    const res = await api.get("/auth/me");
    return res.data;
}

export async function resetPassword(token: string, password: string) {
    const res = await api.post("/auth/reset-password", { token, password });
    return res.data;
}

export async function userInfo() {
    const res = await api.get("/auth/user/info");
    return res.data;
}