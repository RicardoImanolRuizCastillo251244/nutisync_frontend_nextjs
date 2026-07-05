import type { VoiceNote } from '../../core/entities/VoiceNote';
import type { VoiceNoteRepository } from '../../core/ports/VoiceNoteRepository';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';

const loadNotes = (): VoiceNote[] =>
  loadFromLocalStorage<VoiceNote[]>(STORAGE_KEYS.voiceNotes, []);
const saveNotes = (notes: VoiceNote[]): void =>
  saveToLocalStorage(STORAGE_KEYS.voiceNotes, notes);

export const voiceNoteRepository: VoiceNoteRepository = {
  async getById(id) {
    const notes = loadNotes();
    return notes.find((n) => n.id === id) ?? null;
  },

  async create(note) {
    const notes = loadNotes();
    const newNote: VoiceNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveNotes([...notes, newNote]);
    return newNote;
  },

  async delete(id) {
    const notes = loadNotes();
    saveNotes(notes.filter((n) => n.id !== id));
  },
};