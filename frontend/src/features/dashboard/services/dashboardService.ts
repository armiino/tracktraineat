  import api from "@/lib/api";

  export const dashboardService = {

    async getCalorieCalculation() {
      const res = await api.post("/api/calculateProfile");
      return res.data; //bmr, tdee, totalCalories, totalProtein 
    },

  async generateMeals(data: {
      mealsPerDay: number;
      mealDistribution: number[];
      burned: number;
      dietType: string;
    }) {
      const res = await api.post("/api/mealplan", data);
      return res.data;
    },

    async getRecipeDetailById(spoonId: number) {
      const res = await api.get(`/api/recipes/${spoonId}`);
      return res.data;
    },

    async saveRecipeToProfile(spoonId: number) {
      const res = await api.post("/api/recipes/save", { spoonId });
      return res.data;
    },

  };
