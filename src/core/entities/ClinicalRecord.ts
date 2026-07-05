export interface ClinicalRecord {
  id: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;

  // Datos personales
  name: string;
  sex: 'Masculino' | 'Femenino' | 'Otro';
  age: number;
  education: string;
  occupation: string;
  religion: string;
  bloodType: string;
  consultationReason: string;
  date: string;
  phone: string;
  weight: number;
  maritalStatus: string;
  allergies: string;
  feedingDifficulty: boolean;

  // Domicilio y medidas
  address: string;
  height: number;

  // Antecedentes heredofamiliares
  familyObesity: boolean;
  familyCancer: boolean;
  familyHypertension: boolean;
  familyHIV: boolean;
  familyDiabetesType1: boolean;
  familyDiabetesType2: boolean;
  familyOther: string;

  // Antecedentes patológicos personales (gastrointestinales)
  personalDiarrhea: boolean;
  personalColitis: boolean;
  personalReflux: boolean;
  personalConstipation: boolean;
  personalNausea: boolean;
  personalOther: string;
  personalGastritis: boolean;
  personalVomiting: boolean;

  // Laboratorios
  labGlucose: number;
  labCholesterol: number;
  labTriglycerides: number;

  // Exploración física
  physicalHair: string;
  physicalMouth: string;
  physicalTeeth: string;
  physicalEyes: string;
  physicalGums: string;
  physicalNails: string;

  // Dieta habitual
  mealsPerDay: number;
  mealsPlace: 'Casa' | 'Fuera de casa' | 'Ambos';
  consumesSpicy: boolean;
  consumesCanned: boolean;
  consumesAddedSalt: boolean;
  consumesSugar: boolean;
  cookingFat: {
    margarine: boolean;
    butter: boolean;
    vegetableOil: boolean;
    lard: boolean;
  };
  drinksWater: boolean;
  waterAmountMl: number;
  exercises: boolean;
  exerciseFrequency: string;
  exerciseTime: string;

  // Resultados calculados (simulación frontend temporal)
  bmi: number;
  bmiClassification: string;
  bodyFatPercentage: number;
  visceralFat: number;
  muscleMass: number;
  biologicalAge: number;
  restingMetabolism: number;
  riskLevel: string;
}