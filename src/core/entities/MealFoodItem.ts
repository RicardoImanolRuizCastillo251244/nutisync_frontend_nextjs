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
}