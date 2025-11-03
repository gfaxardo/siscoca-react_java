import { create } from 'zustand';

export interface AccionMenu {
  id: string;
  label: string;
  icono: string;
  onClick: () => void;
  color: string;
  peligroso?: boolean;
}

interface MenuActionsStore {
  acciones: AccionMenu[];
  setAcciones: (acciones: AccionMenu[]) => void;
  clearAcciones: () => void;
}

export const useMenuActions = create<MenuActionsStore>((set) => ({
  acciones: [],
  setAcciones: (acciones) => set({ acciones }),
  clearAcciones: () => set({ acciones: [] }),
}));


