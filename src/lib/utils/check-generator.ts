import { jsPDF } from 'jspdf';
import { Employee } from '@/lib/store/company-store';
import { PayrollRecord } from '@/lib/store/payroll-store';
import { format } from 'date-fns';

interface CheckData {
  employee: Employee;
  record: PayrollRecord;
  companyName: string;
}

export function generateCheckPDF({ employee, record, companyName }: CheckData) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [8.5, 3.5], // Standard check size
  });

  // Company info
  doc.setFontSize(12);
  doc.text(companyName, 0.5, 0.5);
  doc.setFontSize(10);
  doc.text('Pay to the order of:', 0.5, 1.2);
  
  // Employee name and amount
  doc.setFontSize(12);
  doc.text(`${employee.firstName} ${employee.lastName}`, 0.5, 1.5);
  doc.text(
    `$${record.netPay.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    6.5,
    1.5
  );

  // Date
  doc.text(
    format(new Date(record.payPeriodEnd), 'MM/dd/yyyy'),
    6.5,
    0.5
  );

  // Amount in words
  doc.setFontSize(10);
  doc.text(numberToWords(record.netPay), 0.5, 1.8);

  // Memo line
  doc.text(
    `Pay Period: ${format(new Date(record.payPeriodStart), 'MM/dd/yyyy')} - ${format(
      new Date(record.payPeriodEnd),
      'MM/dd/yyyy'
    )}`,
    0.5,
    2.1
  );

  // Stub section with earnings detail
  doc.line(0.5, 2.4, 8, 2.4);
  doc.setFontSize(8);

  // Earnings table
  let y = 2.6;
  doc.text('Earnings', 0.5, y);
  doc.text('Hours', 2, y);
  doc.text('Rate', 3, y);
  doc.text('Amount', 4, y);
  y += 0.2;

  if (record.regularHours > 0) {
    doc.text('Regular', 0.5, y);
    doc.text(record.regularHours.toString(), 2, y);
    doc.text(`$${employee.payRate.toFixed(2)}`, 3, y);
    const regularPay = employee.payrollType === 'hourly'
      ? record.regularHours * employee.payRate
      : employee.payRate / 26;
    doc.text(`$${regularPay.toFixed(2)}`, 4, y);
    y += 0.15;
  }

  if (record.overtimeHours > 0) {
    doc.text('Overtime', 0.5, y);
    doc.text(record.overtimeHours.toString(), 2, y);
    doc.text(`$${(employee.payRate * 1.5).toFixed(2)}`, 3, y);
    const overtimePay = record.overtimeHours * (employee.payRate * 1.5);
    doc.text(`$${overtimePay.toFixed(2)}`, 4, y);
    y += 0.15;
  }

  if (record.tips > 0) {
    doc.text('Tips', 0.5, y);
    doc.text('', 2, y);
    doc.text('', 3, y);
    doc.text(`$${record.tips.toFixed(2)}`, 4, y);
    y += 0.15;
  }

  // Deductions
  y += 0.15;
  doc.text('Deductions', 5, 2.6);
  doc.text(`Federal Tax: $${record.deductions.tax.toFixed(2)}`, 5, 2.8);
  doc.text(
    `Retirement: $${record.deductions.retirement.toFixed(2)}`,
    5,
    2.95
  );

  // Totals
  doc.text(`Gross Pay: $${record.grossPay.toFixed(2)}`, 6.5, 2.8);
  doc.text(`Net Pay: $${record.netPay.toFixed(2)}`, 6.5, 2.95);

  return doc;
}

// Helper function to convert numbers to words for check amounts
function numberToWords(amount: number): string {
  const ones = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'
  ];
  const tens = [
    '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty',
    'ninety'
  ];

  const numToWord = (num: number): string => {
    if (num < 20) return ones[num];
    const digit1 = Math.floor(num / 10);
    const digit2 = num % 10;
    return tens[digit1] + (digit2 ? '-' + ones[digit2] : '');
  };

  let wholeDollars = Math.floor(amount);
  const cents = Math.round((amount - wholeDollars) * 100);
  let result = '';

  if (wholeDollars === 0) {
    result = 'zero';
  } else {
    if (wholeDollars >= 1000) {
      const thousands = Math.floor(wholeDollars / 1000);
      result += numToWord(thousands) + ' thousand ';
      wholeDollars = wholeDollars % 1000;
    }

    if (wholeDollars >= 100) {
      const hundreds = Math.floor(wholeDollars / 100);
      result += numToWord(hundreds) + ' hundred ';
      wholeDollars = wholeDollars % 100;
    }

    if (wholeDollars > 0) {
      if (result !== '') result += 'and ';
      result += numToWord(wholeDollars);
    }
  }

  result += ' dollars';
  if (cents > 0) {
    result += ' and ' + numToWord(cents) + ' cents';
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}