import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DepartmentFormProps {
  open: boolean;
  onClose: () => void;
}

interface DepartmentFormData {
  name: string;
}

export function DepartmentForm({ open, onClose }: DepartmentFormProps) {
  const { register, handleSubmit, reset } = useForm<DepartmentFormData>();
  const [addDepartment, selectedCompany] = useCompanyStore((state) => [
    state.addDepartment,
    state.selectedCompany,
  ]);

  const onSubmit = (data: DepartmentFormData) => {
    if (selectedCompany) {
      addDepartment({
        name: data.name,
        companyId: selectedCompany.id,
        employeeCount: 0,
      });
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department Name
            </label>
            <input
              {...register('name')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Engineering"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Department</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}