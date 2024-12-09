import { create } from 'zustand';
import { fetchPayrollRecords } from "@/lib/payroll-service";

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
  loadPayrollRecords: (companyId: number) => Promise<void>;
  addRecord: (record: Omit<PayrollRecord, 'id' | 'createdAt'>) => void;
  getEmployeeRecords: (employeeId: number) => PayrollRecord[];
  getRecordsByDateRange: (start: string, end: string) => PayrollRecord[];
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  records: [],

  async loadPayrollRecords(companyId: number) {
    const data = await fetchPayrollRecords(companyId);
    const mapped = data.map((rec: any) => {
      const totalDeductions = parseFloat(rec.total_deductions);
      const tax = parseFloat(rec.withholding_tax);
      const retirement = parseFloat(rec.retirement_payment) + parseFloat(rec.roth_retirement_payment);
      const other = totalDeductions - tax - retirement;

      return {
        id: rec.id,
        employeeId: rec.employee_id,
        payPeriodStart: rec.pay_period_start,
        payPeriodEnd: rec.pay_period_end,
        regularHours: parseFloat(rec.hours_worked),
        overtimeHours: parseFloat(rec.overtime_hours_worked),
        tips: parseFloat(rec.reported_tips),
        grossPay: parseFloat(rec.gross_pay),
        netPay: parseFloat(rec.net_pay),
        deductions: {
          tax,
          retirement,
          other: isNaN(other) ? 0 : other,
        },
        status: rec.status,
        createdAt: rec.created_at,
      };
    });
    set({ records: mapped });
  },

  addRecord(record) {
    set((state) => ({
      records: [
        ...state.records,
        {
          ...record,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  },

  getEmployeeRecords(employeeId) {
    return get().records.filter((record) => record.employeeId === employeeId);
  },

  getRecordsByDateRange(start, end) {
    return get().records.filter(
      (record) => record.payPeriodStart >= start && record.payPeriodEnd <= end
    );
  },
}));
