import { unparse } from 'papaparse';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { PayrollRecord } from '../store/payroll-store';
import { Employee } from '../store/company-store';

export function exportToCSV(data: any[], filename: string) {
  const csv = unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPayrollToCSV(records: PayrollRecord[], employees: Employee[]) {
  const data = records.map(record => {
    const employee = employees.find(e => e.id === record.employeeId);
    return {
      'Employee Name': employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
      'Employee ID': employee?.employeeNumber || '',
      'Pay Period Start': format(new Date(record.payPeriodStart), 'MM/dd/yyyy'),
      'Pay Period End': format(new Date(record.payPeriodEnd), 'MM/dd/yyyy'),
      'Regular Hours': record.regularHours,
      'Overtime Hours': record.overtimeHours,
      'Tips': record.tips,
      'Gross Pay': record.grossPay,
      'Net Pay': record.netPay,
      'Tax Deductions': record.deductions.tax,
      'Retirement Deductions': record.deductions.retirement,
      'Other Deductions': record.deductions.other,
      'Status': record.status
    };
  });

  exportToCSV(data, 'payroll_records');
}

export function exportReportToPDF(
  reportData: any,
  filters: { startDate: string; endDate: string },
  filename: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.text('Payroll Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Date Range
  doc.setFontSize(12);
  doc.text(
    `Period: ${format(new Date(filters.startDate), 'MM/dd/yyyy')} - ${format(
      new Date(filters.endDate),
      'MM/dd/yyyy'
    )}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  yPos += 20;

  // Summary Section
  doc.setFontSize(14);
  doc.text('Summary', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  const summaryData = [
    ['Total Gross Pay:', `$${reportData.totalGrossPay.toLocaleString()}`],
    ['Total Net Pay:', `$${reportData.totalNetPay.toLocaleString()}`],
    ['Total Taxes:', `$${reportData.totalTaxes.toLocaleString()}`],
    ['Total Deductions:', `$${reportData.totalDeductions.toLocaleString()}`],
    ['Employee Count:', reportData.employeeCount.toString()],
    ['Record Count:', reportData.recordCount.toString()]
  ];

  summaryData.forEach(([label, value]) => {
    doc.text(label, 30, yPos);
    doc.text(value, 100, yPos);
    yPos += 8;
  });

  // Save the PDF
  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}