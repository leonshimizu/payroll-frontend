import { create } from 'zustand';
import api from '@/lib/api';
import {
  fetchCompanies,
  fetchCompany,
  fetchDepartments,
  fetchEmployees,
} from '@/lib/company-service';
import { usePayrollStore } from '@/lib/store/payroll-store';
import { useCustomColumnsStore } from '@/lib/store/custom-columns-store';

export interface Company {
  id: number;
  name: string;
  address: string;
  location: string;
  employeeCount: number;
}

export interface Department {
  id: number;
  companyId: number;
  name: string;
  employeeCount: number;
}

export interface Employee {
  id: number;
  departmentId: number;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  payrollType: 'hourly' | 'salary';
  payRate: number;
  filingStatus: string;
  retirementRate: number;
  rothRetirementRate: number;
}

interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  departments: Department[];
  employees: Employee[];
  loadCompanies: () => Promise<void>;
  selectCompanyById: (companyId: number) => Promise<void>;
  loadCompanyData: (companyId: number) => Promise<void>;
  getDepartments: (companyId: number) => Department[];
  getEmployees: (departmentId: number) => Employee[];
  addCompany: (company: Omit<Company, 'id' | 'employeeCount'>) => Promise<void>;
  addDepartment: (department: Omit<Department, 'id' | 'employeeCount' | 'companyId'>) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  selectedCompany: null,
  departments: [],
  employees: [],

  async loadCompanies() {
    const data = await fetchCompanies();
    // Assuming data already matches {id, name, address, location, employee_count}
    const mapped = data.map((c: any) => ({
      id: c.id,
      name: c.name,
      address: c.address,
      location: c.location,
      employeeCount: c.employee_count,
    }));
    set({ companies: mapped });
  },

  async selectCompanyById(companyId) {
    const data = await fetchCompany(companyId);
    const selectedCompany = {
      id: data.id,
      name: data.name,
      address: data.address,
      location: data.location,
      employeeCount: data.employee_count,
    };
    set({ selectedCompany });
    await get().loadCompanyData(companyId);

    // After loading company data, also load payroll records and custom columns
    await usePayrollStore.getState().loadPayrollRecords(companyId);
    await useCustomColumnsStore.getState().loadCustomColumns(companyId);
  },

  async loadCompanyData(companyId: number) {
    const [deptData, empData] = await Promise.all([
      fetchDepartments(companyId),
      fetchEmployees(companyId),
    ]);

    const departments = deptData.map((d: any) => ({
      id: d.id,
      companyId: d.company_id,
      name: d.name,
      employeeCount: d.employee_count,
    }));

    const employees = empData.map((e: any) => ({
      id: e.id,
      departmentId: e.department_id,
      firstName: e.first_name,
      lastName: e.last_name,
      employeeNumber: e.employee_number,
      payrollType: e.payroll_type,
      payRate: parseFloat(e.pay_rate),
      filingStatus: e.filing_status,
      retirementRate: parseFloat(e.retirement_rate),
      rothRetirementRate: parseFloat(e.roth_retirement_rate),
    }));

    set({ departments, employees });
  },

  getDepartments(companyId) {
    return get().departments.filter((dept) => dept.companyId === companyId);
  },

  getEmployees(departmentId) {
    return get().employees.filter((emp) => emp.departmentId === departmentId);
  },

  async addCompany(company) {
    await api.post('/companies', company);
    await get().loadCompanies();
  },

  async addDepartment(department) {
    const company = get().selectedCompany;
    if (!company) return;
    // Adjust request body if needed by backend
    await api.post(`/companies/${company.id}/departments`, { name: department.name });
    await get().loadCompanyData(company.id);
  },

  async addEmployee(employee) {
    const company = get().selectedCompany;
    if (!company) return;
    // Adjust request body if needed by backend
    await api.post(`/companies/${company.id}/employees`, employee);
    await get().loadCompanyData(company.id);
  },
}));
