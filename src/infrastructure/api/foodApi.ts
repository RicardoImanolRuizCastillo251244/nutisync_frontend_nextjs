import type { Food } from '@/src/core/entities/Food';
import axiosClient from './axiosClient';

export interface EdamamFoodResponse {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion?: string;
  imageUrl?: string;
  sourceUrl?: string;
  healthLabels?: string[];
  dietLabels?: string[];
}

/**
 * Mapea un resultado de Edamam (vía proxy) a la entidad Food del frontend.
 */
function mapFood(raw: EdamamFoodResponse, index: number): Food {
  return {
    id: `edamam-${index}-${Date.now()}`,
    name: raw.name,
    portion: raw.portion ?? '100 g',
    calories: raw.calories,
    protein: raw.protein,
    carbs: raw.carbs,
    fat: raw.fat,
    imageUrl: raw.imageUrl ?? null,
    sourceUrl: raw.sourceUrl ?? null,
    healthLabels: raw.healthLabels ?? [],
    dietLabels: raw.dietLabels ?? [],
  };
}

export const foodApi = {
  /**
   * Busca alimentos en Edamam a través del proxy del backend.
   * @param query - Término de búsqueda (ej: "pollo", "manzana")
   * @returns Lista de alimentos encontrados
   */
  search: async (query: string): Promise<Food[]> => {
    if (!query.trim()) return [];

    const { data } = await axiosClient.get('/v1/meal-plans/foods/search', {
      params: { query: query.trim() },
    });

    const results: EdamamFoodResponse[] = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];

    return results.map((item, index) => mapFood(item, index));
  },
};