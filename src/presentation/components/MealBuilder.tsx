'use client';

import { useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Food } from '@/src/core/entities/Food';
import type { Meal } from '@/src/core/entities/Meal';
import type { MealFoodItem } from '@/src/core/entities/MealFoodItem';

interface MealBuilderProps {
  meal: Meal;
  foods: Food[];
  onMealChange: (meal: Meal) => void;
}

const createItemFromFood = (
  food: Food,
  quantity: number,
  unit: MealFoodItem['unit']
): MealFoodItem => ({
  foodId: food.id,
  foodName: food.name,
  quantity,
  unit,
  portion: food.portion,
  calories: Math.round(food.calories * quantity),
  protein: Number((food.protein * quantity).toFixed(1)),
  carbs: Number((food.carbs * quantity).toFixed(1)),
  fat: Number((food.fat * quantity).toFixed(1)),
});

export default function MealBuilder({ meal, foods, onMealChange }: MealBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<MealFoodItem['unit']>('g');

  const totalCalories = useMemo(
    () => meal.items.reduce((sum, item) => sum + item.calories, 0),
    [meal.items]
  );

  const filteredFoods = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return [];

    return foods
      .filter((food) => food.name.toLowerCase().includes(normalized))
      .slice(0, 10);
  }, [foods, searchTerm]);

  const addFood = (food: Food, selectedQuantity: number, selectedUnit: MealFoodItem['unit']) => {
    const newItem = createItemFromFood(food, selectedQuantity, selectedUnit);
    onMealChange({
      ...meal,
      items: [...meal.items, newItem],
    });
    setSearchTerm('');
    setIsSearchOpen(false);
    setSelectedFood(null);
    setQuantity(1);
    setUnit('g');
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setIsSearchOpen(false);
    setQuantity(1);
    setUnit('g');
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (filteredFoods.length !== 1) return;

    event.preventDefault();
    handleSelectFood(filteredFoods[0]);
  };

  const handleAddSelectedFood = () => {
    if (!selectedFood) return;
    if (quantity <= 0) return;
    addFood(selectedFood, quantity, unit);
  };

  const handleCancelSelectedFood = () => {
    setSelectedFood(null);
    setQuantity(1);
    setUnit('g');
  };

  const removeFoodAt = (index: number) => {
    onMealChange({
      ...meal,
      items: meal.items.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{meal.name}</h3>

      <div className="space-y-2 mb-4">
        {meal.items.length === 0 ? (
          <p className="text-sm text-gray-500">Sin alimentos agregados.</p>
        ) : (
          meal.items.map((item, index) => (
            <div key={`${item.foodId}-${index}`} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800">{item.foodName}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} {item.unit} • Ref: {item.portion} • {Math.round(item.calories)} kcal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFoodAt(index)}
                  className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mb-4 mt-3 rounded-lg border-t border-gray-200 bg-primary-light/40 px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700">Total:</span>
        <span className="text-lg font-bold text-primary">
          {meal.items.length === 0 ? '0 kcal' : `${Math.round(totalCalories)} kcal`}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="relative">
          <label className="block text-xs text-gray-600 mb-1">Agregar alimento</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => {
              setTimeout(() => {
                setIsSearchOpen(false);
              }, 120);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar alimento..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />

          {isSearchOpen && searchTerm.trim().length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
              {filteredFoods.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">No se encontraron alimentos</p>
              ) : (
                filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectFood(food)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-light transition"
                  >
                    {food.name} ({food.portion})
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {selectedFood && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-800 mb-2">
              {selectedFood.name} <span className="text-gray-500">({selectedFood.portion})</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto_auto] gap-2 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Cantidad</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Unidad</label>
                <select
                  value={unit}
                  onChange={(event) => setUnit(event.target.value as MealFoodItem['unit'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="pieza(s)">pieza(s)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddSelectedFood}
                disabled={quantity <= 0}
                className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
              >
                Agregar
              </button>

              <button
                type="button"
                onClick={handleCancelSelectedFood}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <label className="block text-xs text-gray-600 mb-1">Nota / Sugerencia</label>
        <textarea
          value={meal.note ?? ''}
          onChange={(event) => onMealChange({ ...meal, note: event.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Ej. Come dos rebanadas de pechuga"
        />
      </div>
    </div>
  );
}
