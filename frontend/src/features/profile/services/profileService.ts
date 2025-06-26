import api from "@/lib/api";
import { UserProfile } from "../types/UserProfile";

export const fetchProfile = () => api.get("/api/profile");

export const updateProfile = (data: UserProfile) =>
  api.put("/api/profile", data);

export const createProfile = (data: UserProfile) =>
  api.post("/api/profile", data);

export const calculateProfile = () => api.post("/api/calculateProfile");
