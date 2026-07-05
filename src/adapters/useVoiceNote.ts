import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voiceNoteRepository } from '../infrastructure/repositories/VoiceNoteRepositoryImpl';
import type { VoiceNote } from '../core/entities/VoiceNote';

export const useVoiceNote = (noteId: string | null) => {
  const queryClient = useQueryClient();

  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['voiceNote', noteId],
    queryFn: async () => {
      if (!noteId) return null;
      return voiceNoteRepository.getById(noteId);
    },
    enabled: !!noteId,
  });

  const createNote = useMutation({
    mutationFn: (note: Omit<VoiceNote, 'id' | 'createdAt'>) =>
      voiceNoteRepository.create(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceNote'] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id: string) => voiceNoteRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceNote'] });
    },
  });

  return {
    note,
    isLoading,
    error,
    createNote: createNote.mutateAsync,
    deleteNote: deleteNote.mutateAsync,
    isCreating: createNote.isPending,
    isDeleting: deleteNote.isPending,
  };
};