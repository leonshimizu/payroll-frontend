import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PayrollRecord } from '@/lib/store/payroll-store';
import { Employee } from '@/lib/store/company-store';
import { format } from 'date-fns';

interface RecordDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  record: PayrollRecord;
  employee: Employee;
}

export function RecordDetailsDialog({
  open,
  onClose,
  record,
  employee,
}: RecordDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payroll Record Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pay Period</h3>
              <p className="mt-1 text-sm">
                {format(new Date(record.payPeriodStart), 'MMM d')} -{' '}
                {format(new Date(record.payPeriodEnd), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">
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
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
              <h3 className="text-sm font-medium">Earnings</h3>
            </div>
            <div className="p-4">
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Regular Hours</dt>
                  <dd className="mt-1 text-sm">{record.regularHours}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Overtime Hours</dt>
                  <dd className="mt-1 text-sm">{record.overtimeHours}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tips</dt>
                  <dd className="mt-1 text-sm">${record.tips.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-lg border bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
              <h3 className="text-sm font-medium">Deductions</h3>
            </div>
            <div className="p-4">
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Federal Tax</dt>
                  <dd className="mt-1 text-sm">${record.deductions.tax.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Retirement</dt>
                  <dd className="mt-1 text-sm">
                    ${record.deductions.retirement.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Other</dt>
                  <dd className="mt-1 text-sm">${record.deductions.other.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-lg border bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
              <h3 className="text-sm font-medium">Totals</h3>
            </div>
            <div className="p-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gross Pay</dt>
                  <dd className="mt-1 text-lg font-semibold">
                    ${record.grossPay.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Net Pay</dt>
                  <dd className="mt-1 text-lg font-semibold">
                    ${record.netPay.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}