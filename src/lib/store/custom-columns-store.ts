import { create } from 'zustand';

export type ColumnType = 'number' | 'percentage' | 'text';

export interface CustomColumn {
  id: number;
  companyId: number;
  name: string;
  type: ColumnType;
  isDeduction: boolean;
  includeInPayroll: boolean;
  notSubjectToWithholding: boolean;
}

interface CustomColumnsState {
  columns: CustomColumn[];
  addColumn: (column: Omit<CustomColumn, 'id'>) => void;
  updateColumn: (id: number, updates: Partial<CustomColumn>) => void;
  deleteColumn: (id: number) => void;
  getCompanyColumns: (companyId: number) => CustomColumn[];
}

export const useCustomColumnsStore = create<CustomColumnsState>((set, get) => ({
  columns: [
    {
      id: 1,
      companyId: 1,
      name: 'Bonus',
      type: 'number',
      isDeduction: false,
      includeInPayroll: true,
      notSubjectToWithholding: false,
    },
    {
      id: 2,
      companyId: 1,
      name: 'Health Insurance',
      type: 'number',
      isDeduction: true,
      includeInPayroll: true,
      notSubjectToWithholding: true,
    },
    {
      id: 3,
      companyId: 1,
      name: 'Parking',
      type: 'number',
      isDeduction: true,
      includeInPayroll: true,
      notSubjectToWithholding: true,
    },
    {
      id: 4,
      companyId: 2,
      name: 'Commission',
      type: 'percentage',
      isDeduction: false,
      includeInPayroll: true,
      notSubjectToWithholding: false,
    },
  ],
  addColumn: (column) => {
    set((state) => ({
      columns: [...state.columns, { ...column, id: state.columns.length + 1 }],
    }));
  },
  updateColumn: (id, updates) => {
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, ...updates } : col
      ),
    }));
  },
  deleteColumn: (id) => {
    set((state) => ({
      columns: state.columns.filter((col) => col.id !== id),
    }));
  },
  getCompanyColumns: (companyId) => {
    return get().columns.filter((col) => col.companyId === companyId);
  },
}));