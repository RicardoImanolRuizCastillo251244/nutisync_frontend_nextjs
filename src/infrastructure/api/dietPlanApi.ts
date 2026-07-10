import axiosClient from './axiosClient';

export interface SuggestRequest {
  caloriesTarget: number;
}

export const dietPlanApi = {
  generateSuggested: async (input: SuggestRequest) => {
    const { data } = await axiosClient.post(
      '/v1/meal-plans/generate-suggested',
      { caloriesTarget: input.caloriesTarget }
    );

    const meals = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return meals;
  },
};