import { create } from 'zustand';

export interface Company {
  id: number;
  name: string;
  address: string;
  employeeCount: number;
  location: string;
}

export interface Department {
  id: number;
  name: string;
  companyId: number;
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
}

interface CompanyState {
  companies: Company[];
  departments: Department[];
  employees: Employee[];
  selectedCompany: Company | null;
  selectedDepartment: Department | null;
  addCompany: (company: Omit<Company, 'id'>) => void;
  selectCompany: (company: Company) => void;
  addDepartment: (department: Omit<Department, 'id'>) => void;
  selectDepartment: (department: Department | null) => void;
  getDepartments: (companyId: number) => Department[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  getEmployees: (departmentId: number) => Employee[];
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [
    {
      id: 1,
      name: 'Acme Corp',
      address: '123 Main St',
      employeeCount: 150,
      location: 'New York, NY',
    },
    {
      id: 2,
      name: 'TechStart Inc',
      address: '456 Market St',
      employeeCount: 75,
      location: 'San Francisco, CA',
    },
    {
      id: 3,
      name: 'Global Solutions Ltd',
      address: '789 Business Ave',
      employeeCount: 200,
      location: 'Chicago, IL',
    },
  ],
  departments: [
    { id: 1, name: 'Engineering', companyId: 1, employeeCount: 50 },
    { id: 2, name: 'Marketing', companyId: 1, employeeCount: 25 },
    { id: 3, name: 'Sales', companyId: 2, employeeCount: 30 },
    { id: 4, name: 'Human Resources', companyId: 1, employeeCount: 10 },
    { id: 5, name: 'Research & Development', companyId: 2, employeeCount: 20 },
    { id: 6, name: 'Operations', companyId: 3, employeeCount: 45 },
    { id: 7, name: 'Finance', companyId: 3, employeeCount: 15 },
  ],
  employees: [
    {
      id: 1,
      departmentId: 1,
      firstName: 'John',
      lastName: 'Doe',
      employeeNumber: 'EMP001',
      payrollType: 'salary',
      payRate: 75000,
      filingStatus: 'single',
      retirementRate: 0.05,
    },
    {
      id: 2,
      departmentId: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      employeeNumber: 'EMP002',
      payrollType: 'hourly',
      payRate: 35,
      filingStatus: 'married',
      retirementRate: 0.06,
    },
    {
      id: 3,
      departmentId: 2,
      firstName: 'Michael',
      lastName: 'Johnson',
      employeeNumber: 'EMP003',
      payrollType: 'salary',
      payRate: 65000,
      filingStatus: 'single',
      retirementRate: 0.04,
    },
    {
      id: 4,
      departmentId: 3,
      firstName: 'Sarah',
      lastName: 'Williams',
      employeeNumber: 'EMP004',
      payrollType: 'hourly',
      payRate: 28,
      filingStatus: 'married',
      retirementRate: 0.05,
    },
    {
      id: 5,
      departmentId: 4,
      firstName: 'Robert',
      lastName: 'Brown',
      employeeNumber: 'EMP005',
      payrollType: 'salary',
      payRate: 55000,
      filingStatus: 'single',
      retirementRate: 0.04,
    },
  ],
  selectedCompany: null,
  selectedDepartment: null,
  addCompany: (company) => {
    set((state) => ({
      companies: [
        ...state.companies,
        { ...company, id: state.companies.length + 1 },
      ],
    }));
  },
  selectCompany: (company) => {
    set({ selectedCompany: company });
  },
  addDepartment: (department) => {
    set((state) => ({
      departments: [
        ...state.departments,
        { ...department, id: state.departments.length + 1 },
      ],
    }));
  },
  selectDepartment: (department) => {
    set({ selectedDepartment: department });
  },
  getDepartments: (companyId) => {
    return get().departments.filter((dept) => dept.companyId === companyId);
  },
  addEmployee: (employee) => {
    set((state) => {
      const newEmployee = {
        ...employee,
        id: state.employees.length + 1,
      };
      
      // Update department employee count
      const updatedDepartments = state.departments.map((dept) =>
        dept.id === employee.departmentId
          ? { ...dept, employeeCount: dept.employeeCount + 1 }
          : dept
      );

      // Update company employee count
      const department = state.departments.find((d) => d.id === employee.departmentId);
      const updatedCompanies = state.companies.map((company) =>
        company.id === department?.companyId
          ? { ...company, employeeCount: company.employeeCount + 1 }
          : company
      );

      return {
        employees: [...state.employees, newEmployee],
        departments: updatedDepartments,
        companies: updatedCompanies,
      };
    });
  },
  getEmployees: (departmentId) => {
    return get().employees.filter((emp) => emp.departmentId === departmentId);
  },
}));