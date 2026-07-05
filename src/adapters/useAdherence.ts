import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdherenceRecord } from '@/src/core/entities/AdherenceRecord';
import { adherenceRepository } from '@/src/infrastructure/repositories/AdherenceRepositoryImpl';

export const useAdherence = (patientId: string, date?: string) => {
  const queryClient = useQueryClient();

  const {
    data: records = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adherence', patientId, date],
    queryFn: async () => {
      if (!patientId) return [];
      if (!date) return adherenceRepository.getByPatient(patientId);
      const dayRecord = await adherenceRepository.getByPatientAndDate(patientId, date);
      return dayRecord ? [dayRecord] : [];
    },
    enabled: !!patientId,
  });

  const createRecord = useMutation({
    mutationFn: (record: Omit<AdherenceRecord, 'id'>) => adherenceRepository.create(record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adherence', patientId] });
    },
  });

  const updateRecord = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AdherenceRecord> }) =>
      adherenceRepository.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adherence', patientId] });
    },
  });

  return {
    records,
    isLoading,
    error,
    createRecord: createRecord.mutateAsync,
    updateRecord: updateRecord.mutateAsync,
    isCreating: createRecord.isPending,
    isUpdating: updateRecord.isPending,
  };
};
