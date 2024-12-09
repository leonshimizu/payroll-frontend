import { create } from 'zustand';
import { PayrollRecord } from './payroll-store';
import { Employee } from './company-store';

export type ReportType = 'ytd' | 'monthly' | 'department';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  departmentId?: number;
  employeeId?: number;
  type: ReportType;
}

export interface ReportSummary {
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  totalDeductions: number;
  employeeCount: number;
  recordCount: number;
}

interface ReportsState {
  generateReport: (
    records: PayrollRecord[],
    employees: Employee[],
    filters: ReportFilters
  ) => ReportSummary;
}

export const useReportsStore = create<ReportsState>(() => ({
  generateReport: (records, employees, filters) => {
    const filteredRecords = records.filter((record) => {
      const recordDate = new Date(record.payPeriodEnd);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);

      const dateInRange = recordDate >= startDate && recordDate <= endDate;
      if (!dateInRange) return false;

      if (filters.employeeId && record.employeeId !== filters.employeeId) return false;

      if (filters.departmentId) {
        const employee = employees.find((e) => e.id === record.employeeId);
        if (!employee || employee.departmentId !== filters.departmentId) return false;
      }

      return true;
    });

    const summary = filteredRecords.reduce(
      (acc, record) => ({
        totalGrossPay: acc.totalGrossPay + record.grossPay,
        totalNetPay: acc.totalNetPay + record.netPay,
        totalTaxes: acc.totalTaxes + record.deductions.tax,
        totalDeductions:
          acc.totalDeductions +
          record.deductions.tax +
          record.deductions.retirement +
          record.deductions.other,
        employeeCount: new Set([...acc.employeeIds, record.employeeId]).size,
        recordCount: acc.recordCount + 1,
        employeeIds: [...acc.employeeIds, record.employeeId],
      }),
      {
        totalGrossPay: 0,
        totalNetPay: 0,
        totalTaxes: 0,
        totalDeductions: 0,
        employeeCount: 0,
        recordCount: 0,
        employeeIds: [] as number[],
      }
    );

    const { employeeIds, ...result } = summary;
    return result;
  },
}));
