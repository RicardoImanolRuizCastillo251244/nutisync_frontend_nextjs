import type { MealFoodItem } from './MealFoodItem';

export interface Meal {
  id: string;
  name: string; // 'Desayuno', 'Comida', etc.
  items: MealFoodItem[];
  note?: string; // instrucción o comentario del nutriólogo
}