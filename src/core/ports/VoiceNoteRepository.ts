import type { VoiceNote } from '../entities/VoiceNote';

export interface VoiceNoteRepository {
  getById(id: string): Promise<VoiceNote | null>;
  create(note: Omit<VoiceNote, 'id' | 'createdAt'>): Promise<VoiceNote>;
  delete(id: string): Promise<void>;
}