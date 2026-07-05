'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface AdherenceChartPoint {
  date: string;
  mealCompliancePct: number;
  waterIntake: number;
  mood: number;
}

interface AdherenceChartsProps {
  data: AdherenceChartPoint[];
}

export default function AdherenceCharts({ data }: AdherenceChartsProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-500">
        No hay datos suficientes para mostrar graficos.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 h-72">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Cumplimiento de comidas (%)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="mealCompliancePct"
              name="Cumplimiento"
              stroke="var(--color-primary)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 h-72">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Consumo de agua (vasos)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="waterIntake" name="Agua" fill="var(--color-primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 h-72">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Estado emocional (1-5)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 5]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="mood" name="Estado" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
