import { z } from 'zod';

export const patientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres'),
  lastName: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(80, 'El apellido no puede exceder 80 caracteres'),
  email: z.email('Ingresa un correo electrónico válido'),
  phone: z
    .string()
    .trim()
    .regex(/^\d+$/, 'El teléfono solo debe contener números')
    .min(7, 'Ingresa un teléfono válido')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  gender: z.enum(['male', 'female', 'other'], {
    error: 'Selecciona un género válido',
  }),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const clinicalRecordFormSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre completo es obligatorio'),
    sex: z.enum(['Masculino', 'Femenino', 'Otro']),
    age: z.number().min(1, 'La edad debe ser mayor a 0'),
    education: z.string().trim().min(1, 'La escolaridad es obligatoria'),
    occupation: z.string().trim().min(1, 'La ocupación es obligatoria'),
    religion: z.string().trim(),
    bloodType: z.string().trim(),
    consultationReason: z.string().trim().min(1, 'El motivo de consulta es obligatorio'),
    date: z.string().min(1, 'La fecha de consulta es obligatoria'),
    phone: z.string().trim().min(7, 'Ingresa un teléfono válido'),
    weight: z.number().gt(0, 'El peso debe ser mayor a 0'),
    maritalStatus: z.string().trim().min(1, 'El estado civil es obligatorio'),
    allergies: z.string().trim(),
    feedingDifficulty: z.boolean(),
    address: z.string().trim().min(1, 'El domicilio es obligatorio'),
    height: z.number().gt(0, 'La estatura debe ser mayor a 0'),
    familyCancer: z.boolean(),
    familyHypertension: z.boolean(),
    familyHIV: z.boolean(),
    familyDiabetesType1: z.boolean(),
    familyDiabetesType2: z.boolean(),
    familyOther: z.string().trim(),
    personalDiarrhea: z.boolean(),
    personalColitis: z.boolean(),
    personalReflux: z.boolean(),
    personalConstipation: z.boolean(),
    personalNausea: z.boolean(),
    personalOther: z.string().trim(),
    personalGastritis: z.boolean(),
    personalVomiting: z.boolean(),
    labGlucose: z.number().min(0, 'La glucosa no puede ser negativa'),
    labCholesterol: z.number().min(0, 'El colesterol no puede ser negativo'),
    labTriglycerides: z.number().min(0, 'Los triglicéridos no pueden ser negativos'),
    physicalHair: z.string().trim(),
    physicalMouth: z.string().trim(),
    physicalTeeth: z.string().trim(),
    physicalEyes: z.string().trim(),
    physicalGums: z.string().trim(),
    physicalNails: z.string().trim(),
    mealsPerDay: z.number().int().min(1, 'Las comidas por día deben ser al menos 1'),
    mealsPlace: z.enum(['Casa', 'Fuera de casa', 'Ambos']),
    consumesSpicy: z.boolean(),
    consumesCanned: z.boolean(),
    consumesAddedSalt: z.boolean(),
    consumesSugar: z.boolean(),
    cookingFat: z.object({
      margarine: z.boolean(),
      butter: z.boolean(),
      vegetableOil: z.boolean(),
      lard: z.boolean(),
    }),
    drinksWater: z.boolean(),
    waterAmountMl: z.number().min(0, 'El agua no puede ser negativa'),
    exercises: z.boolean(),
    exerciseFrequency: z.string().trim(),
    exerciseTime: z.string().trim(),
    bmi: z.number(),
    bmiClassification: z.string().trim(),
    bodyFatPercentage: z.number(),
    visceralFat: z.number(),
    muscleMass: z.number(),
    biologicalAge: z.number(),
    restingMetabolism: z.number(),
    riskLevel: z.string().trim(),
  })
  .refine((value) => (value.drinksWater ? value.waterAmountMl > 0 : true), {
    message: 'Si consume agua, la cantidad en ml debe ser mayor a 0',
    path: ['waterAmountMl'],
  });

export type ClinicalRecordFormValues = z.infer<typeof clinicalRecordFormSchema>;
