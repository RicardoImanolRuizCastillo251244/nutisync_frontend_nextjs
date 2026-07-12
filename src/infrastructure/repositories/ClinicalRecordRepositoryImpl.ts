import type { ClinicalRecord } from '../../core/entities/ClinicalRecord';
import type { ClinicalRecordRepository } from '../../core/ports/ClinicalRecordRepository';
import axiosClient from '../api/axiosClient';

type ApiRecord = {
  id: string;
  patientId: string;
  date: string;
  data: Record<string, unknown>;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  riskLevel?: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapRecord(raw: ApiRecord): ClinicalRecord {
  const d = raw.data ?? {};
  return {
    id: String(raw.id ?? ''),
    patientId: String(raw.patientId ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    name: String(d.name ?? ''),
    sex: (d.gender === 'male' ? 'Masculino' : d.gender === 'female' ? 'Femenino' : 'Otro') as ClinicalRecord['sex'],
    age: Number(d.age ?? 0),
    education: String(d.education ?? ''),
    occupation: String(d.occupation ?? ''),
    religion: String(d.religion ?? ''),
    bloodType: String(d.bloodType ?? ''),
    consultationReason: String(d.consultationReason ?? ''),
    date: String(raw.date ?? d.date ?? ''),
    phone: String(d.phone ?? ''),
    weight: Number(d.weightKg ?? d.weight ?? 0),
    maritalStatus: String(d.maritalStatus ?? ''),
    allergies: String(d.allergies ?? ''),
    feedingDifficulty: Boolean(d.feedingDifficulty),
    address: String(d.address ?? ''),
    height: Number(d.heightCm ?? d.height ?? 0),
    familyObesity: Boolean(d.familyObesity),
    familyCancer: Boolean(d.familyCancer),
    familyHypertension: Boolean(d.familyHypertension),
    familyHIV: Boolean(d.familyHIV),
    familyDiabetesType1: Boolean(d.familyDiabetesType1),
    familyDiabetesType2: Boolean(d.familyDiabetesType2),
    familyOther: String(d.familyOther ?? ''),
    personalDiarrhea: Boolean(d.personalDiarrhea),
    personalColitis: Boolean(d.personalColitis),
    personalReflux: Boolean(d.personalReflux),
    personalConstipation: Boolean(d.personalConstipation),
    personalNausea: Boolean(d.personalNausea),
    personalOther: String(d.personalOther ?? ''),
    personalGastritis: Boolean(d.personalGastritis),
    personalVomiting: Boolean(d.personalVomiting),
    labGlucose: Number(d.labGlucose ?? 0),
    labCholesterol: Number(d.labCholesterol ?? 0),
    labTriglycerides: Number(d.labTriglycerides ?? 0),
    physicalHair: String(d.physicalHair ?? ''),
    physicalMouth: String(d.physicalMouth ?? ''),
    physicalTeeth: String(d.physicalTeeth ?? ''),
    physicalEyes: String(d.physicalEyes ?? ''),
    physicalGums: String(d.physicalGums ?? ''),
    physicalNails: String(d.physicalNails ?? ''),
    mealsPerDay: Number(d.mealsPerDay ?? 0),
    mealsPlace: (d.mealsPlace as ClinicalRecord['mealsPlace']) ?? ('Casa' as ClinicalRecord['mealsPlace']),
    consumesSpicy: Boolean(d.consumesSpicy),
    consumesCanned: Boolean(d.consumesCanned),
    consumesAddedSalt: Boolean(d.consumesAddedSalt),
    consumesSugar: Boolean(d.consumesSugar),
    cookingFat: d.cookingFat
      ? {
          margarine: Boolean((d.cookingFat as Record<string, unknown>).margarine),
          butter: Boolean((d.cookingFat as Record<string, unknown>).butter),
          vegetableOil: Boolean((d.cookingFat as Record<string, unknown>).vegetableOil),
          lard: Boolean((d.cookingFat as Record<string, unknown>).lard),
        }
      : { margarine: false, butter: false, vegetableOil: false, lard: false },
    drinksWater: Boolean(d.drinksWater),
    waterAmountMl: Number(d.waterAmountMl ?? 0),
    exercises: Boolean(d.exercises),
    exerciseFrequency: String(d.exerciseFrequency ?? ''),
    exerciseTime: String(d.exerciseTime ?? ''),
    // Métricas calculadas por el backend
    bmi: Number(raw.bmi ?? d.bmi ?? 0),
    bmiClassification: String(d.bmiClassification ?? ''),
    bodyFatPercentage: Number(raw.bodyFatPercentage ?? d.bodyFatPercentage ?? 0),
    visceralFat: Number(d.visceralFat ?? 0),
    muscleMass: Number(d.muscleMass ?? 0),
    biologicalAge: Number(d.biologicalAge ?? 0),
    restingMetabolism: Number(d.restingMetabolism ?? 0),
    riskLevel: String(raw.riskLevel ?? d.riskLevel ?? ''),
  };
}

export const clinicalRecordRepository: ClinicalRecordRepository = {
  async getByPatientId(patientId) {
    const { data } = await axiosClient.get(`/v1/clinical-records/patient/${patientId}`);
    const rawRecords: ApiRecord[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return rawRecords.map(mapRecord);
  },

  async getById(id) {
    try {
      const { data } = await axiosClient.get(`/v1/clinical-records/${id}`);
      const raw = (data?.data ?? data) as ApiRecord;
      return mapRecord(raw);
    } catch {
      return null;
    }
  },

  async create(record) {
    const { data } = await axiosClient.post('/v1/clinical-records', {
      patientId: record.patientId,
      date: record.date,
      data: {
        name: record.name,
        sex: record.sex,
        age: record.age,
        education: record.education,
        occupation: record.occupation,
        religion: record.religion,
        bloodType: record.bloodType,
        consultationReason: record.consultationReason,
        phone: record.phone,
        weightKg: record.weight,
        maritalStatus: record.maritalStatus,
        allergies: record.allergies,
        feedingDifficulty: record.feedingDifficulty,
        address: record.address,
        heightCm: record.height,
        familyCancer: record.familyCancer,
        familyHypertension: record.familyHypertension,
        familyHIV: record.familyHIV,
        familyDiabetesType1: record.familyDiabetesType1,
        familyDiabetesType2: record.familyDiabetesType2,
        familyOther: record.familyOther,
        familyObesity: record.familyObesity,
        personalDiarrhea: record.personalDiarrhea,
        personalColitis: record.personalColitis,
        personalReflux: record.personalReflux,
        personalConstipation: record.personalConstipation,
        personalNausea: record.personalNausea,
        personalOther: record.personalOther,
        personalGastritis: record.personalGastritis,
        personalVomiting: record.personalVomiting,
        labGlucose: record.labGlucose,
        labCholesterol: record.labCholesterol,
        labTriglycerides: record.labTriglycerides,
        physicalHair: record.physicalHair,
        physicalMouth: record.physicalMouth,
        physicalTeeth: record.physicalTeeth,
        physicalEyes: record.physicalEyes,
        physicalGums: record.physicalGums,
        physicalNails: record.physicalNails,
        mealsPerDay: record.mealsPerDay,
        mealsPlace: record.mealsPlace,
        consumesSpicy: record.consumesSpicy,
        consumesCanned: record.consumesCanned,
        consumesAddedSalt: record.consumesAddedSalt,
        consumesSugar: record.consumesSugar,
        cookingFat: record.cookingFat,
        drinksWater: record.drinksWater,
        waterAmountMl: record.waterAmountMl,
        exercises: record.exercises,
        exerciseFrequency: record.exerciseFrequency,
        exerciseTime: record.exerciseTime,
        bmi: record.bmi,
        bmiClassification: record.bmiClassification,
        bodyFatPercentage: record.bodyFatPercentage,
        visceralFat: record.visceralFat,
        muscleMass: record.muscleMass,
        biologicalAge: record.biologicalAge,
        restingMetabolism: record.restingMetabolism,
        riskLevel: record.riskLevel,
      },
    });
    const raw = (data?.data ?? data) as ApiRecord;
    return mapRecord(raw);
  },

  async update(id, updates) {
    const { data } = await axiosClient.patch(`/v1/clinical-records/${id}`, {
      data: {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.sex !== undefined ? { sex: updates.sex } : {}),
        ...(updates.age !== undefined ? { age: updates.age } : {}),
        ...(updates.education !== undefined ? { education: updates.education } : {}),
        ...(updates.occupation !== undefined ? { occupation: updates.occupation } : {}),
        ...(updates.religion !== undefined ? { religion: updates.religion } : {}),
        ...(updates.bloodType !== undefined ? { bloodType: updates.bloodType } : {}),
        ...(updates.consultationReason !== undefined ? { consultationReason: updates.consultationReason } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
        ...(updates.weight !== undefined ? { weightKg: updates.weight } : {}),
        ...(updates.maritalStatus !== undefined ? { maritalStatus: updates.maritalStatus } : {}),
        ...(updates.allergies !== undefined ? { allergies: updates.allergies } : {}),
      },
    });
    const raw = (data?.data ?? data) as ApiRecord;
    return mapRecord(raw);
  },

  async delete(id) {
    await axiosClient.delete(`/v1/clinical-records/${id}`);
  },
};