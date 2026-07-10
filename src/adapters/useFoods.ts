import { useQuery } from '@tanstack/react-query';
import { foodApi } from '@/src/infrastructure/api/foodApi';

/**
 * Hook para buscar alimentos en Edamam a través del proxy del backend.
 * Solo ejecuta la búsqueda cuando hay al menos 2 caracteres.
 */
export const useFoods = (searchQuery: string) => {
  const trimmedQuery = searchQuery.trim();

  const {
    data: foods = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['foods', trimmedQuery],
    queryFn: async () => foodApi.search(trimmedQuery),
    enabled: trimmedQuery.length >= 2,
    staleTime: 60_000, // cachear resultados 1 minuto
    refetchOnWindowFocus: false,
  });

  return {
    foods,
    isLoading,
    error,
  };
};