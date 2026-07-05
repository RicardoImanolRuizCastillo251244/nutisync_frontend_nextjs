import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealLogRepository } from '../infrastructure/repositories/MealLogRepositoryImpl';
import type { MealLog } from '../core/entities/MealLog';

export const useMealLogs = (patientId: string, date?: string) => {
  const queryClient = useQueryClient();

  const {
    data: logs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mealLogs', patientId, date],
    queryFn: async () => {
      if (!patientId) return [];
      if (date) return mealLogRepository.getByPatientAndDate(patientId, date);
      return mealLogRepository.getByPatient(patientId);
    },
    enabled: !!patientId,
  });

  const createLog = useMutation({
    mutationFn: (log: Omit<MealLog, 'id' | 'createdAt' | 'updatedAt'>) =>
      mealLogRepository.create(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealLogs', patientId] });
    },
  });

  const updateLog = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MealLog> }) =>
      mealLogRepository.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealLogs', patientId] });
    },
  });

  const deleteLog = useMutation({
    mutationFn: (id: string) => mealLogRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealLogs', patientId] });
    },
  });

  return {
    logs,
    isLoading,
    error,
    createLog: createLog.mutateAsync,
    updateLog: updateLog.mutateAsync,
    deleteLog: deleteLog.mutateAsync,
    isCreating: createLog.isPending,
    isUpdating: updateLog.isPending,
    isDeleting: deleteLog.isPending,
  };
};