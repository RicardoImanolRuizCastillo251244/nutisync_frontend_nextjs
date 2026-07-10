import axiosClient from './axiosClient';
import type { AxiosError } from 'axios';

export interface SuggestRequest {
  caloriesTarget: number;
}

export const dietPlanApi = {
  generateSuggested: async (input: SuggestRequest) => {
    try {
      const { data } = await axiosClient.post(
        '/v1/meal-plans/generate-suggested',
        { caloriesTarget: input.caloriesTarget }
      );

      const responseData = data?.data ?? data;
      const meals = Array.isArray(responseData?.meals) ? responseData.meals : (Array.isArray(responseData) ? responseData : []);
      return meals;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      const serverMessage =
        axiosError.response?.data?.error?.message ??
        axiosError.message ??
        'Error al generar plan sugerido';
      throw new Error(serverMessage);
    }
  },
};
