'use client';

import { useEffect } from 'react';
import PatientForm from '@/src/presentation/components/PatientForm';
import type { PatientFormValues } from '@/src/utils/validations';

interface AddPatientModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  initialValues?: PatientFormValues;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: PatientFormValues) => Promise<void> | void;
}

export default function AddPatientModal({
  isOpen,
  title,
  submitLabel,
  initialValues,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddPatientModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl panel-card p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">Completa los datos del paciente.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-brand-outline px-3"
            disabled={isSubmitting}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <PatientForm
          initialValues={initialValues}
          submitLabel={submitLabel}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
