'use client';

import { useMemo } from 'react';
import { useMedications } from '@/src/adapters/useMedications';
import { usePatients } from '@/src/adapters/usePatients';

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

export default function MedicacionPage() {
  const { medications, isLoading, error } = useMedications();
  const { patients } = usePatients();

  const patientMap = useMemo(
    () =>
      new Map(
        patients.map((patient) => [patient.id, `${patient.name} ${patient.lastName}`])
      ),
    [patients]
  );

  const activeMedications = medications.filter((med) => med.active);
  const inactiveMedications = medications.filter((med) => !med.active);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-800">
        Medicación
      </h1>

      <div className="panel-card p-6 text-gray-600">
        Gestiona tratamientos activos y seguimiento de prescripciones nutricionales.
      </div>

      {isLoading && <div className="panel-card p-6 text-gray-500">Cargando medicación...</div>}

      {!isLoading && error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 shadow-sm">
          No se pudieron cargar los datos de medicación.
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="panel-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tratamientos activos</h2>
            {activeMedications.length === 0 ? (
              <p className="text-sm text-gray-500">No hay tratamientos activos por ahora.</p>
            ) : (
              <div className="space-y-3">
                {activeMedications.map((medication) => (
                  <div key={medication.id} className="rounded-xl border border-gray-200 p-4">
                    <p className="font-semibold text-gray-800">{medication.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Paciente: {patientMap.get(medication.patientId) ?? 'No asignado'}
                    </p>
                    <p className="text-sm text-gray-600">Dosis: {medication.dosage}</p>
                    <p className="text-sm text-gray-600">Frecuencia: {medication.frequency}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Inicio: {formatDate(medication.startDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial inactivo</h2>
            {inactiveMedications.length === 0 ? (
              <p className="text-sm text-gray-500">No hay tratamientos inactivos.</p>
            ) : (
              <div className="space-y-3">
                {inactiveMedications.map((medication) => (
                  <div key={medication.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                    <p className="font-semibold text-gray-800">{medication.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Paciente: {patientMap.get(medication.patientId) ?? 'No asignado'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Fin: {medication.endDate ? formatDate(medication.endDate) : 'Sin fecha'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
