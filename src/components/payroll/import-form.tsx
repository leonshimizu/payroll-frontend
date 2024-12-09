import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from './file-upload';
import { usePayrollStore } from '@/lib/store/payroll-store';
import { useCompanyStore } from '@/lib/store/company-store';
import api from '@/lib/api';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function ImportForm() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const addRecord = usePayrollStore((state) => state.addRecord);
  const employees = useCompanyStore((state) => state.employees);

  const handleUpload = async (file: File) => {
    if (!selectedCompany) return;
    setIsProcessing(true);
    const rawText = await file.text();
    const rows = rawText.split('\n').slice(1); // skip header
    const payload = [];

    for (const row of rows) {
      const [employeeNumber, payPeriodStart, payPeriodEnd, regularHours, overtimeHours, tips] = row.split(',');
      const emp = employees.find((emp) => emp.employeeNumber === (employeeNumber || '').trim());
      if (!emp) continue;
      payload.push({
        employee_id: emp.id,
        pay_period_start: payPeriodStart.trim(),
        pay_period_end: payPeriodEnd.trim(),
        regular_hours: parseFloat(regularHours),
        overtime_hours: parseFloat(overtimeHours),
        reported_tips: parseFloat(tips),
      });
    }

    try {
      const response = await api.post(`/companies/${selectedCompany.id}/payroll_records/bulk`, { records: payload });
      const newRecords = response.data;

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      newRecords.forEach((r: any) => {
        if (r.error) {
          failed++;
          errors.push(r.error);
        } else {
          success++;
          addRecord({
            id: r.id,
            employeeId: r.employee_id,
            payPeriodStart: r.pay_period_start,
            payPeriodEnd: r.pay_period_end,
            regularHours: parseFloat(r.regular_hours),
            overtimeHours: parseFloat(r.overtime_hours),
            tips: parseFloat(r.reported_tips),
            grossPay: parseFloat(r.gross_pay),
            netPay: parseFloat(r.net_pay),
            deductions: {
              tax: parseFloat(r.withholding_tax),
              retirement: parseFloat(r.retirement_payment) + parseFloat(r.roth_retirement_payment),
              other: parseFloat(r.total_deductions) - (parseFloat(r.withholding_tax) + parseFloat(r.retirement_payment) + parseFloat(r.roth_retirement_payment)),
            },
            status: r.status,
            createdAt: r.created_at,
          });
        }
      });

      setResult({ success, failed, errors });
    } catch (error: any) {
      setResult({ success: 0, failed: payload.length, errors: ['Failed to process file'] });
    } finally {
      setIsProcessing(false);
    }
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