import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePayrollStore } from '@/lib/store/payroll-store';
import { generateCheckPDF } from '@/lib/utils/check-generator';
import { CheckPreviewDialog } from '@/components/payroll/check-preview-dialog';

interface PreviewRecord {
  record: ReturnType<typeof usePayrollStore>['records'][0];
  employee: ReturnType<typeof useCompanyStore>['employees'][0];
}

export function ChecksTab() {
  const [previewRecord, setPreviewRecord] = useState<PreviewRecord | null>(null);
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const [records, employees] = [
    usePayrollStore((state) => state.records),
    useCompanyStore((state) => state.employees),
  ];

  const handlePrintCheck = (recordId: number) => {
    const record = records.find((r) => r.id === recordId);
    const employee = employees.find((e) => e.id === record?.employeeId);

    if (record && employee && selectedCompany) {
      const doc = generateCheckPDF({
        employee,
        record,
        companyName: selectedCompany.name,
      });
      doc.save(`check-${employee.lastName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    }
  };

  if (!selectedCompany) return null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Check Management</h2>
        <p className="mt-1 text-sm text-slate-600">
          View and print employee checks
        </p>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Pay Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Net Pay
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {records.map((record) => {
              const employee = employees.find((e) => e.id === record.employeeId);
              return (
                <tr key={record.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee?.employeeNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {format(new Date(record.payPeriodStart), 'MMM d')} -{' '}
                    {format(new Date(record.payPeriodEnd), 'MMM d, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
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
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        if (employee) {
                          setPreviewRecord({ record, employee });
                        }
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintCheck(record.id)}
                    >
                      Print Check
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewRecord && (
        <CheckPreviewDialog
          open={true}
          onClose={() => setPreviewRecord(null)}
          record={previewRecord.record}
          employee={previewRecord.employee}
          companyName={selectedCompany.name}
          onPrint={() => {
            handlePrintCheck(previewRecord.record.id);
            setPreviewRecord(null);
          }}
        />
      )}
    </div>
  );
}