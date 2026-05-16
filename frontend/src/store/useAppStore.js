import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      user: JSON.parse(localStorage.getItem('user')) || null,
      activeSession: null,
      interviewHistory: [],
      
      setUser: (user) => set({ user }),
      
      setSession: (session) => set({ activeSession: session }),
      
      addHistory: (record) => set((state) => ({ 
        interviewHistory: [record, ...state.interviewHistory] 
      })),
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, activeSession: null });
      }
    }),
    {
      name: 'prepai-storage',
    }
  )
);
