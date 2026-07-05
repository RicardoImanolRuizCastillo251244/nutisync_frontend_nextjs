'use client';

import type { Patient } from '@/src/core/entities/Patient';

interface AssignPlanModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onAssign: () => void;
  onClose: () => void;
}

export default function AssignPlanModal({
  isOpen,
  isSubmitting,
  patients,
  selectedPatientId,
  onSelectPatient,
  onAssign,
  onClose,
}: AssignPlanModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md panel-card p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-800">Asignar plan a paciente</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">Selecciona un paciente para activar este plan.</p>

        <select
          value={selectedPatientId}
          onChange={(event) => onSelectPatient(event.target.value)}
          className="panel-select"
        >
          <option value="">Selecciona un paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name} {patient.lastName}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="btn-brand-outline"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onAssign}
            className="btn-brand"
            disabled={isSubmitting || !selectedPatientId}
          >
            {isSubmitting ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </div>
  );
}
