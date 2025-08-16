import axios from 'axios';
import { Comic, Session } from './types';

const API_BASE = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dummy_token', // MVP: Simple auth
  },
});

export const comicApi = {
  uploadComic: async (file: File, title: string): Promise<Comic> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    const response = await api.post('/comics/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.comic;
  },

  getComic: async (comicId: string): Promise<Comic> => {
    const response = await api.get(`/comics/${comicId}`);
    return response.data.comic;
  },

  getUserComics: async (): Promise<Comic[]> => {
    const response = await api.get('/comics/');
    return response.data.comics;
  },
};

export const sessionApi = {
  createSession: async (comicId: string, characterAssignments?: Record<string, any>): Promise<Session> => {
    const response = await api.post('/sessions/', {
      comic_id: comicId,
      character_assignments: characterAssignments,
    });
    return response.data.session;
  },

  getSession: async (sessionId: string): Promise<Session> => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data.session;
  },

  updateProgress: async (sessionId: string, currentPage: number, currentPanel: number): Promise<Session> => {
    const response = await api.put(`/sessions/${sessionId}/progress`, {
      current_page: currentPage,
      current_panel: currentPanel,
    });
    return response.data.session;
  },

  updateCharacterAssignments: async (sessionId: string, characterAssignments: Record<string, any>): Promise<Session> => {
    const response = await api.put(`/sessions/${sessionId}/characters`, {
      character_assignments: characterAssignments,
    });
    return response.data.session;
  },

  getUserSessions: async (): Promise<Session[]> => {
    const response = await api.get('/sessions/');
    return response.data.sessions;
  },
};

export default api;