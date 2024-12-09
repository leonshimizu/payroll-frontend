import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePayrollStore } from '@/lib/store/payroll-store';
import api from '@/lib/api';

export function BulkEntryForm() {
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [rows, setRows] = useState<Record<number, { employeeId: number; regularHours: string; overtimeHours: string; tips: string; }>>({});
  
  const employees = useCompanyStore((state) => state.employees);
  const addRecord = usePayrollStore((state) => state.addRecord);
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);

  const handleInputChange = (employeeId: number, field: string, value: string) => {
    setRows((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        employeeId,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCompany) return;
    if (!payPeriodStart || !payPeriodEnd) {
      alert('Please select pay period dates');
      return;
    }

    const payload = Object.values(rows).map(row => ({
      employee_id: row.employeeId,
      pay_period_start: payPeriodStart,
      pay_period_end: payPeriodEnd,
      regular_hours: parseFloat(row.regularHours || '0'),
      overtime_hours: parseFloat(row.overtimeHours || '0'),
      reported_tips: parseFloat(row.tips || '0')
    }));

    const response = await api.post(`/companies/${selectedCompany.id}/payroll_records/bulk`, { records: payload });
    const newRecords = response.data; // Array of computed records

    newRecords.forEach((newRecord: any) => {
      addRecord({
        id: newRecord.id,
        employeeId: newRecord.employee_id,
        payPeriodStart: newRecord.pay_period_start,
        payPeriodEnd: newRecord.pay_period_end,
        regularHours: parseFloat(newRecord.regular_hours),
        overtimeHours: parseFloat(newRecord.overtime_hours),
        tips: parseFloat(newRecord.reported_tips),
        grossPay: parseFloat(newRecord.gross_pay),
        netPay: parseFloat(newRecord.net_pay),
        deductions: {
          tax: parseFloat(newRecord.withholding_tax),
          retirement: parseFloat(newRecord.retirement_payment) + parseFloat(newRecord.roth_retirement_payment),
          other: parseFloat(newRecord.total_deductions) - (parseFloat(newRecord.withholding_tax) + parseFloat(newRecord.retirement_payment) + parseFloat(newRecord.roth_retirement_payment)),
        },
        status: newRecord.status,
        createdAt: newRecord.created_at,
      });
    });

    setRows({});
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pay Period Start
          </label>
          <input
            type="date"
            value={payPeriodStart}
            onChange={(e) => setPayPeriodStart(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pay Period End
          </label>
          <input
            type="date"
            value={payPeriodEnd}
            onChange={(e) => setPayPeriodEnd(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Regular Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Overtime Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tips
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee.employeeNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={rows[employee.id]?.regularHours || ''}
                      onChange={(e) =>
                        handleInputChange(
                          employee.id,
                          'regularHours',
                          e.target.value
                        )
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={rows[employee.id]?.overtimeHours || ''}
                      onChange={(e) =>
                        handleInputChange(
                          employee.id,
                          'overtimeHours',
                          e.target.value
                        )
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={rows[employee.id]?.tips || ''}
                      onChange={(e) =>
                        handleInputChange(employee.id, 'tips', e.target.value)
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit}>Generate Payroll Records</Button>
      </div>
    </div>
  );
}