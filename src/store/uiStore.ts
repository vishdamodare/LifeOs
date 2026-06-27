import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiState {
  toasts: ToastMessage[];
  activeDrawerId: string | null;
  drawerData: any | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  openDrawer: (drawerId: string, data?: any) => void;
  closeDrawer: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  activeDrawerId: null,
  drawerData: null,
  
  showToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 3000);
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },
  
  openDrawer: (drawerId, data = null) => {
    set({ activeDrawerId: drawerId, drawerData: data });
  },
  
  closeDrawer: () => {
    set({ activeDrawerId: null, drawerData: null });
  }
}));
