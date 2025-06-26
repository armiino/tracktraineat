import api from "@/lib/api";
import { CalculatePayload } from "../types/calculator";

export const calculatorService = {
  calculate: (data: CalculatePayload) => api.post("/api/calculate", data),
};
