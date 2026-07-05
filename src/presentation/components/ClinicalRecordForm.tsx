'use client';

import type { ClinicalRecord } from '@/src/core/entities/ClinicalRecord';
import CheckboxField from '@/src/presentation/components/CheckboxField';
import NumericField from '@/src/presentation/components/NumericField';
import SectionCard from '@/src/presentation/components/SectionCard';
import TextField from '@/src/presentation/components/TextField';

interface ClinicalRecordFormProps {
  record: ClinicalRecord;
  onChange: <K extends keyof ClinicalRecord>(field: K, value: ClinicalRecord[K]) => void;
  onSave: () => void;
  onRecalculate: () => void;
  isSaving: boolean;
}

export default function ClinicalRecordForm({
  record,
  onChange,
  onSave,
  onRecalculate,
  isSaving,
}: ClinicalRecordFormProps) {
  return (
    <div className="space-y-6">
      <SectionCard title="Datos personales">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Nombre completo"
            value={record.name}
            onChange={(value) => onChange('name', value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
            <select
              value={record.sex}
              onChange={(event) =>
                onChange('sex', event.target.value as ClinicalRecord['sex'])
              }
              className="panel-select"
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <NumericField
            label="Edad (años)"
            value={record.age}
            step={1}
            min={0}
            onChange={(value) => onChange('age', value)}
          />

          <TextField
            label="Escolaridad"
            value={record.education}
            onChange={(value) => onChange('education', value)}
          />
          <TextField
            label="Ocupación"
            value={record.occupation}
            onChange={(value) => onChange('occupation', value)}
          />
          <TextField
            label="Religión"
            value={record.religion}
            onChange={(value) => onChange('religion', value)}
          />
          <TextField
            label="Tipo de sangre"
            value={record.bloodType}
            onChange={(value) => onChange('bloodType', value)}
          />
          <TextField
            label="Motivo de consulta"
            value={record.consultationReason}
            onChange={(value) => onChange('consultationReason', value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de consulta</label>
            <input
              type="date"
              value={record.date}
              onChange={(event) => onChange('date', event.target.value)}
              className="panel-input"
            />
          </div>
          <TextField
            label="Teléfono"
            value={record.phone}
            onChange={(value) => onChange('phone', value)}
          />
          <NumericField
            label="Peso (kg)"
            value={record.weight}
            onChange={(value) => onChange('weight', value)}
          />
          <TextField
            label="Estado civil"
            value={record.maritalStatus}
            onChange={(value) => onChange('maritalStatus', value)}
          />
          <TextField
            label="Alergias"
            value={record.allergies}
            onChange={(value) => onChange('allergies', value)}
          />
          <div className="md:col-span-3">
            <CheckboxField
              label="¿Tiene dificultad para alimentarse?"
              checked={record.feedingDifficulty}
              onChange={(checked) => onChange('feedingDifficulty', checked)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Domicilio y medidas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Domicilio"
            value={record.address}
            onChange={(value) => onChange('address', value)}
          />
          <NumericField
            label="Estatura (cm)"
            value={record.height}
            onChange={(value) => onChange('height', value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Antecedentes heredofamiliares">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <CheckboxField
            label="Cáncer"
            checked={record.familyCancer}
            onChange={(checked) => onChange('familyCancer', checked)}
          />
          <CheckboxField
            label="Hipertensión"
            checked={record.familyHypertension}
            onChange={(checked) => onChange('familyHypertension', checked)}
          />
          <CheckboxField
            label="VIH/SIDA"
            checked={record.familyHIV}
            onChange={(checked) => onChange('familyHIV', checked)}
          />
          <CheckboxField
            label="Diabetes tipo 1"
            checked={record.familyDiabetesType1}
            onChange={(checked) => onChange('familyDiabetesType1', checked)}
          />
          <CheckboxField
            label="Diabetes tipo 2"
            checked={record.familyDiabetesType2}
            onChange={(checked) => onChange('familyDiabetesType2', checked)}
          />
          <CheckboxField
            label="Obesidad"
            checked={record.familyObesity}
            onChange={(checked) => onChange('familyObesity', checked)}
          />
          <TextField
            label="Otra"
            value={record.familyOther}
            onChange={(value) => onChange('familyOther', value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Antecedentes patológicos personales">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <CheckboxField
            label="Diarrea"
            checked={record.personalDiarrhea}
            onChange={(checked) => onChange('personalDiarrhea', checked)}
          />
          <CheckboxField
            label="Colitis"
            checked={record.personalColitis}
            onChange={(checked) => onChange('personalColitis', checked)}
          />
          <CheckboxField
            label="Reflujo"
            checked={record.personalReflux}
            onChange={(checked) => onChange('personalReflux', checked)}
          />
          <CheckboxField
            label="Estreñimiento"
            checked={record.personalConstipation}
            onChange={(checked) => onChange('personalConstipation', checked)}
          />
          <CheckboxField
            label="Náusea"
            checked={record.personalNausea}
            onChange={(checked) => onChange('personalNausea', checked)}
          />
          <CheckboxField
            label="Gastritis"
            checked={record.personalGastritis}
            onChange={(checked) => onChange('personalGastritis', checked)}
          />
          <CheckboxField
            label="Vómito"
            checked={record.personalVomiting}
            onChange={(checked) => onChange('personalVomiting', checked)}
          />
          <TextField
            label="Otras"
            value={record.personalOther}
            onChange={(value) => onChange('personalOther', value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Laboratorios">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumericField
            label="Glucosa"
            value={record.labGlucose}
            onChange={(value) => onChange('labGlucose', value)}
          />
          <NumericField
            label="Colesterol"
            value={record.labCholesterol}
            onChange={(value) => onChange('labCholesterol', value)}
          />
          <NumericField
            label="Triglicéridos"
            value={record.labTriglycerides}
            onChange={(value) => onChange('labTriglycerides', value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Exploración física">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Cabello"
            value={record.physicalHair}
            onChange={(value) => onChange('physicalHair', value)}
          />
          <TextField
            label="Boca"
            value={record.physicalMouth}
            onChange={(value) => onChange('physicalMouth', value)}
          />
          <TextField
            label="Dientes"
            value={record.physicalTeeth}
            onChange={(value) => onChange('physicalTeeth', value)}
          />
          <TextField
            label="Ojos"
            value={record.physicalEyes}
            onChange={(value) => onChange('physicalEyes', value)}
          />
          <TextField
            label="Encías"
            value={record.physicalGums}
            onChange={(value) => onChange('physicalGums', value)}
          />
          <TextField
            label="Uñas"
            value={record.physicalNails}
            onChange={(value) => onChange('physicalNails', value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Dieta habitual">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumericField
            label="Comidas por día"
            value={record.mealsPerDay}
            step={1}
            min={0}
            onChange={(value) => onChange('mealsPerDay', value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar de comidas</label>
            <select
              value={record.mealsPlace}
              onChange={(event) =>
                onChange('mealsPlace', event.target.value as ClinicalRecord['mealsPlace'])
              }
              className="panel-select"
            >
              <option value="Casa">Casa</option>
              <option value="Fuera de casa">Fuera de casa</option>
              <option value="Ambos">Ambos</option>
            </select>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <CheckboxField
              label="Consume picante"
              checked={record.consumesSpicy}
              onChange={(checked) => onChange('consumesSpicy', checked)}
            />
            <CheckboxField
              label="Consume enlatados"
              checked={record.consumesCanned}
              onChange={(checked) => onChange('consumesCanned', checked)}
            />
            <CheckboxField
              label="Agrega sal"
              checked={record.consumesAddedSalt}
              onChange={(checked) => onChange('consumesAddedSalt', checked)}
            />
            <CheckboxField
              label="Consume azúcar"
              checked={record.consumesSugar}
              onChange={(checked) => onChange('consumesSugar', checked)}
            />
          </div>

          <div className="md:col-span-3 rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Grasas para cocinar</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <CheckboxField
                label="Margarina"
                checked={record.cookingFat.margarine}
                onChange={(checked) =>
                  onChange('cookingFat', {
                    ...record.cookingFat,
                    margarine: checked,
                  })
                }
              />
              <CheckboxField
                label="Mantequilla"
                checked={record.cookingFat.butter}
                onChange={(checked) =>
                  onChange('cookingFat', {
                    ...record.cookingFat,
                    butter: checked,
                  })
                }
              />
              <CheckboxField
                label="Aceite vegetal"
                checked={record.cookingFat.vegetableOil}
                onChange={(checked) =>
                  onChange('cookingFat', {
                    ...record.cookingFat,
                    vegetableOil: checked,
                  })
                }
              />
              <CheckboxField
                label="Manteca"
                checked={record.cookingFat.lard}
                onChange={(checked) =>
                  onChange('cookingFat', {
                    ...record.cookingFat,
                    lard: checked,
                  })
                }
              />
            </div>
          </div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <CheckboxField
              label="¿Consume agua?"
              checked={record.drinksWater}
              onChange={(checked) => onChange('drinksWater', checked)}
            />
            <NumericField
              label="Cantidad de agua (ml)"
              value={record.waterAmountMl}
              step={50}
              min={0}
              onChange={(value) => onChange('waterAmountMl', value)}
            />
            <CheckboxField
              label="¿Realiza ejercicio?"
              checked={record.exercises}
              onChange={(checked) => onChange('exercises', checked)}
            />
            <TextField
              label="Frecuencia del ejercicio"
              value={record.exerciseFrequency}
              onChange={(value) => onChange('exerciseFrequency', value)}
            />
            <TextField
              label="Tiempo por sesión"
              value={record.exerciseTime}
              onChange={(value) => onChange('exerciseTime', value)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Resultados calculados (simulacion)"
        description="TODO: Reemplazar con llamada al backend real."
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <NumericField label="IMC" value={record.bmi} readOnly />
          <TextField label="Clasificacion IMC" value={record.bmiClassification} readOnly />
          <NumericField label="% Grasa" value={record.bodyFatPercentage} readOnly />
          <NumericField label="Grasa visceral" value={record.visceralFat} readOnly />
          <NumericField label="Masa muscular" value={record.muscleMass} readOnly />
          <NumericField label="Edad biologica" value={record.biologicalAge} readOnly />
          <NumericField label="Metabolismo basal" value={record.restingMetabolism} readOnly />
          <TextField label="Nivel de riesgo" value={record.riskLevel} readOnly />
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          onClick={onRecalculate}
          className="btn-brand-outline"
          disabled={isSaving}
        >
          Recalcular métricas
        </button>
        <button
          type="button"
          onClick={onSave}
          className="btn-brand"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
