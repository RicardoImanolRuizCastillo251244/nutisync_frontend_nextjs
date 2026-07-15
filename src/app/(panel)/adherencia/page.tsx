'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAdherence } from '@/src/adapters/useAdherence';
import { useMealLogs } from '@/src/adapters/useMealLogs';
import { usePatientActivePlan } from '@/src/adapters/usePatientActivePlan';
import { usePatients } from '@/src/adapters/usePatients';
import AdherenceCharts, {
  type AdherenceChartPoint,
} from '@/src/presentation/components/AdherenceCharts';
import MealLogList, { type MealLogRow } from '@/src/presentation/components/MealLogList';

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const dateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
};

const dateLabel = (isoDate: string) => {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
};

const getDateSeries = (startDate: string, endDate: string): string[] => {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const dates: string[] = [];

  while (start <= end) {
    dates.push(formatDate(start));
    start.setDate(start.getDate() + 1);
  }

  return dates;
};

const getDayNumberFromDate = (isoDate: string) => {
  const jsDay = new Date(`${isoDate}T12:00:00`).getDay();
  return jsDay === 0 ? 7 : jsDay;
};

type RangeDays = 1 | 7 | 30 | -1;

const todayLocal = formatDate(new Date());

export default function AdherenciaPage() {
  const { patients, isLoading: isPatientsLoading } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayLocal);
  const [rangeDays, setRangeDays] = useState<RangeDays>(1);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const minDate = selectedPatient?.createdAt
    ? formatDate(new Date(selectedPatient.createdAt))
    : '2020-01-01';

  const { data: activePlan, isLoading: isPlanLoading } = usePatientActivePlan(selectedPatientId);
  const {
    logs: allLogs,
    isLoading: isLogsLoading,
    createLog,
    updateLog,
    isCreating: isCreatingLog,
    isUpdating: isUpdatingLog,
  } = useMealLogs(selectedPatientId);
  const { logs: dayLogs } = useMealLogs(selectedPatientId, selectedDate);
  const {
    records: adherenceRecords,
    isLoading: isAdherenceLoading,
  } = useAdherence(selectedPatientId);

  const mealsByDayNumber = useMemo(
    () => new Map((activePlan?.days ?? []).map((day) => [day.dayNumber, day.meals])),
    [activePlan]
  );

  const expectedMeals = useMemo(
    () => mealsByDayNumber.get(getDayNumberFromDate(selectedDate)) ?? [],
    [mealsByDayNumber, selectedDate]
  );

  const rangeStartDate = useMemo(() => {
    if (rangeDays === -1) return minDate;
    if (rangeDays === 1) return selectedDate;
    return dateDaysAgo(Math.max(0, rangeDays - 1));
  }, [rangeDays, minDate, selectedDate]);

  const dateSeries = useMemo(
    () => getDateSeries(rangeStartDate, selectedDate),
    [rangeStartDate, selectedDate]
  );

  const filteredLogs = useMemo(
    () => allLogs.filter((log) => log.date >= rangeStartDate && log.date <= selectedDate),
    [allLogs, rangeStartDate, selectedDate]
  );

  const recordsByDate = useMemo(
    () => new Map(adherenceRecords.map((record) => [record.date, record])),
    [adherenceRecords]
  );

  const summary = useMemo(() => {
    const expectedTotal = dateSeries.reduce(
      (total, date) => total + (mealsByDayNumber.get(getDayNumberFromDate(date))?.length ?? 0),
      0
    );
    const consumedTotal = filteredLogs.filter((log) => log.consumed).length;
    const adherencePct = expectedTotal > 0 ? (consumedTotal / expectedTotal) * 100 : 0;

    return {
      consumedTotal,
      expectedTotal,
      adherencePct,
    };
  }, [dateSeries, filteredLogs, mealsByDayNumber]);

  const chartData = useMemo<AdherenceChartPoint[]>(() => {
    const logsByDate = new Map<string, typeof filteredLogs>();
    filteredLogs.forEach((log) => {
      const list = logsByDate.get(log.date) ?? [];
      list.push(log);
      logsByDate.set(log.date, list);
    });

    return dateSeries.map((date) => {
      const dayLogsForDate = logsByDate.get(date) ?? [];
      const consumed = dayLogsForDate.filter((log) => log.consumed).length;
      const expected = mealsByDayNumber.get(getDayNumberFromDate(date))?.length || 0;
      const adherenceForDay = recordsByDate.get(date);

      return {
        date: dateLabel(date),
        consumed,
        expected,
        waterIntake: adherenceForDay?.waterIntake ?? 0,
        mood: adherenceForDay?.mood ?? 1,
      };
    });
  }, [dateSeries, filteredLogs, mealsByDayNumber, recordsByDate]);

  const dailyRows = useMemo<MealLogRow[]>(() => {
    const dayLogByMealName = new Map(dayLogs.map((log) => [log.mealName, log]));

    if (expectedMeals.length === 0) {
      return dayLogs.map((log) => ({
        mealName: log.mealName,
        log,
      }));
    }

    return expectedMeals.map((meal) => ({
      mealName: meal.name,
      log: dayLogByMealName.get(meal.name),
    }));
  }, [dayLogs, expectedMeals]);

  const isLoading =
    isPatientsLoading || isPlanLoading || isLogsLoading || isAdherenceLoading;

  const handleToggleConsumed = async (row: MealLogRow) => {
    if (!selectedPatientId || !activePlan) {
      toast.error('Selecciona un paciente con plan activo para registrar adherencia');
      return;
    }

    try {
      if (row.log) {
        const consumed = !row.log.consumed;
        await updateLog({
          id: row.log.id,
          updates: {
            consumed,
            consumedAt: consumed ? new Date().toISOString() : undefined,
          },
        });
      } else {
        await createLog({
          patientId: selectedPatientId,
          planId: activePlan.id,
          mealName: row.mealName,
          date: selectedDate,
          consumed: true,
          consumedAt: new Date().toISOString(),
        });
      }

      toast.success('Registro de comida actualizado');
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'No se pudo actualizar el estado de la comida';
      toast.error(message);
    }
  };

  const rangeLabel = useMemo(() => {
    switch (rangeDays) {
      case 1: return selectedDate === todayLocal ? 'Hoy' : selectedDate;
      case 7: return 'Últimos 7 días';
      case 30: return 'Últimos 30 días';
      case -1: return 'Desde siempre';
      default: return '';
    }
  }, [rangeDays, selectedDate]);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-800">
        Adherencia
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_280px] gap-4 mb-6">
        <div className="panel-card p-4">
          <label className="block text-sm text-gray-700 mb-2">Paciente</label>
          <select
            value={selectedPatientId}
            onChange={(event) => setSelectedPatientId(event.target.value)}
            className="panel-select"
          >
            <option value="">Selecciona un paciente</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        <div className="panel-card p-4">
          <label className="block text-sm text-gray-700 mb-2">Día específico</label>
          <input
            type="date"
            value={selectedDate}
            min={minDate}
            onChange={(event) => {
              setSelectedDate(event.target.value);
              setRangeDays(1);
            }}
            className="panel-input"
          />
        </div>

        <div className="panel-card p-4">
          <label className="block text-sm text-gray-700 mb-2">Rango</label>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(todayLocal);
                setRangeDays(1);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                rangeDays === 1 && selectedDate === todayLocal
                  ? 'bg-[#24B38A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(todayLocal);
                setRangeDays(7);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                rangeDays === 7
                  ? 'bg-[#24B38A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7d
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(todayLocal);
                setRangeDays(30);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                rangeDays === 30
                  ? 'bg-[#24B38A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30d
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(todayLocal);
                setRangeDays(-1);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                rangeDays === -1
                  ? 'bg-[#24B38A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="panel-card p-6 text-gray-500 mb-6">
          Cargando datos de adherencia...
        </div>
      )}

      {!isLoading && selectedPatientId && !activePlan && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 mb-6">
          El paciente no tiene plan activo. Asigna un plan para calcular adherencia esperada.
        </div>
      )}

      {!isLoading && selectedPatientId && (
        <div className="panel-card p-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Resumen de adherencia ({rangeLabel})</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {summary.adherencePct.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {summary.consumedTotal} comidas consumidas de {summary.expectedTotal} esperadas
            </p>
          </div>
        </div>
      )}

      {!isLoading && selectedPatientId && (
        <div className="space-y-6">
          <AdherenceCharts data={chartData} />

          <MealLogList
            date={selectedDate}
            rows={dailyRows}
            onToggleConsumed={(row) => void handleToggleConsumed(row)}
            isUpdating={isCreatingLog || isUpdatingLog}
          />
        </div>
      )}

      {!isLoading && !selectedPatientId && (
        <div className="panel-card p-6 text-gray-600">
          Selecciona un paciente para visualizar su adherencia.
        </div>
      )}
    </section>
  );
}