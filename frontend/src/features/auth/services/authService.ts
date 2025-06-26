import api from "@/lib/api";

export interface AuthPayload {
  email: string;
  password: string;
}

export const login = (data: AuthPayload) =>
  api.post("/auth/login", data);

export const register = (data: AuthPayload) =>
  api.post("/auth/register", data);

export const apiLogout = () =>
  api.post("/auth/logout");

export const validate = () =>
  api.get("/auth/validate");

