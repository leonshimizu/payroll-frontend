// src/pages/company.tsx

import { useParams, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { DepartmentsTab } from '@/components/companies/departments-tab';
import { PayrollTab } from '@/components/companies/payroll-tab';
import { CustomColumnsTab } from '@/components/companies/custom-columns-tab';
import { ReportsTab } from '@/components/companies/reports-tab';
import { ChecksTab } from '@/components/companies/checks-tab';

export function CompanyPage() {
  const { id } = useParams();
  const location = useLocation();
  const [companies, selectCompanyById, selectedCompany, departments, employees] =
    useCompanyStore((state) => [
      state.companies,
      state.selectCompanyById,
      state.selectedCompany,
      state.departments,
      state.employees,
    ]);

  useEffect(() => {
    if (id) {
      selectCompanyById(Number(id));
    }
  }, [id, selectCompanyById]);

  if (!selectedCompany) {
    return <div>Loading...</div>;
  }

  const tabs = [
    { name: 'Departments', path: '' },
    { name: 'Payroll', path: 'payroll' },
    { name: 'Custom Columns', path: 'columns' },
    { name: 'Reports', path: 'reports' },
    { name: 'Checks', path: 'checks' },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{selectedCompany.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {selectedCompany.location} • {employees.length} employees
        </p>
      </div>

      <div className="mb-8">
        <nav className="flex space-x-4 border-b">
          {tabs.map((tab) => {
            const isActive =
              location.pathname === `/companies/${id}${tab.path ? `/${tab.path}` : ''}`;
            return (
              <Link
                key={tab.name}
                to={`/companies/${id}${tab.path ? `/${tab.path}` : ''}`}
                className={`border-b-2 px-4 py-2 text-sm font-medium ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<DepartmentsTab />} />
        <Route path="/payroll" element={<PayrollTab />} />
        <Route path="/columns" element={<CustomColumnsTab />} />
        <Route path="/reports" element={<ReportsTab />} />
        <Route path="/checks" element={<ChecksTab />} />
      </Routes>
    </div>
  );
}
