import api from '../api';
import { Table } from '../../types/database';

export const tableService = {
  getTables: async () => {
    const res = await api.get<{ success: boolean; data: Table[] }>('/tables');
    return res.data.data;
  },
  updateTableStatus: async (id: number, status: string) => {
    const res = await api.patch(`/tables/${id}/status`, { status });
    return res.data;
  }
};