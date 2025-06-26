import api from "@/lib/api";

export const savedRecipeService = {
  getAll: () => api.get("/api/saved"),
  delete: (spoonId: number) => api.delete(`/api/recipes/${spoonId}`),
};
