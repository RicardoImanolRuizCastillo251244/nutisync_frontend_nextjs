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
    type?: string;
    ingredients?: Array<{ ingredientId?: number; name: string; quantity: number; unit: string; calories?: number; protein?: number; carbs?: number; fat?: number }>;
    description?: string;
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
    imageUrl: raw.imageUrl || null,
    sourceUrl: raw.sourceUrl ?? null,
    healthLabels: raw.healthLabels ?? [],
    dietLabels: raw.dietLabels ?? [],
    type: (raw as { type?: string }).type ?? null,
    ingredients: (raw as { ingredients?: Array<{ ingredientId?: number; name: string; quantity: number; unit: string }> }).ingredients ?? null,
    description: (raw as { description?: string }).description ?? null,
  };
}

export const foodApi = {
  /**
   * Busca alimentos en Edamam a través del proxy del backend.
   * @param query - Término de búsqueda (ej: "pollo", "manzana")
   * @returns Lista de alimentos encontrados
   */
  calculateItem: async (params: {
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    grams: number;
  }): Promise<Omit<import('@/src/core/entities/MealFoodItem').MealFoodItem, 'foodId'>> => {
    const { data } = await axiosClient.post('/v1/meal-plans/calculate-item', params);
    return data?.data ?? data;
  },

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