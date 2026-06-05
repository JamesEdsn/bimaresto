import api from '../api';
import { Category, Menu } from '../../types/database';

export const menuService = {
  // --- Categories ---
  getCategories: async () => {
    const res = await api.get<{ success: boolean; data: Category[] }>('/categories');
    return res.data.data;
  },
  createCategory: async (name: string) => {
    const res = await api.post('/categories', { name });
    return res.data;
  },

  // --- Menus ---
  getMenus: async () => {
    const res = await api.get<{ success: boolean; data: Menu[] }>('/menus');
    return res.data.data;
  },
  createMenu: async (menuData: Partial<Menu>) => {
    const res = await api.post('/menus', menuData);
    return res.data;
  },
  updateMenuStatus: async (id: number, is_available: boolean) => {
    const res = await api.put(`/menus/${id}`, { is_available });
    return res.data;
  }
};