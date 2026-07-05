'use client';

import { useVoiceNote } from '@/src/adapters/useVoiceNote';

interface VoiceNotePlayerProps {
  noteId: string | undefined;
}

export default function VoiceNotePlayer({ noteId }: VoiceNotePlayerProps) {
  const { note, isLoading } = useVoiceNote(noteId ?? null);

  if (!noteId) {
    return <span className="text-xs text-gray-400">Sin nota</span>;
  }

  if (isLoading) {
    return <span className="text-xs text-gray-500">Cargando nota...</span>;
  }

  if (!note) {
    return <span className="text-xs text-red-500">Nota no disponible</span>;
  }

  return (
    <audio controls preload="none" className="h-8 w-56">
      <source src={note.audioData} />
      Tu navegador no soporta audio.
    </audio>
  );
}
