import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicalRecordRepository } from '../infrastructure/repositories/ClinicalRecordRepositoryImpl';
import type { ClinicalRecord } from '../core/entities/ClinicalRecord';

export const useClinicalRecord = (patientId: string) => {
  const queryClient = useQueryClient();

  const {
    data: records = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['clinicalRecords', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      return clinicalRecordRepository.getByPatientId(patientId);
    },
    enabled: !!patientId,
  });

  const createRecord = useMutation({
    mutationFn: (newRecord: Omit<ClinicalRecord, 'id' | 'createdAt' | 'updatedAt'>) =>
      clinicalRecordRepository.create(newRecord),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicalRecords', patientId] });
    },
  });

  const updateRecord = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ClinicalRecord> }) =>
      clinicalRecordRepository.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicalRecords', patientId] });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: (id: string) => clinicalRecordRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinicalRecords', patientId] });
    },
  });

  // El registro más reciente (ordenado por fecha de creación)
  const latestRecord = records.length > 0
    ? records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  return {
    records,
    latestRecord,
    isLoading,
    error,
    createRecord: createRecord.mutateAsync,
    updateRecord: updateRecord.mutateAsync,
    deleteRecord: deleteRecord.mutateAsync,
    isCreating: createRecord.isPending,
    isUpdating: updateRecord.isPending,
    isDeleting: deleteRecord.isPending,
  };
};