import type { ClinicalRecord } from '../../core/entities/ClinicalRecord';
import type { ClinicalRecordRepository } from '../../core/ports/ClinicalRecordRepository';
import axiosClient from '../api/axiosClient';

type ApiRecord = {
  id: string;
  patientId: string;
  date: string;
  // Flat columns from backend
  name?: string | null;
  sex?: string | null;
  age?: number | null;
  occupation?: string | null;
  bloodType?: string | null;
  consultationReason?: string | null;
  phone?: string | null;
  weightKg?: number | null;
  heightCm?: number | null;
  maritalStatus?: string | null;
  allergies?: string | null;
  feedingDifficulty?: boolean | null;
  address?: string | null;
  familyObesity?: boolean | null;
  familyCancer?: boolean | null;
  familyHypertension?: boolean | null;
  familyHIV?: boolean | null;
  familyDiabetesType1?: boolean | null;
  familyDiabetesType2?: boolean | null;
  familyOther?: string | null;
  personalDiarrhea?: boolean | null;
  personalColitis?: boolean | null;
  personalReflux?: boolean | null;
  personalConstipation?: boolean | null;
  personalNausea?: boolean | null;
  personalGastritis?: boolean | null;
  personalVomiting?: boolean | null;
  personalOther?: string | null;
  labGlucose?: number | null;
  labCholesterol?: number | null;
  labTriglycerides?: number | null;
  physicalHair?: string | null;
  physicalMouth?: string | null;
  physicalTeeth?: string | null;
  physicalEyes?: string | null;
  physicalGums?: string | null;
  physicalNails?: string | null;
  bmi?: number | null;
  bmiClassification?: string | null;
  bodyFatPercentage?: number | null;
  visceralFat?: number | null;
  muscleMass?: number | null;
  biologicalAge?: number | null;
  restingMetabolism?: number | null;
  riskLevel?: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapRecord(raw: ApiRecord): ClinicalRecord {
  const sex = raw.sex === 'Masculino' ? 'Masculino'
    : raw.sex === 'Femenino' ? 'Femenino'
    : 'Otro';
  return {
    id: String(raw.id ?? ''),
    patientId: String(raw.patientId ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    name: String(raw.name ?? ''),
    sex: sex as ClinicalRecord['sex'],
    age: Number(raw.age ?? 0),
    education: '',
    occupation: String(raw.occupation ?? ''),
    religion: '',
    bloodType: String(raw.bloodType ?? ''),
    consultationReason: String(raw.consultationReason ?? ''),
    date: String(raw.date ?? ''),
    phone: String(raw.phone ?? ''),
    weight: Number(raw.weightKg ?? 0),
    maritalStatus: String(raw.maritalStatus ?? ''),
    allergies: String(raw.allergies ?? ''),
    feedingDifficulty: Boolean(raw.feedingDifficulty),
    address: String(raw.address ?? ''),
    height: Number(raw.heightCm ?? 0),
    familyObesity: Boolean(raw.familyObesity),
    familyCancer: Boolean(raw.familyCancer),
    familyHypertension: Boolean(raw.familyHypertension),
    familyHIV: Boolean(raw.familyHIV),
    familyDiabetesType1: Boolean(raw.familyDiabetesType1),
    familyDiabetesType2: Boolean(raw.familyDiabetesType2),
    familyOther: String(raw.familyOther ?? ''),
    personalDiarrhea: Boolean(raw.personalDiarrhea),
    personalColitis: Boolean(raw.personalColitis),
    personalReflux: Boolean(raw.personalReflux),
    personalConstipation: Boolean(raw.personalConstipation),
    personalNausea: Boolean(raw.personalNausea),
    personalOther: String(raw.personalOther ?? ''),
    personalGastritis: Boolean(raw.personalGastritis),
    personalVomiting: Boolean(raw.personalVomiting),
    labGlucose: Number(raw.labGlucose ?? 0),
    labCholesterol: Number(raw.labCholesterol ?? 0),
    labTriglycerides: Number(raw.labTriglycerides ?? 0),
    physicalHair: String(raw.physicalHair ?? ''),
    physicalMouth: String(raw.physicalMouth ?? ''),
    physicalTeeth: String(raw.physicalTeeth ?? ''),
    physicalEyes: String(raw.physicalEyes ?? ''),
    physicalGums: String(raw.physicalGums ?? ''),
    physicalNails: String(raw.physicalNails ?? ''),
    mealsPerDay: 0,
    mealsPlace: 'Casa',
    consumesSpicy: false,
    consumesCanned: false,
    consumesAddedSalt: false,
    consumesSugar: false,
    cookingFat: { margarine: false, butter: false, vegetableOil: false, lard: false },
    drinksWater: false,
    waterAmountMl: 0,
    exercises: false,
    exerciseFrequency: '',
    exerciseTime: '',
    bmi: Number(raw.bmi ?? 0),
    bmiClassification: String(raw.bmiClassification ?? ''),
    bodyFatPercentage: Number(raw.bodyFatPercentage ?? 0),
    visceralFat: Number(raw.visceralFat ?? 0),
    muscleMass: Number(raw.muscleMass ?? 0),
    biologicalAge: Number(raw.biologicalAge ?? 0),
    restingMetabolism: Number(raw.restingMetabolism ?? 0),
    riskLevel: String(raw.riskLevel ?? ''),
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
      name: record.name,
      sex: record.sex,
      age: record.age,
      occupation: record.occupation,
      bloodType: record.bloodType,
      consultationReason: record.consultationReason,
      phone: record.phone,
      weightKg: record.weight,
      heightCm: record.height,
      maritalStatus: record.maritalStatus,
      allergies: record.allergies,
      feedingDifficulty: record.feedingDifficulty,
      address: record.address,
      familyObesity: record.familyObesity,
      familyCancer: record.familyCancer,
      familyHypertension: record.familyHypertension,
      familyHIV: record.familyHIV,
      familyDiabetesType1: record.familyDiabetesType1,
      familyDiabetesType2: record.familyDiabetesType2,
      familyOther: record.familyOther,
      personalDiarrhea: record.personalDiarrhea,
      personalColitis: record.personalColitis,
      personalReflux: record.personalReflux,
      personalConstipation: record.personalConstipation,
      personalNausea: record.personalNausea,
      personalGastritis: record.personalGastritis,
      personalVomiting: record.personalVomiting,
      personalOther: record.personalOther,
      labGlucose: record.labGlucose,
      labCholesterol: record.labCholesterol,
      labTriglycerides: record.labTriglycerides,
      physicalHair: record.physicalHair,
      physicalMouth: record.physicalMouth,
      physicalTeeth: record.physicalTeeth,
      physicalEyes: record.physicalEyes,
      physicalGums: record.physicalGums,
      physicalNails: record.physicalNails,
      bmi: record.bmi,
      bmiClassification: record.bmiClassification,
      bodyFatPercentage: record.bodyFatPercentage,
      visceralFat: record.visceralFat,
      muscleMass: record.muscleMass,
      biologicalAge: record.biologicalAge,
      restingMetabolism: record.restingMetabolism,
      riskLevel: record.riskLevel,
    });
    const raw = (data?.data ?? data) as ApiRecord;
    return mapRecord(raw);
  },

  async update(id, updates) {
    const payload: Record<string, unknown> = { patientId: updates.patientId };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.sex !== undefined) payload.sex = updates.sex;
    if (updates.age !== undefined) payload.age = updates.age;
    if (updates.occupation !== undefined) payload.occupation = updates.occupation;
    if (updates.bloodType !== undefined) payload.bloodType = updates.bloodType;
    if (updates.consultationReason !== undefined) payload.consultationReason = updates.consultationReason;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.weight !== undefined) payload.weightKg = updates.weight;
    if (updates.maritalStatus !== undefined) payload.maritalStatus = updates.maritalStatus;
    if (updates.allergies !== undefined) payload.allergies = updates.allergies;
    const { data } = await axiosClient.patch(`/v1/clinical-records/${id}`, payload);
    const raw = (data?.data ?? data) as ApiRecord;
    return mapRecord(raw);
  },

  async delete(id) {
    await axiosClient.delete(`/v1/clinical-records/${id}`);
  },
};