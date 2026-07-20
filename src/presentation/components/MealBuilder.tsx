'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import Image from 'next/image';
import type { Food } from '@/src/core/entities/Food';
import type { Meal } from '@/src/core/entities/Meal';
import type { MealFoodItem } from '@/src/core/entities/MealFoodItem';
import { useFoods } from '@/src/adapters/useFoods';
import { foodApi } from '@/src/infrastructure/api/foodApi';

function isValidImageUrl(url: string | null | undefined): url is string {
  return typeof url === 'string' && url.length > 0 && url.startsWith('http');
}

interface MealBuilderProps { meal: Meal; onMealChange: (meal: Meal) => void; }
interface CustomFoodForm { name: string; calories: number; protein: number; carbs: number; fat: number; }
const emptyCustomFood: CustomFoodForm = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 };

type PortionUnit = 'g' | 'porcion(es)' | 'plato(s)' | 'pza(s)';

function formatPortionLabel(qty: number, unit: PortionUnit): string {
  switch (unit) {
    case 'g': return `${qty} g`;
    case 'plato(s)': return `${qty} ${qty === 1 ? 'plato' : 'platos'}`;
    case 'porcion(es)': return `${qty} ${qty === 1 ? 'porción' : 'porciones'}`;
    case 'pza(s)': return `${qty} ${qty === 1 ? 'pieza' : 'piezas'}`;
    default: return `${qty}`;
  }
}

function computeGramsAndLabel(qty: number, unit: PortionUnit, refGrams: number) {
  let totalGrams: number;
  let label: string;
  if (unit === 'g') {
    totalGrams = qty;
    label = `${qty} g`;
  } else {
    totalGrams = qty * refGrams;
    label = formatPortionLabel(qty, unit);
  }
  return { totalGrams, label };
}

export default function MealBuilder({ meal, onMealChange }: MealBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [portionQty, setPortionQty] = useState(1);
  const [portionUnit, setPortionUnit] = useState<PortionUnit>('g');
  const [referenceGrams, setReferenceGrams] = useState(100);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [customFood, setCustomFood] = useState<CustomFoodForm>(emptyCustomFood);
  const [customGrams, setCustomGrams] = useState(100);
  const [customQty, setCustomQty] = useState(1);
  const [customUnit, setCustomUnit] = useState<PortionUnit>('porcion(es)');
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 350);
  }, []);
  useEffect(() => { return () => { if (debounceRef.current) clearTimeout(debounceRef.current); }; }, []);

  const { foods, isLoading: isSearching } = useFoods(debouncedQuery);
  const totalCalories = useMemo(() => meal.items.reduce((sum, item) => sum + item.calories, 0), [meal.items]);
  const filteredFoods = useMemo(() => {
    if (debouncedQuery.trim().length < 2) return [];
    return foods.slice(0, 10);
  }, [foods, debouncedQuery]);

  const addFood = async (food: Food, qty: number, unit: PortionUnit, refGrams: number) => {
    const { totalGrams, label } = computeGramsAndLabel(qty, unit, refGrams);
    const calculated = await foodApi.calculateItem({
      name: food.name, portion: food.portion,
      calories: food.calories, protein: food.protein,
      carbs: food.carbs, fat: food.fat, grams: totalGrams,
    });
    const newItem: MealFoodItem = {
      foodId: food.id, ...calculated, portion: label,
      imageUrl: food.imageUrl ?? null,
      type: food.type ?? null, ingredients: food.ingredients ?? null,
    };
    onMealChange({ ...meal, items: [...meal.items, newItem] });
    setSearchTerm(''); setDebouncedQuery(''); setIsSearchOpen(false); setSelectedFood(null);
  };

  const handleAddCustomFood = async () => {
    if (!customFood.name.trim()) return;
    const { totalGrams, label } = computeGramsAndLabel(customQty, customUnit, customGrams);
    const calculated = await foodApi.calculateItem({
      name: customFood.name, portion: `${customGrams} g`,
      calories: customFood.calories, protein: customFood.protein,
      carbs: customFood.carbs, fat: customFood.fat, grams: totalGrams,
    });
    const newItem: MealFoodItem = {
      foodId: `custom-${Date.now()}-${Math.random()}`,
      foodName: calculated.foodName ?? customFood.name,
      quantity: calculated.quantity, unit: calculated.unit,
      portion: label, calories: calculated.calories,
      protein: calculated.protein, carbs: calculated.carbs, fat: calculated.fat,
    };
    onMealChange({ ...meal, items: [...meal.items, newItem] });
    setCustomFood(emptyCustomFood); setCustomGrams(100);
    setCustomQty(1); setCustomUnit('porcion(es)'); setShowCustomFood(false);
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setIsSearchOpen(false);
    const refMatch = food.portion.match(/(\d+)\s*g/i);
    const refGrams = refMatch ? Number(refMatch[1]) : 100;
    setReferenceGrams(refGrams);
    if (food.type === 'dish') {
      setPortionUnit('plato(s)');
      setPortionQty(1);
    } else {
      setPortionUnit('g');
      setPortionQty(refGrams);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || filteredFoods.length !== 1) return;
    event.preventDefault(); handleSelectFood(filteredFoods[0]);
  };
  const handleAddSelectedFood = () => {
    if (!selectedFood || portionQty <= 0) return;
    void addFood(selectedFood, portionQty, portionUnit, referenceGrams);
  };
  const removeFoodAt = (index: number) => {
    onMealChange({ ...meal, items: meal.items.filter((_, i) => i !== index) });
  };

  const renderDropdownContent = () => {
    if (isSearching) {
      return <p className="px-4 py-3 text-sm text-gray-400">Buscando...</p>;
    }
    if (filteredFoods.length === 0) {
      return <p className="px-4 py-3 text-sm text-gray-500">No se encontraron alimentos</p>;
    }
    return filteredFoods.map((food) => {
      const foodImage = isValidImageUrl(food.imageUrl)
        ? <Image src={food.imageUrl} alt={food.name} width={36} height={36} className="rounded-lg object-cover" />
        : <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg">🍽️</div>;
      return (
        <button key={food.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleSelectFood(food)}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-3">
            {foodImage}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-800 truncate">
                {food.name}
                {food.type === 'dish' && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-medium">🍽️ Platillo</span>}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{food.portion}</span>
                <span className="text-xs font-medium text-primary">{Math.round(food.calories)} kcal</span>
              </div>
            </div>
          </div>
        </button>
      );
    });
  };

  const unitOptions: { value: PortionUnit; label: string }[] = [
    { value: 'g', label: 'Gramos (g)' },
    { value: 'porcion(es)', label: 'Porción(es)' },
    { value: 'plato(s)', label: 'Plato(s)' },
    { value: 'pza(s)', label: 'Pieza(s)' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">{meal.name}</h3>
        <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
          {Math.round(totalCalories)} kcal
        </div>
      </div>
      {meal.note && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          📋 {meal.note}
        </div>
      )}

      <div className="space-y-3 mb-4">
        {meal.items.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-xl">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-sm text-gray-400">Sin alimentos agregados</p>
            <p className="text-xs text-gray-300 mt-1">Busca y agrega alimentos para esta comida</p>
          </div>
        ) : (
          meal.items.map((item, index) => (
            <div key={`${item.foodId}-${index}`} className="group relative">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden">
                  {isValidImageUrl(item.imageUrl) ? (
                    <Image src={item.imageUrl!} alt={item.foodName} width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center text-xl">🥘</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {item.foodName}
                      {item.type === 'dish' && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-medium">
                          🍽️ Platillo
                        </span>
                      )}
                    </p>
                    <button type="button" onClick={() => removeFoodAt(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100">
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.portion}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                      🔥 {Math.round(item.calories)} kcal
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      🥩 {item.protein}g
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      🌾 {item.carbs}g
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                      🧈 {item.fat}g
                    </span>
                  </div>
                  {item.type === 'dish' && item.ingredients && item.ingredients.length > 0 && (
                    <div className="mt-2">
                      <button type="button"
                        onClick={() => setExpandedDishId(expandedDishId === item.foodId ? null : item.foodId)}
                        className="text-[11px] text-purple-600 font-medium hover:underline">
                        {expandedDishId === item.foodId ? '▲ Ocultar ingredientes' : '▼ Ver ingredientes'}
                      </button>
                      {expandedDishId === item.foodId && (
                        <div className="mt-1.5 pl-1 space-y-0.5">
                          {item.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px] text-gray-500 bg-white/50 px-2 py-0.5 rounded">
                              <span>• {ing.name}</span>
                              <span className="text-gray-400 ml-2">{ing.quantity} {ing.unit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <div className="relative">
            <input type="text" value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
              onKeyDown={handleInputKeyDown}
              placeholder="🔍 Buscar alimento..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {isSearchOpen && debouncedQuery.trim().length >= 2 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl max-h-72 overflow-y-auto">
              {renderDropdownContent()}
            </div>
          )}
        </div>

        <button type="button"
          onClick={() => { setShowCustomFood(true); setCustomFood((prev) => ({ ...prev, name: searchTerm })); }}
          className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
          + Agregar alimento personalizado
        </button>

        {selectedFood && (
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-2 mb-3">
              {isValidImageUrl(selectedFood.imageUrl) ? (
                <Image src={selectedFood.imageUrl} alt={selectedFood.name} width={32} height={32} className="rounded-lg object-cover" />
              ) : (
                <span className="text-lg">✅</span>
              )}
              <p className="text-sm font-semibold text-gray-800">{selectedFood.name}</p>
              <span className="text-xs text-gray-500">
                ({Math.round(selectedFood.calories)} kcal / {selectedFood.portion})
              </span>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Cantidad</label>
                  <input type="number" min={1} step={1} value={portionQty}
                    onChange={(e) => setPortionQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Unidad</label>
                  <select value={portionUnit}
                    onChange={(e) => setPortionUnit(e.target.value as PortionUnit)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm bg-white">
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="button" onClick={handleAddSelectedFood}
                disabled={portionQty <= 0}
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-dark disabled:opacity-60 transition-colors">
                Agregar
              </button>
              <button type="button"
                onClick={() => { setSelectedFood(null); setPortionQty(1); setPortionUnit('g'); }}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm">
                Cancelar
              </button>
            </div>
            {selectedFood.type === 'dish' && portionUnit !== 'plato(s)' && portionUnit !== 'porcion(es)' && (
              <p className="text-[11px] text-amber-600 mt-2">
                💡 Este alimento es un platillo. Se recomienda usar "Plato(s)" o "Porción(es)" como unidad.
              </p>
            )}
          </div>
        )}

        {showCustomFood && (
          <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              📝 Alimento personalizado
            </p>
            <p className="text-[11px] text-gray-500 -mt-2 mb-3">
              Ingresa los valores nutricionales para una porción de <strong>{customGrams} g</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input type="text" value={customFood.name}
                onChange={(e) => setCustomFood((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nombre"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30" />
              <input type="number" min={1} value={customGrams}
                onChange={(e) => setCustomGrams(Number(e.target.value))}
                placeholder="Gramos por porción"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30" />
              <input type="number" min={0} value={customFood.calories}
                onChange={(e) => setCustomFood((p) => ({ ...p, calories: Number(e.target.value) }))}
                placeholder="Calorías"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30" />
              <input type="number" min={0} step={0.1} value={customFood.protein}
                onChange={(e) => setCustomFood((p) => ({ ...p, protein: Number(e.target.value) }))}
                placeholder="Proteínas (g)"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30" />
              <input type="number" min={0} step={0.1} value={customFood.carbs}
                onChange={(e) => setCustomFood((p) => ({ ...p, carbs: Number(e.target.value) }))}
                placeholder="Carbs (g)"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30" />
              <input type="number" min={0} step={0.1} value={customFood.fat}
                onChange={(e) => setCustomFood((p) => ({ ...p, fat: Number(e.target.value) }))}
                placeholder="Grasas (g)"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex gap-2 mb-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Cantidad a agregar</label>
                <input type="number" min={1} step={1} value={customQty}
                  onChange={(e) => setCustomQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Unidad</label>
                <select value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as PortionUnit)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm bg-white">
                  {unitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => {
                setShowCustomFood(false); setCustomFood(emptyCustomFood);
                setCustomGrams(100); setCustomQty(1); setCustomUnit('porcion(es)');
              }}
                className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => void handleAddCustomFood()}
                disabled={!customFood.name.trim()}
                className="px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark disabled:opacity-60">
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <textarea value={meal.note ?? ''}
          onChange={(e) => onMealChange({ ...meal, note: e.target.value })} rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs text-gray-600 resize-none"
          placeholder="📝 Nota / sugerencia (ej. Come dos rebanadas de pechuga)" />
      </div>
    </div>
  );
}