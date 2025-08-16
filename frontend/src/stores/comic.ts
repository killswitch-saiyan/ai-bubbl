import { create } from 'zustand';
import { Comic, Session, CharacterAssignment, ReadingState } from '../services/types';

interface ComicStore {
  // State
  comics: Comic[];
  currentComic: Comic | null;
  currentSession: Session | null;
  characterAssignments: CharacterAssignment[];
  readingState: ReadingState;
  isLoading: boolean;
  error: string | null;

  // Actions
  setComics: (comics: Comic[]) => void;
  setCurrentComic: (comic: Comic | null) => void;
  setCurrentSession: (session: Session | null) => void;
  setCharacterAssignments: (assignments: CharacterAssignment[]) => void;
  updateReadingState: (state: Partial<ReadingState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

export const useComicStore = create<ComicStore>((set) => ({
  // Initial state
  comics: [],
  currentComic: null,
  currentSession: null,
  characterAssignments: [],
  readingState: {
    currentPage: 1,
    currentPanel: 1,
    currentBubble: 0,
    isReading: false,
  },
  isLoading: false,
  error: null,

  // Actions
  setComics: (comics) => set({ comics }),
  
  setCurrentComic: (comic) => set({ currentComic: comic }),
  
  setCurrentSession: (session) => set({ currentSession: session }),
  
  setCharacterAssignments: (assignments) => set({ characterAssignments: assignments }),
  
  updateReadingState: (state) =>
    set((prev) => ({
      readingState: { ...prev.readingState, ...state },
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  resetState: () =>
    set({
      currentComic: null,
      currentSession: null,
      characterAssignments: [],
      readingState: {
        currentPage: 1,
        currentPanel: 1,
        currentBubble: 0,
        isReading: false,
      },
      error: null,
    }),
}));