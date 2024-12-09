import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Search } from '@/components/ui/search';
import { usePayrollStore } from '@/lib/store/payroll-store';
import { useCompanyStore } from '@/lib/store/company-store';
import { DataTable } from '@/components/ui/data-table';
import { exportPayrollToCSV } from '@/lib/utils/export';
import { type ColumnDef } from '@tanstack/react-table';
import { PayrollRecord } from '@/lib/store/payroll-store';
import { RecordDetailsDialog } from './record-details-dialog';

export function PayrollRecordsLookup() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  const records = usePayrollStore((state) => state.records);
  const employees = useCompanyStore((state) => state.employees);

  const filteredRecords = records.filter((record) => {
    const matchesDate =
      (!startDate || record.payPeriodStart >= startDate) &&
      (!endDate || record.payPeriodEnd <= endDate);

    const employee = employees.find((e) => e.id === record.employeeId);
    const employeeName = employee
      ? `${employee.firstName} ${employee.lastName}`.toLowerCase()
      : '';
    const employeeNumber = employee?.employeeNumber.toLowerCase() || '';
    const matchesSearch =
      !searchTerm ||
      employeeName.includes(searchTerm.toLowerCase()) ||
      employeeNumber.includes(searchTerm.toLowerCase());

    return matchesDate && matchesSearch;
  });

  const columns: ColumnDef<PayrollRecord>[] = [
    {
      header: 'Employee',
      accessorFn: (record) => {
        const employee = employees.find((e) => e.id === record.employeeId);
        return employee
          ? `${employee.firstName} ${employee.lastName}`
          : 'Unknown Employee';
      },
    },
    {
      header: 'Pay Period',
      accessorFn: (record) =>
        `${format(new Date(record.payPeriodStart), 'MMM d')} - ${format(
          new Date(record.payPeriodEnd),
          'MMM d, yyyy'
        )}`,
    },
    {
      header: 'Hours',
      accessorFn: (record) => record.regularHours + record.overtimeHours,
    },
    {
      header: 'Gross Pay',
      accessorFn: (record) => `$${record.grossPay.toLocaleString()}`,
    },
    {
      header: 'Net Pay',
      accessorFn: (record) => `$${record.netPay.toLocaleString()}`,
    },
    {
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            row.original.status === 'paid'
              ? 'bg-green-100 text-green-800'
              : row.original.status === 'processed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
  ];

  const handleExport = () => {
    exportPayrollToCSV(filteredRecords, employees);
  };

  const selectedEmployee = selectedRecord
    ? employees.find((e) => e.id === selectedRecord.employeeId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <Search
            placeholder="Search by employee name or ID..."
            onSearch={setSearchTerm}
          />
        </div>
        <Button variant="outline" onClick={handleExport}>
          Export Results
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredRecords}
        onRowClick={(record) => setSelectedRecord(record)}
      />

      {selectedRecord && selectedEmployee && (
        <RecordDetailsDialog
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          record={selectedRecord}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
}