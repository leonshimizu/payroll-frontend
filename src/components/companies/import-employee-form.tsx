import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/payroll/file-upload';
import { useCompanyStore } from '@/lib/store/company-store';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface ImportEmployeeFormProps {
  departmentId: number;
  onClose: () => void;
}

export function ImportEmployeeForm({ departmentId, onClose }: ImportEmployeeFormProps) {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const addEmployee = useCompanyStore((state) => state.addEmployee);

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      const text = await file.text();
      const rows = text.split('\n').slice(1); // Skip header row

      for (const row of rows) {
        try {
          const [
            firstName,
            lastName,
            employeeNumber,
            payrollType,
            payRate,
            filingStatus,
            retirementRate,
          ] = row.split(',').map((field) => field.trim());

          if (!firstName || !lastName || !employeeNumber) {
            result.failed++;
            result.errors.push(`Missing required fields: ${row}`);
            continue;
          }

          addEmployee({
            departmentId,
            firstName,
            lastName,
            employeeNumber,
            payrollType: payrollType === 'salary' ? 'salary' : 'hourly',
            payRate: Number(payRate),
            filingStatus,
            retirementRate: Number(retirementRate),
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
      'First Name,Last Name,Employee Number,Payroll Type,Pay Rate,Filing Status,Retirement Rate\n' +
      'John,Doe,EMP001,hourly,25.00,single,0.05\n';

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Import Employees</h3>
        <p className="mt-1 text-sm text-gray-600">
          Upload a CSV file containing employee information
        </p>
      </div>

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

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}