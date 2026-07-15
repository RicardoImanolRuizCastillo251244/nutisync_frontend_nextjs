'use client';

import type { MealLog } from '@/src/core/entities/MealLog';

export interface MealLogRow {
  mealName: string;
  log?: MealLog;
}

interface MealLogListProps {
  date: string;
  rows: MealLogRow[];
  onToggleConsumed: (row: MealLogRow) => void;
  isUpdating: boolean;
}

export default function MealLogList({ date, rows, onToggleConsumed, isUpdating }: MealLogListProps) {
  return (
    <div className="panel-card p-4">
      <h3 className="text-base font-semibold text-gray-800 mb-1">Registros del día</h3>
      <p className="text-sm text-gray-500 mb-4">Fecha: {date}</p>

      <div className="space-y-2">
        {rows.map((row) => {
          const consumed = row.log?.consumed ?? false;
          const note = row.log?.substituteNote;
          const voiceUrl = row.log?.voiceNoteUrl;
          const voiceDuration = row.log?.voiceNoteDurationSec;

          return (
            <div key={row.mealName} className="rounded-lg border border-gray-100 bg-white/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800">{row.mealName}</p>
                  <p className={`text-xs ${consumed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {consumed ? 'Consumido' : 'Pendiente'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleConsumed(row)}
                  disabled={isUpdating}
                  className="btn-brand-outline"
                >
                  {consumed ? 'Marcar pendiente' : 'Marcar consumida'}
                </button>
              </div>

              {consumed && (note || voiceUrl) && (
                <div className="mt-3 space-y-2 border-t border-gray-100 pt-2">
                  {note && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Nota del paciente</p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">{note}</p>
                    </div>
                  )}
                  {voiceUrl && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Nota de voz {voiceDuration != null ? `(${voiceDuration}s)` : ''}
                      </p>
                      <audio controls className="w-full h-8" preload="metadata">
                        <source src={voiceUrl} type="audio/m4a" />
                        <source src={voiceUrl} type="audio/mp4" />
                        <source src={voiceUrl} />
                        Tu navegador no soporta audio.
                      </audio>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}