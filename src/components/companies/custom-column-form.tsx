import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  useCustomColumnsStore,
  CustomColumn,
  ColumnType,
} from '@/lib/store/custom-columns-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CustomColumnFormProps {
  open: boolean;
  columnId?: number;
  onClose: () => void;
}

interface CustomColumnFormData {
  name: string;
  type: ColumnType;
  isDeduction: boolean;
  includeInPayroll: boolean;
  notSubjectToWithholding: boolean;
}

export function CustomColumnForm({
  open,
  columnId,
  onClose,
}: CustomColumnFormProps) {
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const { columns, addColumn, updateColumn } = useCustomColumnsStore();
  
  const editingColumn = columnId
    ? columns.find((col) => col.id === columnId)
    : undefined;

  const { register, handleSubmit, reset } = useForm<CustomColumnFormData>({
    defaultValues: editingColumn
      ? {
          name: editingColumn.name,
          type: editingColumn.type,
          isDeduction: editingColumn.isDeduction,
          includeInPayroll: editingColumn.includeInPayroll,
          notSubjectToWithholding: editingColumn.notSubjectToWithholding,
        }
      : {
          type: 'number',
          isDeduction: false,
          includeInPayroll: true,
          notSubjectToWithholding: false,
        },
  });

  const onSubmit = (data: CustomColumnFormData) => {
    if (!selectedCompany) return;

    if (editingColumn) {
      updateColumn(editingColumn.id, data);
    } else {
      addColumn({
        ...data,
        companyId: selectedCompany.id,
      });
    }

    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingColumn ? 'Edit Custom Column' : 'Add Custom Column'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Column Name
            </label>
            <input
              {...register('name')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Bonus, Reimbursement"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Type
            </label>
            <select
              {...register('type')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="number">Number</option>
              <option value="percentage">Percentage</option>
              <option value="text">Text</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isDeduction')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Is this a deduction?
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('includeInPayroll')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Include in payroll calculations
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('notSubjectToWithholding')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Not subject to tax withholding
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingColumn ? 'Update Column' : 'Create Column'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}