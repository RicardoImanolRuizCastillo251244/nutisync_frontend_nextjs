import type { DietPlan } from '@/src/core/entities/DietPlan';

interface PlanSelectorProps {
  plans: DietPlan[];
  selectedPlanId: string | null;
  assignedPatientNamesByPlan: Record<string, string[]>;
  onEdit: (plan: DietPlan) => void;
  onDelete: (plan: DietPlan) => void;
  onAssign: (plan: DietPlan) => void;
}

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

export default function PlanSelector({
  plans,
  selectedPlanId,
  assignedPatientNamesByPlan,
  onEdit,
  onDelete,
  onAssign,
}: PlanSelectorProps) {
  if (plans.length === 0) {
    return (
      <div className="panel-card p-6 text-gray-500">
        No hay planes guardados.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => {
        const assignedNames = assignedPatientNamesByPlan[plan.id] ?? [];
        const isSelected = selectedPlanId === plan.id;

        return (
          <div
            key={plan.id}
            className={`panel-card p-4 ${
              isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-800">{plan.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Creado: {formatDate(plan.createdAt)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Pacientes asignados:{' '}
                  {assignedNames.length > 0 ? assignedNames.join(', ') : 'Sin asignaciones activas'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(plan)}
                  className="btn-brand"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onAssign(plan)}
                  className="btn-brand-outline"
                >
                  Asignar a paciente
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(plan)}
                  className="btn-brand-danger"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
