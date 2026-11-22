import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { voiceNotesService } from '@/services/voiceNotesService';
import { DEFAULT_CATEGORIES } from '@/utils/constants';
import type {
  VoiceNote,
  CategoryInfo,
  VoiceNoteCategory,
  VoiceNoteFilterOptions,
  VoiceNoteInsert,
  VoiceNoteUpdate,
} from '@/types/notes';

export function useNotes(initialFilter?: VoiceNoteFilterOptions) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [categories] = useState<CategoryInfo[]>([...DEFAULT_CATEGORIES]);
  const [filters, setFilters] = useState<VoiceNoteFilterOptions>(initialFilter || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await voiceNotesService.getNotes(user.id, filters);

    if (res.error) {
      setError(res.error.message);
    } else {
      setNotes(res.data || []);
    }

    setIsLoading(false);
  }, [user, filters]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (newNote: Omit<VoiceNoteInsert, 'user_id'>) => {
    if (!user) return { data: null, error: new Error('User is not authenticated') };
    const res = await voiceNotesService.createNote({
      ...newNote,
      user_id: user.id,
    });
    if (res.data) {
      setNotes((prev) => [res.data!, ...prev]);
    }
    return res;
  };

  const updateNote = async (id: string, updates: VoiceNoteUpdate) => {
    const res = await voiceNotesService.updateNote(id, updates);
    if (res.data) {
      setNotes((prev) => prev.map((n) => (n.id === id ? res.data! : n)));
    }
    return res;
  };

  const removeNote = async (id: string, audioPath?: string | null) => {
    const res = await voiceNotesService.deleteNote(id, audioPath);
    if (res.success) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
    return res;
  };

  const setCategoryFilter = (category: VoiceNoteCategory | null) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const setSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  return {
    notes,
    categories,
    filters,
    isLoading,
    error,
    addNote,
    updateNote,
    removeNote,
    setCategoryFilter,
    setSearchQuery,
    reload: fetchNotes,
  };
}
