'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientFormSchema, type PatientFormValues } from '@/src/utils/validations';

interface PatientFormProps {
  initialValues?: PatientFormValues;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (values: PatientFormValues) => Promise<void> | void;
  onCancel: () => void;
}

const emptyValues: PatientFormValues = {
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: undefined,
};

export default function PatientForm({
  initialValues,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: initialValues ?? emptyValues,
  });

  useEffect(() => {
    reset(initialValues ?? emptyValues);
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            {...register('name')}
            className="panel-input"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            {...register('email')}
            className="panel-input"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            {...register('phone', {
              onChange: (event) => {
                event.target.value = event.target.value.replace(/\D/g, '');
              },
            })}
            className="panel-input"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            {...register('birthDate')}
            className="panel-input"
          />
          {errors.birthDate && (
            <p className="mt-1 text-xs text-red-600">{errors.birthDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
          <select
            {...register('gender')}
            className="panel-select"
          >
            <option value="">Sin especificar</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-brand-outline"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-brand"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
