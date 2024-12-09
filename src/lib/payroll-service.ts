// src/lib/payroll-service.ts
import api from '@/lib/api';

export async function fetchPayrollRecords(companyId: number) {
  const response = await api.get(`/companies/${companyId}/payroll_records`);
  return response.data;
}
