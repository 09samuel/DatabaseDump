import { api } from "../lib/api"
import type { AuthMessageResponse, MeResponse, UserInfoResponse } from "../pages/Authentication/types"

export async function loginUser(email: string, password: string): Promise<AuthMessageResponse> {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
}

export async function forgotPassword(email: string): Promise<AuthMessageResponse> {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthMessageResponse> {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
}

export async function me(): Promise<MeResponse> {
    const res = await api.get("/auth/me");
    return res.data;
}

export async function resetPassword(token: string, password: string): Promise<AuthMessageResponse> {
    const res = await api.post("/auth/reset-password", { token, password });
    return res.data;
}

export async function userInfo(): Promise<UserInfoResponse> {
    const res = await api.get("/auth/user/info");
    return res.data;
}

export async function logout(): Promise<{message: string}> {
    const res = await api.post("/auth/logout");
    return res.data;
}