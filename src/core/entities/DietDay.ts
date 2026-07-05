import type { Meal } from './Meal';

export interface DietDay {
  dayNumber: number; // 1 = Lunes, 2 = Martes, ..., 7 = Domingo
  meals: Meal[];
}