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
import api from '@/lib/api';

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
  const { register, handleSubmit, reset } = useForm<PayrollFormData>({
    defaultValues: {
      employeeId: employeeId || 0,
    },
  });
  
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const employees = useCompanyStore((state) => state.employees);
  const addRecord = usePayrollStore((state) => state.addRecord);

  const onSubmit = async (data: PayrollFormData) => {
    if (!selectedCompany) return;

    const response = await api.post(`/companies/${selectedCompany.id}/payroll_records`, {
      employee_id: employeeId || data.employeeId,
      pay_period_start: data.payPeriodStart,
      pay_period_end: data.payPeriodEnd,
      regular_hours: data.regularHours,
      overtime_hours: data.overtimeHours,
      reported_tips: data.tips
    });

    const newRecord = response.data;
    // Use the correct fields from the API response:
    addRecord({
      id: newRecord.id,
      employeeId: newRecord.employee_id,
      payPeriodStart: newRecord.pay_period_start,
      payPeriodEnd: newRecord.pay_period_end,
      regularHours: parseFloat(newRecord.hours_worked),           // <-- Updated field name
      overtimeHours: parseFloat(newRecord.overtime_hours_worked), // <-- Updated field name
      tips: parseFloat(newRecord.reported_tips),
      grossPay: parseFloat(newRecord.gross_pay),
      netPay: parseFloat(newRecord.net_pay),
      deductions: {
        tax: parseFloat(newRecord.withholding_tax),
        retirement: parseFloat(newRecord.retirement_payment) + parseFloat(newRecord.roth_retirement_payment),
        other: parseFloat(newRecord.total_deductions) -
          (parseFloat(newRecord.withholding_tax) +
          parseFloat(newRecord.retirement_payment) +
          parseFloat(newRecord.roth_retirement_payment)),
      },
      status: newRecord.status,
      createdAt: newRecord.created_at,
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                required
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeNumber})
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
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
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
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
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
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
                className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
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
