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

      return data?.data ?? data;
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
