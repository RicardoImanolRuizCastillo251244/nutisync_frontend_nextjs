export interface MealFoodItem {
  foodId: string;
  foodName: string;
  quantity: number; // porciones
  unit: 'g' | 'ml' | 'pieza(s)';
  portion: string; // descripción (ej. '1 taza', '100g')
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string | null;
  type?: string | null;
  ingredients?: Array<{ ingredientId?: number; name: string; quantity: number; unit: string; calories?: number; protein?: number; carbs?: number; fat?: number }> | null;
}
