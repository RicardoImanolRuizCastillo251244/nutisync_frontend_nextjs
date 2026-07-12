'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useClinicalRecord } from '@/src/adapters/useClinicalRecord';
import { usePatientActivePlan } from '@/src/adapters/usePatientActivePlan';
import { usePatients } from '@/src/adapters/usePatients';
import type { ClinicalRecord } from '@/src/core/entities/ClinicalRecord';
import ClinicalRecordForm from '@/src/presentation/components/ClinicalRecordForm';
import SectionCard from '@/src/presentation/components/SectionCard';
import { clinicalRecordFormSchema } from '@/src/utils/validations';
import type { Patient } from '@/src/core/entities/Patient';
import { calculateClinicalMetrics } from '@/src/utils/clinicalCalculations';
import { dietPlanRepository } from '@/src/infrastructure/repositories/DietPlanRepositoryImpl';

const getAge = (birthDate: string): number => {
  const now = new Date();
  const birth = new Date(birthDate);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Number.isNaN(age) ? 0 : age;
};

const genderLabel = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
} as const;

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const getDefaultClinicalRecord = (
  patientId: string,
  patient: Patient | null
): Omit<ClinicalRecord, 'id' | 'createdAt' | 'updatedAt'> => ({
  patientId,
  name: patient ? patient.name : '',
  sex: patient?.gender ? genderLabel[patient.gender] : 'Otro' as 'Masculino' | 'Femenino' | 'Otro',
  age: patient?.birthDate ? getAge(patient.birthDate) : 0,
  education: '',
  occupation: '',
  religion: '',
  bloodType: '',
  consultationReason: '',
  date: getTodayDate(),
  phone: patient?.phone ?? '',
  weight: 0,
  maritalStatus: '',
  allergies: '',
  feedingDifficulty: false,
  address: '',
  height: 0,
  familyCancer: false,
  familyHypertension: false,
  familyHIV: false,
  familyDiabetesType1: false,
  familyDiabetesType2: false,
  familyOther: '',
  familyObesity: false,
  personalDiarrhea: false,
  personalColitis: false,
  personalReflux: false,
  personalConstipation: false,
  personalNausea: false,
  personalOther: '',
  personalGastritis: false,
  personalVomiting: false,
  labGlucose: 0,
  labCholesterol: 0,
  labTriglycerides: 0,
  physicalHair: '',
  physicalMouth: '',
  physicalTeeth: '',
  physicalEyes: '',
  physicalGums: '',
  physicalNails: '',
  mealsPerDay: 0,
  mealsPlace: 'Casa',
  consumesSpicy: false,
  consumesCanned: false,
  consumesAddedSalt: false,
  consumesSugar: false,
  cookingFat: {
    margarine: false,
    butter: false,
    vegetableOil: false,
    lard: false,
  },
  drinksWater: false,
  waterAmountMl: 0,
  exercises: false,
  exerciseFrequency: '',
  exerciseTime: '',
  bmi: 0,
  bmiClassification: 'Sin calcular',
  bodyFatPercentage: 0,
  visceralFat: 0,
  muscleMass: 0,
  biologicalAge: 0,
  restingMetabolism: 0,
  riskLevel: 'Normal',
});

const normalizeClinicalRecord = (
  record: ClinicalRecord,
  defaults: Omit<ClinicalRecord, 'id' | 'createdAt' | 'updatedAt'>
): ClinicalRecord => ({
  ...defaults,
  ...record,
  cookingFat: {
    ...defaults.cookingFat,
    ...record.cookingFat,
  },
});

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const patientId = Array.isArray(rawId) ? rawId[0] ?? '' : rawId ?? '';

  const queryClient = useQueryClient();
  const { patients, isLoading: isLoadingPatients } = usePatients();
  const {
    latestRecord,
    isLoading: isLoadingRecord,
    error: recordError,
    createRecord,
    updateRecord,
    isCreating,
    isUpdating,
  } = useClinicalRecord(patientId);
  const { data: activePlan, isLoading: isLoadingPlan } = usePatientActivePlan(patientId);

  const unassignPlanMutation = useMutation({
    mutationFn: (params: { planId: string; patientId: string }) =>
      dietPlanRepository.unassignPlan(params.planId, params.patientId, 'nutritionist'),
    onSuccess: () => {
      toast.success('Plan descartado correctamente');
      queryClient.invalidateQueries({ queryKey: ['activePlan'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al descartar plan');
    },
  });

  const patient = useMemo(() => patients.find((item) => item.id === patientId) ?? null, [patients, patientId]);
  const defaultRecord = useMemo(
    () => getDefaultClinicalRecord(patientId, patient),
    [patientId, patient]
  );
  const normalizedLatestRecord = useMemo(
    () => (latestRecord ? normalizeClinicalRecord(latestRecord, defaultRecord) : null),
    [latestRecord, defaultRecord]
  );

  const [draftRecord, setDraftRecord] = useState<ClinicalRecord | null>(null);
  const formData = draftRecord ?? normalizedLatestRecord;

  const onChangeField = <K extends keyof ClinicalRecord>(field: K, value: ClinicalRecord[K]) => {
    setDraftRecord((previous) => {
      const baseRecord = previous ?? normalizedLatestRecord;
      if (!baseRecord) return previous;
      return {
        ...baseRecord,
        [field]: value,
      };
    });
  };

  const handleCreateRecord = async () => {
    try {
      await createRecord(defaultRecord);
      toast.success('Historia clínica creada correctamente');
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'No se pudo crear la historia clínica';
      toast.error(message);
    }
  };

  const handleRecalculate = async () => {
    if (!formData) return;

    try {
      const calculated = calculateClinicalMetrics({
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        sex: formData.sex,
      });

      setDraftRecord((previous) => {
        const baseRecord = previous ?? normalizedLatestRecord;
        if (!baseRecord) return previous;
        return {
          ...baseRecord,
          ...calculated,
        };
      });

      toast.success('Métricas recalculadas (simulación frontend)');
    } catch {
      toast.error('No se pudieron recalcular las métricas');
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    const calculated = calculateClinicalMetrics({
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      sex: formData.sex,
    });

    const recordToSave: ClinicalRecord = {
      ...formData,
      ...calculated,
    };

    const parsed = clinicalRecordFormSchema.safeParse(recordToSave);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Datos inválidos en la historia clínica');
      return;
    }

    try {
      await updateRecord({
        id: formData.id,
        updates: { ...parsed.data, patientId },
      });
      setDraftRecord(null);
      toast.success('Historia clínica actualizada');
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'No se pudo guardar la historia clínica';
      toast.error(message);
    }
  };

  if (isLoadingPatients || isLoadingRecord) {
    return (
      <div className="max-w-5xl mx-auto panel-card p-8 text-center text-gray-500">
        Cargando expediente clínico...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-5xl mx-auto rounded-xl bg-red-50 border border-red-200 p-6 text-red-700">
        Paciente no encontrado.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="panel-card border-l-4 border-l-primary p-6">
        <p className="text-sm text-gray-500 mb-2">Expediente clínico</p>
        <h1 className="text-2xl font-bold text-gray-800">
          {patient.name}
        </h1>
        <p className="text-gray-600 mt-1">
          {patient.birthDate ? `${getAge(patient.birthDate)} años` : '—'} · {patient.gender ? genderLabel[patient.gender] : '—'}
        </p>
      </div>

      <SectionCard title="Plan activo">
        {isLoadingPlan ? (
          <p className="text-gray-500">Cargando plan activo...</p>
        ) : activePlan ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Plan actual</p>
              <p className="font-semibold text-gray-800">{activePlan.name}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/constructor-dietas?planId=${activePlan.id}`}
                className="btn-brand-outline"
              >
                Editar plan
              </Link>
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(`¿Descartar el plan "${activePlan.name}"?`);
                  if (confirmed) {
                    void unassignPlanMutation.mutateAsync({ planId: activePlan.id, patientId });
                  }
                }}
                disabled={unassignPlanMutation.isPending}
                className="btn-brand-danger"
              >
                {unassignPlanMutation.isPending ? 'Descartando...' : 'Descartar plan'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-gray-500">Este paciente no tiene un plan activo.</p>
            <Link
              href={`/constructor-dietas?patientId=${patientId}`}
              className="btn-brand"
            >
              Asignar plan
            </Link>
          </div>
        )}
      </SectionCard>

      {recordError ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
          No se pudo cargar la historia clínica.
        </div>
      ) : null}

      {!normalizedLatestRecord && !isCreating ? (
        <SectionCard
          title="Historia clínica"
          description="Aún no existe un registro clínico para este paciente."
        >
          <button
            type="button"
            onClick={() => void handleCreateRecord()}
            className="btn-brand"
          >
            Crear historia clínica
          </button>
        </SectionCard>
      ) : null}

      {formData ? (
        <ClinicalRecordForm
          record={formData}
          onChange={onChangeField}
          onSave={() => void handleSave()}
          onRecalculate={() => void handleRecalculate()}
          isSaving={isUpdating}
        />
      ) : null}
    </div>
  );
}