'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import type { Food } from '@/src/core/entities/Food';
import type { Meal } from '@/src/core/entities/Meal';
import type { MealFoodItem } from '@/src/core/entities/MealFoodItem';
import { useFoods } from '@/src/adapters/useFoods';
import { foodApi } from '@/src/infrastructure/api/foodApi';

interface MealBuilderProps {
  meal: Meal;
  onMealChange: (meal: Meal) => void;
}

interface CustomFoodForm {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const emptyCustomFood: CustomFoodForm = {
  name: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export default function MealBuilder({ meal, onMealChange }: MealBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState(100);

  // Custom food toggle
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [customFood, setCustomFood] = useState<CustomFoodForm>(emptyCustomFood);
  const [customGrams, setCustomGrams] = useState(100);

  // Debounce: solo buscar tras 350ms de inactividad
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 350);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Búsqueda con debounce
  const { foods, isLoading: isSearching } = useFoods(debouncedQuery);

  const totalCalories = useMemo(
    () => meal.items.reduce((sum, item) => sum + item.calories, 0),
    [meal.items]
  );

  const filteredFoods = useMemo(() => {
    if (debouncedQuery.trim().length < 2) return [];
    return foods.slice(0, 10);
  }, [foods, debouncedQuery]);

  /** Calcula item vía backend y lo agrega al meal */
  const addFood = async (food: Food, selectedGrams: number) => {
    const calculated = await foodApi.calculateItem({
      name: food.name,
      portion: food.portion,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      grams: selectedGrams,
    });

    const newItem: MealFoodItem = {
      foodId: food.id,
      ...calculated,
    };

    onMealChange({
      ...meal,
      items: [...meal.items, newItem],
    });
    setSearchTerm('');
    setDebouncedQuery('');
    setIsSearchOpen(false);
    setSelectedFood(null);
  };

  /** Calcula item personalizado vía backend y lo agrega al meal */
  const handleAddCustomFood = async () => {
    if (!customFood.name.trim()) return;

    const calculated = await foodApi.calculateItem({
      name: customFood.name,
      portion: `${customGrams} g`,
      calories: customFood.calories,
      protein: customFood.protein,
      carbs: customFood.carbs,
      fat: customFood.fat,
      grams: customGrams,
    });

    const newItem: MealFoodItem = {
      foodId: `custom-${Date.now()}-${Math.random()}`,
      foodName: calculated.foodName ?? customFood.name,
      quantity: calculated.quantity,
      unit: calculated.unit,
      portion: calculated.portion,
      calories: calculated.calories,
      protein: calculated.protein,
      carbs: calculated.carbs,
      fat: calculated.fat,
    };

    onMealChange({
      ...meal,
      items: [...meal.items, newItem],
    });
    setCustomFood(emptyCustomFood);
    setCustomGrams(100);
    setShowCustomFood(false);
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setIsSearchOpen(false);
    // Sugerir gramos = gramo referencial de la porción
    const refMatch = food.portion.match(/(\d+)\s*g/i);
    setGrams(refMatch ? Number(refMatch[1]) : 100);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (filteredFoods.length !== 1) return;

    event.preventDefault();
    handleSelectFood(filteredFoods[0]);
  };

  const handleAddSelectedFood = () => {
    if (!selectedFood) return;
    if (grams <= 0) return;
    void addFood(selectedFood, grams);
  };

  const handleCancelSelectedFood = () => {
    setSelectedFood(null);
    setGrams(100);
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
                    {item.quantity} g &middot; {Math.round(item.calories)} kcal
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
          <label className="block text-xs text-gray-600 mb-1">Buscar alimento</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => {
              setTimeout(() => {
                setIsSearchOpen(false);
              }, 150);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar alimentos..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />

          {isSearchOpen && debouncedQuery.trim().length >= 2 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
              {isSearching ? (
                <p className="px-3 py-2 text-sm text-gray-400">Buscando...</p>
              ) : filteredFoods.length === 0 ? (
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
                    <span className="font-medium">{food.name}</span>
                    <span className="text-gray-400 ml-2">({food.portion} &middot; {Math.round(food.calories)} kcal)</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCustomFood(true);
            setCustomFood((prev) => ({ ...prev, name: searchTerm }));
          }}
          className="text-sm text-primary font-medium hover:underline mt-1 inline-flex items-center gap-1"
        >
          + Agregar alimento personalizado
        </button>

        {selectedFood && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-800 mb-2">
              {selectedFood.name} <span className="text-gray-500">({selectedFood.calories} kcal / {selectedFood.portion})</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[120px_auto_auto] gap-2 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gramos (g)</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={grams}
                  onChange={(event) => setGrams(Number(event.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={handleAddSelectedFood}
                disabled={grams <= 0}
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

        {showCustomFood && (
          <div className="rounded-lg border border-dashed border-primary/50 bg-primary-light/20 p-3">
            <p className="text-sm font-medium text-gray-800 mb-3">Alimento personalizado (valores por 100 g)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nombre</label>
                <input
                  type="text"
                  value={customFood.name}
                  onChange={(e) => setCustomFood((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Sushi casero"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Gramos (g)</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={customGrams}
                  onChange={(e) => setCustomGrams(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Calorías (kcal por 100 g)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={customFood.calories}
                  onChange={(e) => setCustomFood((prev) => ({ ...prev, calories: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Proteínas (g por 100 g)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={customFood.protein}
                  onChange={(e) => setCustomFood((prev) => ({ ...prev, protein: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Carbohidratos (g por 100 g)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={customFood.carbs}
                  onChange={(e) => setCustomFood((prev) => ({ ...prev, carbs: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Grasas (g por 100 g)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={customFood.fat}
                  onChange={(e) => setCustomFood((prev) => ({ ...prev, fat: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCustomFood(false);
                  setCustomFood(emptyCustomFood);
                  setCustomGrams(100);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleAddCustomFood()}
                disabled={!customFood.name.trim()}
                className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-60"
              >
                Agregar alimento personalizado
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