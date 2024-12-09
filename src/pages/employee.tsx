import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePayrollStore } from '@/lib/store/payroll-store';
import { SingleRecordForm } from '@/components/payroll/single-record-form';
import { RecordDetailsDialog } from '@/components/payroll/record-details-dialog';
import { BackButton } from '@/components/navigation/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { exportPayrollToCSV } from '@/lib/utils/export';
import { Pencil } from 'lucide-react';

export function EmployeePage() {
  const { company_id, id } = useParams();
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const selectCompanyById = useCompanyStore((state) => state.selectCompanyById);
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const employees = useCompanyStore((state) => state.employees);
  const departments = useCompanyStore((state) => state.departments);
  const payrollRecords = usePayrollStore((state) =>
    id ? state.getEmployeeRecords(Number(id)) : []
  );

  // Ensure company data is loaded before looking for employee
  useEffect(() => {
    if (company_id) {
      selectCompanyById(Number(company_id));
    }
  }, [company_id, selectCompanyById]);

  // If data isn't loaded yet (selectedCompany is null), show loading state
  if (!selectedCompany) {
    return <div>Loading...</div>;
  }

  const employee = employees.find((e) => e.id === Number(id));

  if (!employee) {
    return <div>Employee not found</div>;
  }

  const department = departments.find((d) => d.id === employee.departmentId);

  const selectedPayrollRecord = selectedRecord
    ? payrollRecords.find((r) => r.id === selectedRecord)
    : null;

  return (
    <div className="container mx-auto px-6 py-8">
      <BackButton />

      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: department?.name || 'Department', href: `/companies/${department?.companyId}` },
          { label: `${employee.firstName} ${employee.lastName}` },
        ]}
      />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Employee #{employee.employeeNumber}
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Employee
        </Button>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="payroll">Payroll History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-medium">Employee Information</h2>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1">{department?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payroll Type</dt>
                  <dd className="mt-1 capitalize">{employee.payrollType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pay Rate</dt>
                  <dd className="mt-1">
                    ${employee.payRate.toLocaleString()}
                    {employee.payrollType === 'hourly' ? '/hr' : '/yr'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Filing Status</dt>
                  <dd className="mt-1 capitalize">{employee.filingStatus}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Retirement Rate</dt>
                  <dd className="mt-1">{(employee.retirementRate * 100).toFixed(1)}%</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">Quick Actions</h2>
              </div>
              <div className="space-y-4">
                <Button
                  className="w-full justify-start"
                  onClick={() => setIsCreatingRecord(true)}
                >
                  Create Payroll Record
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => exportPayrollToCSV(payrollRecords, [employee])}
                >
                  Export Payroll History
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payroll">
          <div className="rounded-lg border bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Payroll History</h3>
                <Button onClick={() => setIsCreatingRecord(true)}>
                  Create Record
                </Button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Pay Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {payrollRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedRecord(record.id)}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {format(new Date(record.payPeriodStart), 'MMM d')} -{' '}
                        {format(new Date(record.payPeriodEnd), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {record.regularHours + record.overtimeHours}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ${record.grossPay.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ${record.netPay.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          record.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'processed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <SingleRecordForm
        open={isCreatingRecord}
        onClose={() => setIsCreatingRecord(false)}
        employeeId={employee.id}
      />

      {selectedPayrollRecord && employee && (
        <RecordDetailsDialog
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          record={selectedPayrollRecord}
          employee={employee}
        />
      )}
    </div>
  );
}
