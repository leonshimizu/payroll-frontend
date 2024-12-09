import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from './file-upload';
import { usePayrollStore } from '@/lib/store/payroll-store';
import { useCompanyStore } from '@/lib/store/company-store';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function ImportForm() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const addRecord = usePayrollStore((state) => state.addRecord);
  const employees = useCompanyStore((state) => state.employees);

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      const text = await file.text();
      const rows = text.split('\n').slice(1); // Skip header row

      for (const row of rows) {
        try {
          const [
            employeeNumber,
            payPeriodStart,
            payPeriodEnd,
            regularHours,
            overtimeHours,
            tips,
          ] = row.split(',');

          const employee = employees.find(
            (emp) => emp.employeeNumber === employeeNumber.trim()
          );

          if (!employee) {
            result.failed++;
            result.errors.push(`Employee not found: ${employeeNumber}`);
            continue;
          }

          // Calculate pay based on employee type and hours
          const regularPay =
            employee.payrollType === 'hourly'
              ? Number(regularHours) * employee.payRate
              : employee.payRate / 26;
          const overtimePay =
            employee.payrollType === 'hourly'
              ? Number(overtimeHours) * (employee.payRate * 1.5)
              : 0;
          const totalPay = regularPay + overtimePay + Number(tips);

          // Simple tax calculation (this should be more sophisticated in production)
          const taxRate = 0.2;
          const tax = totalPay * taxRate;
          const retirement = totalPay * employee.retirementRate;

          addRecord({
            employeeId: employee.id,
            payPeriodStart: payPeriodStart.trim(),
            payPeriodEnd: payPeriodEnd.trim(),
            regularHours: Number(regularHours),
            overtimeHours: Number(overtimeHours),
            tips: Number(tips),
            grossPay: totalPay,
            netPay: totalPay - tax - retirement,
            deductions: {
              tax,
              retirement,
              other: 0,
            },
            status: 'pending',
          });

          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Invalid row format: ${row}`);
        }
      }
    } catch (error) {
      result.failed++;
      result.errors.push('Failed to read file');
    }

    setResult(result);
    setIsProcessing(false);
  };

  const downloadTemplate = () => {
    const template =
      'Employee Number,Pay Period Start,Pay Period End,Regular Hours,Overtime Hours,Tips\n' +
      'EMP001,2024-03-01,2024-03-15,80,5,100\n';

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <FileUpload onUpload={handleUpload} />

      {isProcessing && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          Processing your file...
        </div>
      )}

      {result && (
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-medium">Import Results</h3>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Successfully Imported
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-green-600">
                {result.success}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Failed</dt>
              <dd className="mt-1 text-2xl font-semibold text-red-600">
                {result.failed}
              </dd>
            </div>
          </dl>
          {result.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Errors</h4>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-600">
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border bg-white p-6">
        <h3 className="text-lg font-medium">Template</h3>
        <p className="mt-2 text-sm text-gray-600">
          Download our CSV template to ensure your data is formatted correctly.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={downloadTemplate}
        >
          Download Template
        </Button>
      </div>
    </div>
  );
}