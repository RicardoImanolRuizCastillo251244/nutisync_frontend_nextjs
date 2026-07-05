import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { dietPlanRepository } from '../infrastructure/repositories/DietPlanRepositoryImpl';
import type { DietPlan } from '../core/entities/DietPlan';
import { useAuth } from '../presentation/contexts/AuthContext';

export const useDietPlans = () => {
  const { user } = useAuth();
  const nutritionistId = user?.id ?? '';
  const queryClient = useQueryClient();

  const {
    data: plans = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dietPlans', nutritionistId],
    queryFn: async () => {
      if (!nutritionistId) return [];
      return dietPlanRepository.getAllByNutritionist(nutritionistId);
    },
    enabled: !!nutritionistId,
  });

  const createPlan = useMutation({
    mutationFn: (plan: Omit<DietPlan, 'id' | 'createdAt' | 'nutritionistId'>) =>
      dietPlanRepository.create(plan, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietPlans', nutritionistId] });
    },
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DietPlan> }) =>
      dietPlanRepository.update(id, updates, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietPlans', nutritionistId] });
    },
  });

  const deletePlan = useMutation({
    mutationFn: (id: string) => dietPlanRepository.delete(id, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietPlans', nutritionistId] });
    },
  });

  const assignPlanToPatient = useMutation({
    mutationFn: ({ planId, patientId }: { planId: string; patientId: string }) =>
      dietPlanRepository.assignToPatient(planId, patientId, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietPlans', nutritionistId] });
      queryClient.invalidateQueries({ queryKey: ['activePlan'] });
    },
  });

  // Función estabilizada para evitar bucles infinitos
  const getActiveAssignments = useCallback(
    async (planId: string) => {
      return dietPlanRepository.getActiveAssignmentsByPlan(planId, nutritionistId);
    },
    [nutritionistId]
  );

  return {
    plans,
    isLoading,
    error,
    createPlan: createPlan.mutateAsync,
    updatePlan: updatePlan.mutateAsync,
    deletePlan: deletePlan.mutateAsync,
    assignPlanToPatient: assignPlanToPatient.mutateAsync,
    getActiveAssignments,
    isCreating: createPlan.isPending,
    isUpdating: updatePlan.isPending,
    isDeleting: deletePlan.isPending,
    isAssigning: assignPlanToPatient.isPending,
  };
};