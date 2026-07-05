'use client';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="panel-card p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
        Panel de Control
        </h1>
        <p className="text-gray-500 mt-1">
        ¡Bienvenido al dashboard de NutriSync! Aquí verás estadísticas y resúmenes.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="panel-card border-l-4 border-l-primary p-6">
          <h3 className="text-gray-500 text-sm">Pacientes totales</h3>
          <p className="text-2xl font-bold text-primary">0</p>
        </div>
        <div className="panel-card border-l-4 border-l-primary p-6">
          <h3 className="text-gray-500 text-sm">Planes activos</h3>
          <p className="text-2xl font-bold text-primary">0</p>
        </div>
        <div className="panel-card border-l-4 border-l-primary p-6">
          <h3 className="text-gray-500 text-sm">Adherencia promedio</h3>
          <p className="text-2xl font-bold text-primary">0%</p>
        </div>
      </div>

      <div className="panel-card p-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Empieza creando o revisando pacientes para activar tus flujos clínicos.</p>
        <button type="button" className="btn-brand">Ir a pacientes</button>
      </div>
    </div>
  );
}