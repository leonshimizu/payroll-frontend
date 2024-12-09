import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import { DepartmentForm } from './department-form';
import { EmployeeList } from './employee-list';

export function DepartmentsTab() {
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState<number[]>([]);
  const [selectedCompany, departments] = useCompanyStore((state) => [
    state.selectedCompany,
    state.getDepartments(state.selectedCompany?.id || 0),
  ]);

  const toggleDepartment = (departmentId: number) => {
    setExpandedDepartments((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  if (!selectedCompany) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Departments</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage departments and their employees
          </p>
        </div>
        <Button onClick={() => setIsAddingDepartment(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="space-y-4">
        {departments.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 text-center">
            <p className="text-sm text-slate-600">
              No departments found. Add a department to get started.
            </p>
          </div>
        ) : (
          departments.map((department) => (
            <div key={department.id} className="rounded-lg border bg-white">
              <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => toggleDepartment(department.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedDepartments.includes(department.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                  <div>
                    <h3 className="font-medium">{department.name}</h3>
                    <p className="text-sm text-slate-600">
                      {department.employeeCount} employees
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
              {expandedDepartments.includes(department.id) && (
                <div className="border-t p-4">
                  <EmployeeList departmentId={department.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <DepartmentForm
        open={isAddingDepartment}
        onClose={() => setIsAddingDepartment(false)}
      />
    </div>
  );
}