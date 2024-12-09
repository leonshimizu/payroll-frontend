import api from '@/lib/api';

export async function fetchCompanies() {
  const response = await api.get('/companies');
  // If needed, map employee_count to employeeCount
  const data = response.data.map((c: any) => ({
    ...c,
    employeeCount: c.employee_count
  }));
  return data;
}

export async function fetchCompany(companyId: number) {
  const response = await api.get(`/companies/${companyId}`);
  return response.data;
}

export async function fetchDepartments(companyId: number) {
  const response = await api.get(`/companies/${companyId}/departments`);
  return response.data;
}

export async function fetchEmployees(companyId: number) {
  const response = await api.get(`/companies/${companyId}/employees`);
  return response.data;
}

export async function fetchCustomColumns(companyId: number) {
  const response = await api.get(`/companies/${companyId}/custom_columns`);
  return response.data;
}
