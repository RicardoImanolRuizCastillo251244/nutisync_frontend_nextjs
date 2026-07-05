import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationRepository } from '../infrastructure/repositories/MedicationRepositoryImpl';
import type { Medication } from '../core/entities/Medication';
import { useAuth } from '../presentation/contexts/AuthContext';

export const useMedications = () => {
  const { user } = useAuth();
  const nutritionistId = user?.id ?? '';
  const queryClient = useQueryClient();

  const {
    data: medications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['medications', nutritionistId],
    queryFn: async () => {
      if (!nutritionistId) return [];
      return medicationRepository.getAllByNutritionist(nutritionistId);
    },
    enabled: !!nutritionistId,
  });

  const createMedication = useMutation({
    mutationFn: (medication: Omit<Medication, 'id' | 'createdAt' | 'nutritionistId'>) =>
      medicationRepository.create(medication, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', nutritionistId] });
    },
  });

  const updateMedication = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Medication> }) =>
      medicationRepository.update(id, updates, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', nutritionistId] });
    },
  });

  const deleteMedication = useMutation({
    mutationFn: (id: string) => medicationRepository.delete(id, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', nutritionistId] });
    },
  });

  const archiveMedication = useMutation({
    mutationFn: (id: string) => medicationRepository.archive(id, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', nutritionistId] });
    },
  });

  return {
    medications,
    isLoading,
    error,
    createMedication: createMedication.mutateAsync,
    updateMedication: updateMedication.mutateAsync,
    deleteMedication: deleteMedication.mutateAsync,
    archiveMedication: archiveMedication.mutateAsync,
    isCreating: createMedication.isPending,
    isUpdating: updateMedication.isPending,
    isDeleting: deleteMedication.isPending,
    isArchiving: archiveMedication.isPending,
  };
};