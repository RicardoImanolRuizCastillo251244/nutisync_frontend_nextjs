import { useQuery } from '@tanstack/react-query';
import { dietPlanRepository } from '../infrastructure/repositories/DietPlanRepositoryImpl';
import { useAuth } from '../presentation/contexts/AuthContext';

export const usePatientActivePlan = (patientId: string) => {
  const { user } = useAuth();
  const nutritionistId = user?.id ?? '';

  return useQuery({
    queryKey: ['activePlan', patientId, nutritionistId],
    queryFn: async () => {
      if (!nutritionistId || !patientId) return null;
      return dietPlanRepository.getActivePlanByPatient(patientId, nutritionistId);
    },
    enabled: !!nutritionistId && !!patientId,
  });
};