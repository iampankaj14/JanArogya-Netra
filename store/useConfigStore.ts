import { create } from 'zustand';

interface ConfigState {
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLanguage: (language: 'en' | 'hi') => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  theme: 'light',
  language: 'en',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setLanguage: (language) => set({ language }),
}));
