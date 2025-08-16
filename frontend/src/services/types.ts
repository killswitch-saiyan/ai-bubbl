// Shared types matching backend models

export interface ComicPanel {
  panel_id: string;
  order: number;
  bubbles: ComicBubble[];
}

export interface ComicBubble {
  bubble_id: string;
  text: string;
  order: number;
  character: string;
  bubble_type: 'speech' | 'thought' | 'narration' | 'sound';
}

export interface ComicPage {
  page_number: number;
  panels: ComicPanel[];
}

export interface ComicMetadata {
  title: string;
  characters: string[];
  reading_direction: 'ltr' | 'rtl';
  style: 'western' | 'manga';
  pages: ComicPage[];
}

export interface Comic {
  id: string;
  title: string;
  user_id: string;
  pdf_url?: string;
  metadata?: ComicMetadata;
  created_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  comic_id: string;
  current_panel: number;
  current_page: number;
  character_assignments?: Record<string, any>;
  created_at?: string;
}

export interface CharacterAssignment {
  player_name: string;
  characters: string[];
  color: string;
}

export interface ReadingState {
  currentPage: number;
  currentPanel: number;
  currentBubble: number;
  isReading: boolean;
}