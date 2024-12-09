import { create } from 'zustand';

export interface PayrollRecord {
  id: number;
  employeeId: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  regularHours: number;
  overtimeHours: number;
  tips: number;
  grossPay: number;
  netPay: number;
  deductions: {
    tax: number;
    retirement: number;
    other: number;
  };
  status: 'pending' | 'processed' | 'paid';
  createdAt: string;
}

interface PayrollState {
  records: PayrollRecord[];
  addRecord: (record: Omit<PayrollRecord, 'id' | 'createdAt'>) => void;
  getEmployeeRecords: (employeeId: number) => PayrollRecord[];
  getRecordsByDateRange: (start: string, end: string) => PayrollRecord[];
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  records: [
    {
      id: 1,
      employeeId: 1,
      payPeriodStart: '2024-03-01',
      payPeriodEnd: '2024-03-15',
      regularHours: 80,
      overtimeHours: 5,
      tips: 0,
      grossPay: 3125,
      netPay: 2343.75,
      deductions: {
        tax: 625,
        retirement: 156.25,
        other: 0,
      },
      status: 'paid',
      createdAt: '2024-03-15T12:00:00Z',
    },
    {
      id: 2,
      employeeId: 2,
      payPeriodStart: '2024-03-01',
      payPeriodEnd: '2024-03-15',
      regularHours: 75,
      overtimeHours: 10,
      tips: 200,
      grossPay: 3325,
      netPay: 2493.75,
      deductions: {
        tax: 665,
        retirement: 166.25,
        other: 0,
      },
      status: 'paid',
      createdAt: '2024-03-15T12:00:00Z',
    },
    {
      id: 3,
      employeeId: 3,
      payPeriodStart: '2024-03-01',
      payPeriodEnd: '2024-03-15',
      regularHours: 80,
      overtimeHours: 0,
      tips: 0,
      grossPay: 2500,
      netPay: 1875,
      deductions: {
        tax: 500,
        retirement: 125,
        other: 0,
      },
      status: 'paid',
      createdAt: '2024-03-15T12:00:00Z',
    },
  ],
  addRecord: (record) => {
    set((state) => ({
      records: [
        ...state.records,
        {
          ...record,
          id: state.records.length + 1,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  },
  getEmployeeRecords: (employeeId) => {
    return get().records.filter((record) => record.employeeId === employeeId);
  },
  getRecordsByDateRange: (start, end) => {
    return get().records.filter(
      (record) =>
        record.payPeriodStart >= start && record.payPeriodEnd <= end
    );
  },
}));