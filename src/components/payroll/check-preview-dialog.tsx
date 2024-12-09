import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PayrollRecord } from '@/lib/store/payroll-store';
import { Employee } from '@/lib/store/company-store';
import { format } from 'date-fns';

interface CheckPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  record: PayrollRecord;
  employee: Employee;
  companyName: string;
  onPrint: () => void;
}

export function CheckPreviewDialog({
  open,
  onClose,
  record,
  employee,
  companyName,
  onPrint,
}: CheckPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Check Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Check Preview */}
          <div className="aspect-[2.43/1] w-full rounded-lg border bg-white p-6">
            <div className="flex h-full flex-col justify-between">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{companyName}</p>
                </div>
                <div>
                  <p className="text-sm">
                    {format(new Date(record.payPeriodEnd), 'MM/dd/yyyy')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Pay to the order of:</p>
                  <p className="text-lg font-medium">
                    {employee.firstName} {employee.lastName}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-lg font-medium">
                    ${record.netPay.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm italic">
                    Pay Period: {format(new Date(record.payPeriodStart), 'MM/dd/yyyy')} -{' '}
                    {format(new Date(record.payPeriodEnd), 'MM/dd/yyyy')}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Earnings</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Regular ({record.regularHours} hrs)</span>
                        <span>${(record.regularHours * employee.payRate).toFixed(2)}</span>
                      </div>
                      {record.overtimeHours > 0 && (
                        <div className="flex justify-between">
                          <span>Overtime ({record.overtimeHours} hrs)</span>
                          <span>
                            ${(record.overtimeHours * employee.payRate * 1.5).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {record.tips > 0 && (
                        <div className="flex justify-between">
                          <span>Tips</span>
                          <span>${record.tips.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">Deductions</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Federal Tax</span>
                        <span>${record.deductions.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retirement</span>
                        <span>${record.deductions.retirement.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onPrint}>Print Check</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}