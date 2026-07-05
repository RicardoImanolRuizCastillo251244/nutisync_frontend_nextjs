import { useQuery } from '@tanstack/react-query';
import { foodApi } from '@/src/infrastructure/api/foodApi';

export const useFoods = () => {
  const {
    data: foods = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['foods'],
    queryFn: async () => foodApi.getAll(),
  });

  return {
    foods,
    isLoading,
    error,
  };
};
