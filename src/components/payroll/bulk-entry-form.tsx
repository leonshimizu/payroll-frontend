import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePayrollStore } from '@/lib/store/payroll-store';
import { format } from 'date-fns';

interface BulkEntryRow {
  employeeId: number;
  regularHours: string;
  overtimeHours: string;
  tips: string;
}

export function BulkEntryForm() {
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [rows, setRows] = useState<Record<number, BulkEntryRow>>({});
  
  const employees = useCompanyStore((state) => state.employees);
  const addRecord = usePayrollStore((state) => state.addRecord);

  const handleInputChange = (
    employeeId: number,
    field: keyof BulkEntryRow,
    value: string
  ) => {
    setRows((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        employeeId,
        [field]: value,
      },
    }));
  };

  const calculatePay = (
    employee: typeof employees[0],
    regularHours: number,
    overtimeHours: number,
    tips: number
  ) => {
    const regularPay =
      employee.payrollType === 'hourly'
        ? regularHours * employee.payRate
        : employee.payRate / 26;
    const overtimePay =
      employee.payrollType === 'hourly'
        ? overtimeHours * (employee.payRate * 1.5)
        : 0;
    const totalPay = regularPay + overtimePay + tips;

    const taxRate = 0.2;
    const tax = totalPay * taxRate;
    const retirement = totalPay * employee.retirementRate;

    return {
      grossPay: totalPay,
      netPay: totalPay - tax - retirement,
      deductions: {
        tax,
        retirement,
        other: 0,
      },
    };
  };

  const handleSubmit = () => {
    if (!payPeriodStart || !payPeriodEnd) {
      alert('Please select pay period dates');
      return;
    }

    Object.values(rows).forEach((row) => {
      const employee = employees.find((e) => e.id === row.employeeId);
      if (!employee) return;

      const regularHours = parseFloat(row.regularHours || '0');
      const overtimeHours = parseFloat(row.overtimeHours || '0');
      const tips = parseFloat(row.tips || '0');

      const { grossPay, netPay, deductions } = calculatePay(
        employee,
        regularHours,
        overtimeHours,
        tips
      );

      addRecord({
        employeeId: row.employeeId,
        payPeriodStart,
        payPeriodEnd,
        regularHours,
        overtimeHours,
        tips,
        grossPay,
        netPay,
        deductions,
        status: 'pending',
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