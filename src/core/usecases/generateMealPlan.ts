import type { Food } from '@/src/core/entities/Food';
import type { Meal } from '@/src/core/entities/Meal';
import type { MealFoodItem } from '@/src/core/entities/MealFoodItem';

const MEAL_NAMES = ['Desayuno', 'Colacion AM', 'Comida', 'Merienda', 'Cena'] as const;

const getDistributionByCount = (count: number): number[] => {
	switch (count) {
		case 3:
			return [0.3, 0.4, 0.3];
		case 4:
			return [0.25, 0.35, 0.15, 0.25];
		case 5:
			return [0.2, 0.1, 0.35, 0.1, 0.25];
		case 6:
			return [0.18, 0.1, 0.3, 0.1, 0.22, 0.1];
		default:
			return Array.from({ length: count }, () => 1 / count);
	}
};

const createItem = (food: Food, quantity: number): MealFoodItem => ({
	foodId: food.id,
	foodName: food.name,
	quantity,
	unit: 'pieza(s)',
	portion: food.portion,
	calories: Math.round(food.calories * quantity),
	protein: Number((food.protein * quantity).toFixed(1)),
	carbs: Number((food.carbs * quantity).toFixed(1)),
	fat: Number((food.fat * quantity).toFixed(1)),
});

// TODO: Reemplazar con un motor de recomendacion de backend real.
export const generateMealPlan = (
  targetCalories: number,
  foods: Food[],
  mealNames: readonly string[] = MEAL_NAMES
): Meal[] => {
  const names = mealNames.length > 0 ? mealNames : MEAL_NAMES;
  const distribution = getDistributionByCount(names.length);

	if (foods.length === 0) {
		return names.map((name) => ({
			id: crypto.randomUUID(),
			name,
			items: [],
			note: 'Sin alimentos disponibles en catalogo',
		}));
	}

	return names.map((name, index) => {
		const targetPerMeal = targetCalories * distribution[index];
		const primaryFood = foods[index % foods.length];
		const secondaryFood = foods[(index + 3) % foods.length];

		const primaryQty = Math.max(0.5, Number((targetPerMeal * 0.65 / primaryFood.calories).toFixed(1)));
		const secondaryQty = Math.max(0.5, Number((targetPerMeal * 0.35 / secondaryFood.calories).toFixed(1)));

		return {
			id: crypto.randomUUID(),
			name,
			items: [createItem(primaryFood, primaryQty), createItem(secondaryFood, secondaryQty)],
			note: `Objetivo aproximado: ${Math.round(targetPerMeal)} kcal`,
		};
	});
};
