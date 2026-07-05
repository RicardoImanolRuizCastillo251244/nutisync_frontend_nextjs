import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientRepository } from '../infrastructure/repositories/PatientRepositoryImpl';
import type { Patient } from '../core/entities/Patient';
import { useAuth } from '../presentation/contexts/AuthContext';

export const usePatients = () => {
  const { user } = useAuth();
  const nutritionistId = user?.id ?? '';
  const queryClient = useQueryClient();

  const {
    data: patients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patients', nutritionistId],
    queryFn: async () => {
      if (!nutritionistId) return [];
      return patientRepository.getAllByNutritionist(nutritionistId);
    },
    enabled: !!nutritionistId,
  });

  const {
    data: pendingPatients = [],
    isLoading: isPendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: ['patients-pending'],
    queryFn: () => patientRepository.getPendingRegistrations(),
  });

  const createPatient = useMutation({
    mutationFn: (newPatient: Omit<Patient, 'id' | 'createdAt' | 'nutritionistId'>) =>
      patientRepository.create(newPatient, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', nutritionistId] });
    },
  });

  const updatePatient = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Patient> }) =>
      patientRepository.update(id, updates, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', nutritionistId] });
    },
  });

  const deletePatient = useMutation({
    mutationFn: (id: string) => patientRepository.delete(id, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', nutritionistId] });
    },
  });

  const approvePatient = useMutation({
    mutationFn: (id: string) => patientRepository.assignToNutritionist(id, nutritionistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', nutritionistId] });
      queryClient.invalidateQueries({ queryKey: ['patients-pending'] });
    },
  });

  return {
    patients,
    pendingPatients,
    isLoading,
    isPendingLoading,
    error,
    pendingError,
    createPatient: createPatient.mutateAsync,
    updatePatient: updatePatient.mutateAsync,
    deletePatient: deletePatient.mutateAsync,
    approvePatient: approvePatient.mutateAsync,
    isCreating: createPatient.isPending,
    isUpdating: updatePatient.isPending,
    isDeleting: deletePatient.isPending,
    isApproving: approvePatient.isPending,
  };
};