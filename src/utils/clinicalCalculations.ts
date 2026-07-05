interface BodyMetrics {
  weight: number; // kg
  height: number; // cm
  age: number;
  sex: 'Masculino' | 'Femenino' | 'Otro';
}

interface CalculatedResults {
  bmi: number;
  bmiClassification: string;
  bodyFatPercentage: number;
  visceralFat: number;
  muscleMass: number;
  biologicalAge: number;
  restingMetabolism: number;
  riskLevel: string;
}

/**
 * SIMULACION: Calcula metricas basadas en datos del paciente.
 * TODO: Reemplazar con llamada al backend real.
 */
export function calculateClinicalMetrics(metrics: BodyMetrics): CalculatedResults {
  const { weight, height, age, sex } = metrics;
  const heightM = height / 100;

  const bmi = weight / (heightM * heightM);
  let bmiClassification = '';
  if (bmi < 18.5) bmiClassification = 'Bajo peso';
  else if (bmi < 25) bmiClassification = 'Normal';
  else if (bmi < 30) bmiClassification = 'Sobrepeso';
  else bmiClassification = 'Obesidad';

  let bodyFatPercentage = 0;
  if (sex === 'Masculino') {
    bodyFatPercentage = 1.2 * bmi + 0.23 * age - 16.2;
  } else {
    bodyFatPercentage = 1.2 * bmi + 0.23 * age - 5.4;
  }
  bodyFatPercentage = Math.max(5, Math.min(50, bodyFatPercentage));

  const visceralFat = Math.round(bmi / 3 + (age > 50 ? 2 : 0) + (sex === 'Masculino' ? 1 : 0));

  let muscleMass = 0;
  if (sex === 'Masculino') {
    muscleMass = 45 - bmi * 0.3 + age * 0.05;
  } else {
    muscleMass = 35 - bmi * 0.25 + age * 0.04;
  }
  muscleMass = Math.max(20, Math.min(50, muscleMass));

  const biologicalAge = age + (bmi > 30 ? 5 : bmi > 25 ? 2 : 0) - (bodyFatPercentage < 20 ? 2 : 0);

  let restingMetabolism = 0;
  if (sex === 'Masculino') {
    restingMetabolism = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    restingMetabolism = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
  restingMetabolism = Math.round(restingMetabolism);

  let riskLevel = 'Normal';
  if (bmi >= 30 || visceralFat >= 12) riskLevel = 'Alto';
  else if (bmi >= 25 || visceralFat >= 7) riskLevel = 'Medio';
  else if (bmi < 18.5) riskLevel = 'Bajo';

  return {
    bmi: Number.parseFloat(bmi.toFixed(1)),
    bmiClassification,
    bodyFatPercentage: Number.parseFloat(bodyFatPercentage.toFixed(1)),
    visceralFat,
    muscleMass: Number.parseFloat(muscleMass.toFixed(1)),
    biologicalAge: Math.round(biologicalAge),
    restingMetabolism,
    riskLevel,
  };
}
