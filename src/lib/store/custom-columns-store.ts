import { create } from 'zustand';
import { fetchCustomColumns } from "@/lib/company-service";

export interface CustomColumn {
  id: number;
  companyId: number;
  name: string;
  dataType: string;
  isDeduction: boolean;
  includeInPayroll: boolean;
  notSubjectToWithholding: boolean;
}

interface CustomColumnsState {
  columns: CustomColumn[];
  loadCustomColumns: (companyId: number) => Promise<void>;
  addColumn: (column: Omit<CustomColumn, 'id'>) => void;
  updateColumn: (id: number, updates: Partial<CustomColumn>) => void;
  deleteColumn: (id: number) => void;
  getCompanyColumns: (companyId: number) => CustomColumn[];
}

export const useCustomColumnsStore = create<CustomColumnsState>((set, get) => ({
  columns: [],

  async loadCustomColumns(companyId) {
    const data = await fetchCustomColumns(companyId);
    const mapped = data.map((col: any) => ({
      id: col.id,
      companyId: col.company_id,
      name: col.name,
      dataType: col.data_type,
      isDeduction: !!col.is_deduction,
      includeInPayroll: !!col.include_in_payroll,
      notSubjectToWithholding: !!col.not_subject_to_withholding,
    }));

    set((state) => ({
      columns: state.columns
        .filter((col) => col.companyId !== companyId)
        .concat(mapped),
    }));
  },

  addColumn(column) {
    // Ideally call API POST and then reload columns.
    set((state) => ({
      columns: [...state.columns, { ...column, id: Date.now() }],
    }));
  },

  updateColumn(id, updates) {
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, ...updates } : col
      ),
    }));
  },

  deleteColumn(id) {
    set((state) => ({
      columns: state.columns.filter((col) => col.id !== id),
    }));
  },

  getCompanyColumns(companyId) {
    return get().columns.filter((col) => col.companyId === companyId);
  },
}));
