import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  departmentId: number;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  employeeNumber: string;
  payrollType: 'hourly' | 'salary';
  payRate: number;
  filingStatus: string;
  retirementRate: number;
}

export function EmployeeForm({ open, onClose, departmentId }: EmployeeFormProps) {
  const { register, handleSubmit, reset } = useForm<EmployeeFormData>();
  const addEmployee = useCompanyStore((state) => state.addEmployee);

  const onSubmit = (data: EmployeeFormData) => {
    addEmployee({
      ...data,
      departmentId,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                {...register('firstName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                {...register('lastName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee Number
            </label>
            <input
              {...register('employeeNumber')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., EMP001"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payroll Type
              </label>
              <select
                {...register('payrollType')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="hourly">Hourly</option>
                <option value="salary">Salary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pay Rate
              </label>
              <input
                type="number"
                step="0.01"
                {...register('payRate', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Filing Status
              </label>
              <select
                {...register('filingStatus')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="head">Head of Household</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Retirement Rate
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                {...register('retirementRate', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Employee</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}