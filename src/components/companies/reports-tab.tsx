import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePayrollStore } from '@/lib/store/payroll-store';
import { useReportsStore, ReportType } from '@/lib/store/reports-store';
import { format } from 'date-fns';
import { PayrollCharts } from '@/components/payroll/payroll-charts';
import { Search } from '@/components/ui/search';
import { exportReportToPDF } from '@/lib/utils/export';

export function ReportsTab() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [reportType, setReportType] = useState<ReportType>('ytd');
  const [searchTerm, setSearchTerm] = useState('');
  const [report, setReport] = useState<any>(null);

  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const departments = useCompanyStore((state) =>
    state.getDepartments(selectedCompany?.id || 0)
  );
  const employees = useCompanyStore((state) => state.employees);
  const payrollRecords = usePayrollStore((state) => state.records);
  const generateReport = useReportsStore((state) => state.generateReport);

  const filteredEmployees = employees.filter(
    (employee) =>
      !searchTerm ||
      `${employee.firstName} ${employee.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateReport = () => {
    const filters = {
      startDate,
      endDate,
      departmentId: departmentId ? Number(departmentId) : undefined,
      employeeId: employeeId ? Number(employeeId) : undefined,
      type: reportType,
    };

    const summary = generateReport(payrollRecords, employees, filters);
    setReport(summary);
  };

  const handleExportPDF = () => {
    if (report) {
      exportReportToPDF(
        report,
        { startDate, endDate },
        `payroll_report_${reportType}`
      );
    }
  };

  if (!selectedCompany) return null;

  return (
    <div className="space-y-8">
      <PayrollCharts />

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-6 text-lg font-medium">Generate Report</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ytd">Year-to-Date Summary</option>
              <option value="monthly">Monthly Totals</option>
              <option value="department">Department Summary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Search Employees
            </label>
            <Search
              placeholder="Search by name or ID..."
              onSearch={setSearchTerm}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Employees</option>
              {filteredEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-4">
              <div className="text-sm font-medium text-gray-500">
                Total Gross Pay
              </div>
              <div className="mt-1 text-2xl font-semibold">
                ${report.totalGrossPay.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="text-sm font-medium text-gray-500">
                Total Net Pay
              </div>
              <div className="mt-1 text-2xl font-semibold">
                ${report.totalNetPay.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="text-sm font-medium text-gray-500">Total Taxes</div>
              <div className="mt-1 text-2xl font-semibold">
                ${report.totalTaxes.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="text-sm font-medium text-gray-500">
                Total Deductions
              </div>
              <div className="mt-1 text-2xl font-semibold">
                ${report.totalDeductions.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Report Summary</h3>
              <Button variant="outline" onClick={handleExportPDF}>
                Export to PDF
              </Button>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Report Period
                </dt>
                <dd className="mt-1">
                  {format(new Date(startDate), 'MMM d, yyyy')} -{' '}
                  {format(new Date(endDate), 'MMM d, yyyy')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Employees Included
                </dt>
                <dd className="mt-1">{report.employeeCount}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Total Records
                </dt>
                <dd className="mt-1">{report.recordCount}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Average Pay</dt>
                <dd className="mt-1">
                  $
                  {(
                    report.totalGrossPay / report.employeeCount
                  ).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}