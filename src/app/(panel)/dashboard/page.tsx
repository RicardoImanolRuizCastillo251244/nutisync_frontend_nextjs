'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/presentation/contexts/AuthContext';
import axiosClient from '@/src/infrastructure/api/axiosClient';

type DashboardData = {
  totalPatients: number;
  activePlans: number;
  averageAdherence: number;
  summaries: Array<{ adherenceRate?: number }>;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const nutritionistId = user?.id ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', nutritionistId],
    queryFn: async (): Promise<DashboardData> => {
      const { data: res } = await axiosClient.get('/v1/dashboard/nutritionist');
      const raw = res?.data ?? res;
      return {
        totalPatients: raw.totalPatients ?? 0,
        activePlans: raw.activePlans ?? 0,
        averageAdherence: raw.averageAdherence ?? 0,
        summaries: raw.summaries ?? [],
      };
    },
    enabled: !!nutritionistId,
  });

  return (
    <div className="space-y-6">
      <div className="panel-card p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
        Panel de Control
        </h1>
        <p className="text-gray-500 mt-1">
        ¡Bienvenido al dashboard de NutriSync! Aquí verás estadísticas y resúmenes.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="panel-card border-l-4 border-l-primary p-6">
          <h3 className="text-gray-500 text-sm">Pacientes totales</h3>
          <p className="text-2xl font-bold text-primary">
            {isLoading ? '...' : data?.totalPatients ?? 0}
          </p>
        </div>
        <div className="panel-card border-l-4 border-l-primary p-6">
          <h3 className="text-gray-500 text-sm">Planes activos</h3>
          <p className="text-2xl font-bold text-primary">
            {isLoading ? '...' : data?.activePlans ?? 0}
          </p>
        </div>
        <div className="panel-card border-l-4 border-l-primary p-6">
          <h3 className="text-gray-500 text-sm">Adherencia promedio</h3>
          <p className="text-2xl font-bold text-primary">
            {isLoading ? '...' : `${data?.averageAdherence ?? 0}%`}
          </p>
        </div>
      </div>

      <div className="panel-card p-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Empieza creando o revisando pacientes para activar tus flujos clínicos.</p>
        <Link href="/pacientes" className="btn-brand inline-block">Ir a pacientes</Link>
      </div>
    </div>
  );
}