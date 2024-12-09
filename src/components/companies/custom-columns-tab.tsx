import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import { useCustomColumnsStore } from '@/lib/store/custom-columns-store';
import { CustomColumnForm } from './custom-column-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function CustomColumnsTab() {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<number | null>(null);
  
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const { columns, deleteColumn } = useCustomColumnsStore((state) => ({
    columns: state.getCompanyColumns(selectedCompany?.id || 0),
    deleteColumn: state.deleteColumn,
  }));

  if (!selectedCompany) return null;

  const handleDelete = () => {
    if (deletingColumn) {
      deleteColumn(deletingColumn);
      setDeletingColumn(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Custom Columns</h2>
          <p className="mt-1 text-sm text-slate-600">
            Define custom payroll fields for bonuses, deductions, and more
          </p>
        </div>
        <Button onClick={() => setIsAddingColumn(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Column
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Column Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Data Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Properties
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {columns.length === 0 ? (
              <tr>
                <td className="px-6 py-4" colSpan={4}>
                  <p className="text-center text-sm text-slate-600">
                    No custom columns defined. Add a custom column to get started.
                  </p>
                </td>
              </tr>
            ) : (
              columns.map((column) => (
                <tr key={column.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {column.name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {column.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {column.isDeduction && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Deduction
                        </span>
                      )}
                      {column.includeInPayroll && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Include in Payroll
                        </span>
                      )}
                      {column.notSubjectToWithholding && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Not Subject to Withholding
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => setEditingColumn(column.id)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => setDeletingColumn(column.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomColumnForm
        open={isAddingColumn}
        onClose={() => setIsAddingColumn(false)}
      />

      {editingColumn && (
        <CustomColumnForm
          open={true}
          columnId={editingColumn}
          onClose={() => setEditingColumn(null)}
        />
      )}

      <Dialog open={!!deletingColumn} onOpenChange={() => setDeletingColumn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Column</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this custom column? This action cannot be
              undone, and historical payroll records may still contain this data.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeletingColumn(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Column
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}