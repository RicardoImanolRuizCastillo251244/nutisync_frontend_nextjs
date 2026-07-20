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
  consumed: number;
  expected: number;
  waterIntake: number;
  mood: number | null;
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
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Comidas consumidas</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="consumed" name="Consumidas" fill="#24B38A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 h-72">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Consumo de agua (ml)</h3>
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

      <div className="bg-white border border-gray-200 rounded-xl p-4 h-80">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Estado emocional (1-4)</h3>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              domain={[0.5, 4.5]}
              ticks={[1, 2, 3, 4]}
              tickFormatter={(v) => ['', 'Mal', 'Neutral', 'Bien', 'Excelente'][v]}
            />
            <Tooltip formatter={(value: any) => {
              if (value == null) return 'Sin registro';
              return ['😟 Mal', '😐 Neutral', '🙂 Bien', '😊 Excelente'][(value as number) - 1] ?? value;
            }} />
            <Line type="monotone" dataKey="mood" name="Estado" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
          <span>😟 Mal</span>
          <span>😐 Neutral</span>
          <span>🙂 Bien</span>
          <span>😊 Excelente</span>
        </div>
      </div>
    </div>
  );
}
