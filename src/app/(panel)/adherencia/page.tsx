'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAdherence } from '@/src/adapters/useAdherence';
import { useMealLogs } from '@/src/adapters/useMealLogs';
import { usePatientActivePlan } from '@/src/adapters/usePatientActivePlan';
import { usePatients } from '@/src/adapters/usePatients';
import { useVoiceNote } from '@/src/adapters/useVoiceNote';
import AdherenceCharts, {
  type AdherenceChartPoint,
} from '@/src/presentation/components/AdherenceCharts';
import MealLogList, { type MealLogRow } from '@/src/presentation/components/MealLogList';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

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
  const start = new Date(startDate);
  const end = new Date(endDate);
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

export default function AdherenciaPage() {
  const { patients, isLoading: isPatientsLoading } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [rangeDays, setRangeDays] = useState(30);

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
    createRecord,
    updateRecord,
    isCreating: isCreatingAdherence,
    isUpdating: isUpdatingAdherence,
  } = useAdherence(selectedPatientId);
  const { createNote } = useVoiceNote(null);

  const mealsByDayNumber = useMemo(
    () => new Map((activePlan?.days ?? []).map((day) => [day.dayNumber, day.meals])),
    [activePlan]
  );

  const expectedMeals = useMemo(
    () => mealsByDayNumber.get(getDayNumberFromDate(selectedDate)) ?? [],
    [mealsByDayNumber, selectedDate]
  );

  const rangeStartDate = useMemo(() => dateDaysAgo(Math.max(0, rangeDays - 1)), [rangeDays]);
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
      const expected = mealsByDayNumber.get(getDayNumberFromDate(date))?.length || 1;
      const compliancePct = (consumed / expected) * 100;
      const adherenceForDay = recordsByDate.get(date);

      return {
        date: dateLabel(date),
        mealCompliancePct: Number(compliancePct.toFixed(1)),
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

  const syncAdherenceForDate = async (date: string) => {
    const logsOnDate = allLogs.filter((log) => log.date === date);
    const consumedCount = logsOnDate.filter((log) => log.consumed).length;
    const existing = recordsByDate.get(date);

    if (existing) {
      await updateRecord({
        id: existing.id,
        updates: {
          mealCompliance: consumedCount,
        },
      });
      return;
    }

    await createRecord({
      patientId: selectedPatientId,
      date,
      mealCompliance: consumedCount,
      waterIntake: 0,
      mood: 3,
      medicationsTaken: false,
    });
  };

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

      await syncAdherenceForDate(selectedDate);
      toast.success('Registro de comida actualizado');
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'No se pudo actualizar el estado de la comida';
      toast.error(message);
    }
  };

  const handleGenerateMockData = async () => {
    if (!selectedPatientId || !activePlan) {
      toast.error('Selecciona paciente y plan activo para generar datos mock');
      return;
    }

    try {
      for (let day = 6; day >= 0; day -= 1) {
        const date = dateDaysAgo(day);
        const mealsForDate = mealsByDayNumber.get(getDayNumberFromDate(date)) ?? [];

        for (const meal of mealsForDate) {
          const consumed = Math.random() > 0.25;
          let voiceNoteId: string | undefined;

          if (consumed && Math.random() > 0.75) {
            const voiceNote = await createNote({
              patientId: selectedPatientId,
              mealLogId: '',
              audioData: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              duration: 8,
            });
            voiceNoteId = voiceNote.id;
          }

          await createLog({
            patientId: selectedPatientId,
            planId: activePlan.id,
            mealName: meal.name,
            date,
            consumed,
            consumedAt: consumed ? new Date().toISOString() : undefined,
            voiceNoteId,
          });
        }

        await createRecord({
          patientId: selectedPatientId,
          date,
          mealCompliance: Math.floor(Math.random() * (mealsForDate.length + 1)),
          waterIntake: 4 + Math.floor(Math.random() * 6),
          mood: 1 + Math.floor(Math.random() * 5),
          medicationsTaken: Math.random() > 0.3,
        });
      }

      toast.success('Datos mock de adherencia generados (temporal)');
    } catch {
      toast.error('No se pudieron generar los datos mock');
    }
  };

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-800">
        Adherencia
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-4 mb-6">
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
          <label className="block text-sm text-gray-700 mb-2">Dia especifico</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="panel-input"
          />
        </div>

        <div className="panel-card p-4">
          <label className="block text-sm text-gray-700 mb-2">Rango</label>
          <select
            value={rangeDays}
            onChange={(event) => setRangeDays(Number(event.target.value))}
            className="panel-select"
          >
            <option value={7}>Ultimos 7 dias</option>
            <option value={30}>Ultimos 30 dias</option>
          </select>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Resumen de adherencia ({rangeDays} dias)</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {summary.adherencePct.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {summary.consumedTotal} comidas consumidas de {summary.expectedTotal} esperadas
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleGenerateMockData()}
              className="btn-brand"
            >
              Generar datos mock
            </button>
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
            isUpdating={isCreatingLog || isUpdatingLog || isCreatingAdherence || isUpdatingAdherence}
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
