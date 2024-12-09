import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePayrollStore } from '@/lib/store/payroll-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SingleRecordFormProps {
  open: boolean;
  onClose: () => void;
  employeeId?: number;
}

interface PayrollFormData {
  employeeId: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  regularHours: number;
  overtimeHours: number;
  tips: number;
}

export function SingleRecordForm({ open, onClose, employeeId }: SingleRecordFormProps) {
  const { register, handleSubmit, reset, watch } = useForm<PayrollFormData>({
    defaultValues: {
      employeeId: employeeId || 0,
    },
  });
  const addRecord = usePayrollStore((state) => state.addRecord);
  const employees = useCompanyStore((state) => state.employees);

  const selectedEmployee = employees.find(
    (emp) => emp.id === (employeeId || Number(watch('employeeId')))
  );

  const calculatePay = (data: PayrollFormData) => {
    if (!selectedEmployee) return { grossPay: 0, netPay: 0, deductions: { tax: 0, retirement: 0, other: 0 } };

    const regularPay = selectedEmployee.payrollType === 'hourly'
      ? data.regularHours * selectedEmployee.payRate
      : selectedEmployee.payRate / 26; // Bi-weekly salary
    const overtimePay = selectedEmployee.payrollType === 'hourly'
      ? data.overtimeHours * (selectedEmployee.payRate * 1.5)
      : 0;
    const totalPay = regularPay + overtimePay + data.tips;

    // Simple tax calculation (this should be more sophisticated in production)
    const taxRate = 0.2; // 20% tax rate
    const tax = totalPay * taxRate;
    const retirement = totalPay * selectedEmployee.retirementRate;

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

  const onSubmit = (data: PayrollFormData) => {
    const { grossPay, netPay, deductions } = calculatePay(data);

    addRecord({
      ...data,
      employeeId: employeeId || data.employeeId,
      grossPay,
      netPay,
      deductions,
      status: 'pending',
    });

    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Payroll Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!employeeId && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee
              </label>
              <select
                {...register('employeeId', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pay Period Start
              </label>
              <input
                type="date"
                {...register('payPeriodStart')}
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
                {...register('payPeriodEnd')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Regular Hours
              </label>
              <input
                type="number"
                step="0.01"
                {...register('regularHours', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Overtime Hours
              </label>
              <input
                type="number"
                step="0.01"
                {...register('overtimeHours', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tips
              </label>
              <input
                type="number"
                step="0.01"
                {...register('tips', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Record</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}