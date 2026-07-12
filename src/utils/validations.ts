import { z } from 'zod';

export const patientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres'),
  email: z.email('Ingresa un correo electrónico válido'),
  phone: z
    .string()
    .trim()
    .regex(/^\d+$/, 'El teléfono solo debe contener números')
    .min(7, 'Ingresa un teléfono válido')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other'], {
    error: 'Selecciona un género válido',
  }).optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const clinicalRecordFormSchema = z.object({
  name: z.string().trim().min(2, 'El nombre completo es obligatorio'),
  sex: z.enum(['Masculino', 'Femenino', 'Otro']),
  age: z.number().min(1, 'La edad debe ser mayor a 0'),
  occupation: z.string().trim().min(1, 'La ocupación es obligatoria'),
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
  familyObesity: z.boolean(),
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
  bmi: z.number(),
  bmiClassification: z.string().trim(),
  bodyFatPercentage: z.number(),
  visceralFat: z.number(),
  muscleMass: z.number(),
  biologicalAge: z.number(),
  restingMetabolism: z.number(),
  riskLevel: z.string().trim(),
});

export type ClinicalRecordFormValues = z.infer<typeof clinicalRecordFormSchema>;