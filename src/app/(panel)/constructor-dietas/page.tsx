'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useDietPlans } from '@/src/adapters/useDietPlans';
import { usePatients } from '@/src/adapters/usePatients';
import type { DietDay } from '@/src/core/entities/DietDay';
import type { DietPlan } from '@/src/core/entities/DietPlan';
import type { Meal } from '@/src/core/entities/Meal';
import { dietPlanApi } from '@/src/infrastructure/api/dietPlanApi';
import AssignPlanModal from '@/src/presentation/components/AssignPlanModal';
import MacroSummary from '@/src/presentation/components/MacroSummary';
import MealBuilder from '@/src/presentation/components/MealBuilder';
import Pagination from '@/src/presentation/components/Pagination';
import PlanSelector from '@/src/presentation/components/PlanSelector';

type EditorTab = 'saved' | 'edit';

const DAY_LABELS = [
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
  'Domingo',
] as const;

const getMealNamesByCount = (mealCount: number): string[] => {
  if (mealCount === 3) {
    return ['Desayuno', 'Comida', 'Cena'];
  }

  const defaultNames = [
    'Desayuno',
    'Colacion AM',
    'Comida',
    'Merienda',
    'Cena',
    'Colacion PM',
    'Comida 7',
  ];

  return Array.from(
    { length: mealCount },
    (_, index) => defaultNames[index] ?? `Comida ${index + 1}`
  );
};

const createEmptyMeals = (mealNames: readonly string[]): Meal[] =>
  mealNames.map((name) => ({
    id: crypto.randomUUID(),
    name,
    items: [],
    note: '',
  }));

const cloneMeals = (meals: Meal[]): Meal[] =>
  meals.map((meal) => ({
    ...meal,
    items: meal.items.map((item) => ({ ...item })),
  }));

const normalizeMeals = (meals: Meal[], mealNames: readonly string[]): Meal[] => {
  return mealNames.map((name, index) => {
    const existing = meals[index];
    if (!existing) {
      return {
        id: crypto.randomUUID(),
        name,
        items: [],
        note: '',
      };
    }

    return {
      id: existing.id,
      name,
      items: existing.items.map((item) => ({ ...item })),
      note: existing.note ?? '',
    };
  });
};

const createEmptyWeek = (mealNames: readonly string[]): DietDay[] =>
  DAY_LABELS.map((_, index) => ({
    dayNumber: index + 1,
    meals: createEmptyMeals(mealNames),
  }));

const normalizeDays = (days: DietDay[]): DietDay[] =>
  DAY_LABELS.map((_, index) => {
    const dayNumber = index + 1;
    const existing = days.find((day) => day.dayNumber === dayNumber);
    const mealCount = Math.min(7, Math.max(3, existing?.meals.length || 5));
    const mealNames = getMealNamesByCount(mealCount);

    return {
      dayNumber,
      meals: normalizeMeals(existing?.meals ?? [], mealNames),
    };
  });

const flattenMeals = (days: DietDay[]): Meal[] => days.flatMap((day) => day.meals);

export default function ConstructorDietasPage() {
  const searchParams = useSearchParams();
  const queryPlanId = searchParams.get('planId');
  const queryPatientId = searchParams.get('patientId');

  const {
    plans,
    isLoading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    assignPlanToPatient,
    getActiveAssignments,
    isCreating,
    isUpdating,
    isDeleting,
    isAssigning,
  } = useDietPlans();
  const { patients, isLoading: isPatientsLoading } = usePatients();

  const [activeTab, setActiveTab] = useState<EditorTab>('saved');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');
  const [days, setDays] = useState<DietDay[]>(createEmptyWeek(getMealNamesByCount(5)));
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [copySourceDayNumber, setCopySourceDayNumber] = useState(2);
  const [applyMealCountToAllDays, setApplyMealCountToAllDays] = useState(false);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignPlanId, setAssignPlanId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState(queryPatientId ?? '');
  const [assignedPatientNamesByPlan, setAssignedPatientNamesByPlan] = useState<
    Record<string, string[]>
  >({});

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === editingPlanId) ?? null,
    [plans, editingPlanId]
  );
  const selectedDay = useMemo(
    () => days.find((day) => day.dayNumber === selectedDayNumber) ?? days[0],
    [days, selectedDayNumber]
  );
  const currentMealCount = selectedDay?.meals.length ?? 5;
  const selectedDayCalories = useMemo(() => {
    if (!selectedDay) return 0;

    return selectedDay.meals.reduce(
      (dayTotal, meal) =>
        dayTotal + meal.items.reduce((mealTotal, item) => mealTotal + item.calories, 0),
      0
    );
  }, [selectedDay]);

  const filteredPlans = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return plans;
    return plans.filter((plan) => plan.name.toLowerCase().includes(term));
  }, [plans, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = filteredPlans.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(safeCurrentPage * pageSize, filteredPlans.length);
  const paginatedPlans = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, safeCurrentPage]);

  useEffect(() => {
    let cancelled = false;

    const loadAssignments = async () => {
      if (plans.length === 0) {
        if (!cancelled) setAssignedPatientNamesByPlan({});
        return;
      }

      try {
        const patientNameById = new Map(
          patients.map((patient) => [patient.id, patient.name])
        );

        const entries = await Promise.all(
          plans.map(async (plan) => {
            const assignments = await getActiveAssignments(plan.id);
            const names = assignments
              .map(
                (assignment) =>
                  patientNameById.get(assignment.patientId) ?? 'Paciente sin nombre'
              )
              .filter((value, index, self) => self.indexOf(value) === index);
            return [plan.id, names] as const;
          })
        );

        if (!cancelled) {
          setAssignedPatientNamesByPlan(Object.fromEntries(entries));
        }
      } catch {
        if (!cancelled) {
          toast.error('No se pudieron cargar las asignaciones activas de planes');
        }
      }
    };

    void loadAssignments();

    return () => {
      cancelled = true;
    };
  }, [plans, patients, getActiveAssignments]);

  useEffect(() => {
    if (!queryPlanId) return;
    const plan = plans.find((item) => item.id === queryPlanId);
    if (!plan) return;

    const timeoutId = window.setTimeout(() => {
      setEditingPlanId(plan.id);
      setPlanName(plan.name);
      setDays(normalizeDays(plan.days));
      setSelectedDayNumber(1);
      setActiveTab('edit');
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [queryPlanId, plans]);

  const isBusy = isCreating || isUpdating || isDeleting;

  const resetEditor = () => {
    setEditingPlanId(null);
    setPlanName('');
    setDays(createEmptyWeek(getMealNamesByCount(5)));
    setSelectedDayNumber(1);
    setCopySourceDayNumber(2);
    setApplyMealCountToAllDays(false);
    if (queryPatientId) {
      setSelectedPatientId(queryPatientId);
    }
  };

  const handleMealCountChange = (nextCount: number) => {
    if (!selectedDay) return;

    const bounded = Math.max(3, Math.min(7, nextCount));
    const targetDays = applyMealCountToAllDays
      ? days
      : days.filter((day) => day.dayNumber === selectedDayNumber);

    const allTargetDaysAlreadyMatch = targetDays.every((day) => day.meals.length === bounded);
    if (allTargetDaysAlreadyMatch) return;

    if (targetDays.some((day) => bounded < day.meals.length)) {
      const hasItems = targetDays.some((day) =>
        day.meals.slice(bounded).some((meal) => meal.items.length > 0)
      );
      if (hasItems) {
        const confirmed = window.confirm(
          'Las comidas que se eliminaran contienen alimentos. ¿Deseas continuar?'
        );
        if (!confirmed) return;
      }
    }

    const mealNames = getMealNamesByCount(bounded);
    setDays((previous) =>
      previous.map((day) =>
        applyMealCountToAllDays || day.dayNumber === selectedDayNumber
          ? {
              ...day,
              meals: normalizeMeals(day.meals, mealNames),
            }
          : day
      )
    );
  };

  const handleApplyMealCountToAllDaysChange = (checked: boolean) => {
    setApplyMealCountToAllDays(checked);

    if (!checked || !selectedDay) {
      return;
    }

    const selectedDayMealCount = selectedDay.meals.length;
    const needsSync = days.some((day) => day.meals.length !== selectedDayMealCount);
    if (!needsSync) {
      return;
    }

    const mealNames = getMealNamesByCount(selectedDayMealCount);
    setDays((previous) =>
      previous.map((day) => ({
        ...day,
        meals: normalizeMeals(day.meals, mealNames),
      }))
    );
  };

  const copyMealsToSelectedDay = (sourceDayNumber: number) => {
    if (!selectedDay || sourceDayNumber === selectedDayNumber) return;

    const sourceDay = days.find((day) => day.dayNumber === sourceDayNumber);
    if (!sourceDay) return;

    const hasExistingItems = selectedDay.meals.some((meal) => meal.items.length > 0);
    if (hasExistingItems) {
      const confirmed = window.confirm(
        'El dia actual ya tiene alimentos agregados. ¿Deseas reemplazar sus comidas?'
      );
      if (!confirmed) return;
    }

    const sourceMealNames = sourceDay.meals.map((meal) => meal.name);
    setDays((previous) =>
      previous.map((day) =>
        day.dayNumber === selectedDayNumber
          ? {
              ...day,
              meals: normalizeMeals(cloneMeals(sourceDay.meals), sourceMealNames),
            }
          : day
      )
    );

    toast.success(`Comidas copiadas desde ${DAY_LABELS[sourceDayNumber - 1]}`);
  };

  const handleEditPlan = (plan: DietPlan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setDays(normalizeDays(plan.days));
    setSelectedDayNumber(1);
    setCopySourceDayNumber(2);
    setApplyMealCountToAllDays(false);
    setActiveTab('edit');
  };

  const handleDeletePlan = async (plan: DietPlan) => {
    const confirmed = window.confirm(`¿Eliminar el plan "${plan.name}"?`);
    if (!confirmed) return;

    try {
      await deletePlan(plan.id);
      toast.success('Plan eliminado correctamente');
      if (editingPlanId === plan.id) {
        resetEditor();
      }
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'No se pudo eliminar el plan';
      toast.error(message);
    }
  };

  const openAssignModal = (planId: string) => {
    setAssignPlanId(planId);
    setSelectedPatientId(queryPatientId ?? '');
    setIsAssignModalOpen(true);
  };

  const handleAssignPlan = async () => {
    if (!assignPlanId || !selectedPatientId) return;

    try {
      await assignPlanToPatient({
        planId: assignPlanId,
        patientId: selectedPatientId,
      });
      toast.success('Plan asignado correctamente');
      setIsAssignModalOpen(false);
      setAssignPlanId(null);
      setSelectedPatientId('');
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'No se pudo asignar el plan';
      toast.error(message);
    }
  };

  const handleMealChange = (updatedMeal: Meal) => {
    setDays((previous) =>
      previous.map((day) =>
        day.dayNumber === selectedDayNumber
          ? {
              ...day,
              meals: day.meals.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal)),
            }
          : day
      )
    );
  };

  const handleQuickGeneration = async () => {
    if (!selectedDay) return;

    try {
      toast.info('Generando plan sugerido desde Edamam...');
      const suggestedItems = await dietPlanApi.generateSuggested({
        caloriesTarget: targetCalories,
      });

      const mealNames = selectedDay.meals.map((meal) => meal.name);
      const mealsPerSlot = Math.ceil(suggestedItems.length / mealNames.length);
      const updatedMeals = selectedDay.meals.map((meal, index) => {
        const start = index * mealsPerSlot;
        const slot = suggestedItems.slice(start, start + mealsPerSlot);
        return {
          ...meal,
          items: slot.map((item: Record<string, unknown>) => ({
            foodId: `suggested-${Date.now()}-${Math.random()}`,
            foodName: String(item.name ?? ''),
            quantity: 1,
            unit: 'g' as const,
            portion: String(item.portion ?? '100 g'),
            calories: Math.round(Number(item.calories ?? 0)),
            protein: Number(Number(item.protein ?? 0).toFixed(1)),
            carbs: Number(Number(item.carbs ?? 0).toFixed(1)),
            fat: Number(Number(item.fat ?? 0).toFixed(1)),
          })),
        };
      });

      setDays((previous) =>
        previous.map((day) =>
          day.dayNumber === selectedDayNumber
            ? { ...day, meals: updatedMeals }
            : day
        )
      );

      toast.success(`Plan sugerido generado para ${DAY_LABELS[selectedDayNumber - 1]}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo generar el plan sugerido desde Edamam';
      toast.error(message);
    }
  };

  const handleSavePlan = async () => {
    const trimmedName = planName.trim();
    if (!trimmedName) {
      toast.error('El nombre del plan es obligatorio');
      return;
    }

    try {
      if (editingPlanId) {
        await updatePlan({
          id: editingPlanId,
          updates: {
            name: trimmedName,
            days,
          },
        });
        toast.success('Plan actualizado correctamente');
      } else {
        const created = await createPlan({
          name: trimmedName,
          days,
          deletedAt: null,
        });
        setEditingPlanId(created.id);
        toast.success('Plan creado correctamente');
      }
      setActiveTab('saved');
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'No se pudo guardar el plan';
      toast.error(message);
    }
  };

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-800">
        Constructor de Dietas
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            activeTab === 'saved'
              ? 'bg-[#24B38A] text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Planes guardados
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            activeTab === 'edit'
              ? 'bg-[#24B38A] text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Editar plan semanal
        </button>
      </div>

      {(isLoading || isPatientsLoading) && (
        <div className="panel-card p-6 text-gray-500">
          Cargando datos del constructor...
        </div>
      )}

      {!isLoading && !isPatientsLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          No se pudieron cargar los planes.
        </div>
      )}

      {!isLoading && !isPatientsLoading && !error && activeTab === 'saved' && (
        <div>
          <div className="panel-card p-4 mb-4">
            <label className="block text-sm text-gray-700 mb-2">Buscar plan por nombre</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Ej. Plan semanal recomposicion"
              className="panel-input md:max-w-sm"
            />
          </div>

          <PlanSelector
            plans={paginatedPlans}
            selectedPlanId={editingPlanId}
            assignedPatientNamesByPlan={assignedPatientNamesByPlan}
            onEdit={handleEditPlan}
            onDelete={(plan) => void handleDeletePlan(plan)}
            onAssign={(plan) => openAssignModal(plan.id)}
          />

          <p className="mt-3 text-sm text-gray-600">
            Mostrando {pageStart}-{pageEnd} de {filteredPlans.length} planes
          </p>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(totalPages, page)))}
          />
        </div>
      )}

      {!isLoading && !isPatientsLoading && !error && activeTab === 'edit' && (
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
          <div className="space-y-4">
            <MacroSummary meals={flattenMeals(days)} />

            <div className="panel-card p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Generacion rapida</h3>
              <p className="text-xs text-gray-500 mb-3">
                Genera sugerencias para el dia seleccionado.
              </p>
              <label className="block text-xs text-gray-600 mb-1">Calorias objetivo</label>
              <input
                type="number"
                min={1200}
                step={50}
                value={targetCalories}
                onChange={(event) => setTargetCalories(Number(event.target.value))}
                className="panel-input"
              />
              <button
                type="button"
                onClick={() => void handleQuickGeneration()}
                className="w-full mt-3 btn-brand"
              >
                Generar plan sugerido del dia
              </button>
            </div>

            <div className="panel-card p-4 space-y-2">
              <button
                type="button"
                onClick={() => void handleSavePlan()}
                disabled={isBusy}
                className="w-full btn-brand"
              >
                {editingPlanId ? 'Guardar cambios' : 'Guardar plan'}
              </button>
              <button
                type="button"
                onClick={resetEditor}
                className="w-full btn-brand-outline"
              >
                Nuevo plan vacio
              </button>
              {activePlan ? (
                <>
                  <button
                    type="button"
                    onClick={() => openAssignModal(activePlan.id)}
                    className="w-full btn-brand-outline"
                  >
                    Asignar a paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeletePlan(activePlan)}
                    disabled={isBusy}
                    className="w-full btn-brand-danger"
                  >
                    Eliminar plan
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="panel-card p-4">
              <label className="block text-sm text-gray-700 mb-2">Nombre del plan</label>
              <input
                type="text"
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                className="panel-input"
                placeholder="Ej. Plan semanal recomposicion corporal"
              />

              <div className="mt-4">
                <p className="block text-sm text-gray-700 mb-2">Dias de la semana</p>
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map((label, index) => {
                    const dayNumber = index + 1;
                    const isSelected = selectedDayNumber === dayNumber;

                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedDayNumber(dayNumber)}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${
                          isSelected
                            ? 'border-[#24B38A] bg-[#24B38A] text-white shadow-sm'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Comidas para {DAY_LABELS[selectedDayNumber - 1]} (3-7)
                </label>
                <input
                  type="number"
                  min={3}
                  max={7}
                  step={1}
                  value={currentMealCount}
                  onChange={(event) => {
                    const nextCount = Number(event.target.value);
                    if (Number.isNaN(nextCount)) return;
                    handleMealCountChange(nextCount);
                  }}
                  className="panel-input w-full max-w-[110px]"
                />

                <label className="mt-6 flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={applyMealCountToAllDays}
                    onChange={(event) => handleApplyMealCountToAllDaysChange(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                  />
                  Aplicar este numero de comidas a todos los dias
                </label>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => copyMealsToSelectedDay(selectedDayNumber - 1)}
                  disabled={selectedDayNumber === 1}
                  className="btn-brand-outline"
                >
                  Copiar comidas del dia anterior
                </button>

                <div className="flex flex-wrap items-end gap-2">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Copiar desde otro dia</label>
                    <select
                      value={copySourceDayNumber}
                      onChange={(event) => setCopySourceDayNumber(Number(event.target.value))}
                      className="panel-select md:min-w-[180px]"
                    >
                      {DAY_LABELS.map((label, index) => {
                        const dayNumber = index + 1;
                        return (
                          <option key={label} value={dayNumber} disabled={dayNumber === selectedDayNumber}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyMealsToSelectedDay(copySourceDayNumber)}
                    disabled={copySourceDayNumber === selectedDayNumber}
                    className="btn-brand-outline"
                  >
                    Copiar comidas
                  </button>
                </div>
              </div>
            </div>

            <div className="panel-card-soft p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {DAY_LABELS[selectedDayNumber - 1]}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configura las comidas de este dia dentro del plan semanal.
              </p>
            </div>

            <div className="panel-card-soft p-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-700">Total del día:</span>
              <span className="text-xl font-bold text-primary">
                {Math.round(selectedDayCalories)} kcal
              </span>
            </div>

            {selectedDay?.meals.map((meal) => (
              <MealBuilder key={meal.id} meal={meal} onMealChange={handleMealChange} />
            ))}
          </div>
        </div>
      )}

      <AssignPlanModal
        isOpen={isAssignModalOpen}
        isSubmitting={isAssigning}
        patients={patients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={setSelectedPatientId}
        onAssign={() => void handleAssignPlan()}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </section>
  );
}