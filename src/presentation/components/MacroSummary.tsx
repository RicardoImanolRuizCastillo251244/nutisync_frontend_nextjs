import type { Meal } from '@/src/core/entities/Meal';

interface MacroSummaryProps {
  meals: Meal[];
}

export default function MacroSummary({ meals }: MacroSummaryProps) {
  const totals = meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen del plan</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-primary-light/50 p-3">
          <p className="text-gray-600">Calorias</p>
          <p className="text-lg font-bold text-primary">{Math.round(totals.calories)} kcal</p>
        </div>
        <div className="rounded-lg bg-primary-light/50 p-3">
          <p className="text-gray-600">Proteinas</p>
          <p className="text-lg font-bold text-primary">{totals.protein.toFixed(1)} g</p>
        </div>
        <div className="rounded-lg bg-primary-light/50 p-3">
          <p className="text-gray-600">Carbohidratos</p>
          <p className="text-lg font-bold text-primary">{totals.carbs.toFixed(1)} g</p>
        </div>
        <div className="rounded-lg bg-primary-light/50 p-3">
          <p className="text-gray-600">Grasas</p>
          <p className="text-lg font-bold text-primary">{totals.fat.toFixed(1)} g</p>
        </div>
      </div>
    </div>
  );
}
