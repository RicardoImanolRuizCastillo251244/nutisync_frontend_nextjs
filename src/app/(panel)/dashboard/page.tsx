'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '@/src/presentation/contexts/AuthContext';
import axiosClient from '@/src/infrastructure/api/axiosClient';

type PatientAdherence = {
  patientId: string;
  patientName: string;
  adherence: number;
  mealsCompleted: number;
  mealsLogged: number;
};

type DashboardData = {
  totalPatients: number;
  activePlans: number;
  averageAdherence: number;
  patientAdherence: PatientAdherence[];
  range: number;
};

type RangeDays = 1 | 7 | 30 | -1;

const getBarColor = (value: number) => {
  if (value >= 75) return '#24B38A';
  if (value >= 50) return '#F59E0B';
  return '#EF4444';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const nutritionistId = user?.id ?? '';
  const [rangeDays, setRangeDays] = useState<RangeDays>(1);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', nutritionistId, rangeDays],
    queryFn: async (): Promise<DashboardData> => {
      const { data: res } = await axiosClient.get('/v1/dashboard/nutritionist', {
        params: { range: rangeDays },
      });
      const raw = res?.data ?? res;
      return {
        totalPatients: raw.totalPatients ?? 0,
        activePlans: raw.activePlans ?? 0,
        averageAdherence: raw.averageAdherence ?? 0,
        patientAdherence: raw.patientAdherence ?? [],
        range: raw.range ?? rangeDays,
      };
    },
    enabled: !!nutritionistId,
  });

  const rangeLabel = () => {
    switch (rangeDays) {
      case 1: return 'Hoy';
      case 7: return 'Últimos 7 días';
      case 30: return 'Últimos 30 días';
      case -1: return 'Desde siempre';
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel-card p-6">
        <h1 className="text-2xl font-semibold text-gray-800">Panel de Control</h1>
        <p className="text-gray-500 mt-1">
          Estadísticas globales de adherencia de tus pacientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="panel-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Adherencia por paciente ({rangeLabel()})
          </h3>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setRangeDays(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                rangeDays === 1
                  ? 'bg-[#24B38A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setRangeDays(7)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                rangeDays === 7
                  ? 'bg-[#24B38A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7d
            </button>
            <button
              type="button"
              onClick={() => setRangeDays(30)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                rangeDays === 30
                  ? 'bg-[#24B38A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30d
            </button>
            <button
              type="button"
              onClick={() => setRangeDays(-1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                rangeDays === -1
                  ? 'bg-[#24B38A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Cargando datos de adherencia...
          </div>
        ) : (data?.patientAdherence ?? []).length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            No hay datos de adherencia en este rango
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ name: 'Adherencia total', adherence: data?.averageAdherence ?? 0 }]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip formatter={(value: any) => [`${value}%`, 'Adherencia total']} />
              <Bar dataKey="adherence" radius={[8, 8, 0, 0]} maxBarSize={80} fill={getBarColor(data?.averageAdherence ?? 0)} />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#24B38A]" />
            <span>≥75% Buena</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" />
            <span>≥50% Regular</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#EF4444]" />
            <span>0-49% Baja</span>
          </div>
        </div>
      </div>

      <div className="panel-card p-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Empieza creando o revisando pacientes para activar tus flujos clínicos.</p>
        <Link href="/pacientes" className="btn-brand inline-block">Ir a pacientes</Link>
      </div>
    </div>
  );
}