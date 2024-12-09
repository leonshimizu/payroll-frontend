import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';
import { usePayrollStore } from '@/lib/store/payroll-store';
import { useCompanyStore } from '@/lib/store/company-store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface PayrollChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export function PayrollCharts() {
  const [payrollTrends, setPayrollTrends] = useState<PayrollChartData | null>(null);
  const [departmentDistribution, setDepartmentDistribution] = useState<PayrollChartData | null>(null);
  const [earningsBreakdown, setEarningsBreakdown] = useState<PayrollChartData | null>(null);

  const records = usePayrollStore((state) => state.records);
  const [departments, employees] = useCompanyStore((state) => [
    state.departments,
    state.employees,
  ]);

  useEffect(() => {
    // Prepare payroll trends data (last 6 pay periods)
    const sortedRecords = [...records].sort(
      (a, b) => new Date(b.payPeriodEnd).getTime() - new Date(a.payPeriodEnd).getTime()
    );
    const last6Periods = sortedRecords.slice(0, 6).reverse();

    setPayrollTrends({
      labels: last6Periods.map((record) =>
        format(new Date(record.payPeriodEnd), 'MMM d')
      ),
      datasets: [
        {
          label: 'Gross Pay',
          data: last6Periods.map((record) => record.grossPay),
          backgroundColor: ['rgba(59, 130, 246, 0.5)'],
          borderColor: ['rgba(59, 130, 246, 1)'],
          borderWidth: 1,
        },
        {
          label: 'Net Pay',
          data: last6Periods.map((record) => record.netPay),
          backgroundColor: ['rgba(16, 185, 129, 0.5)'],
          borderColor: ['rgba(16, 185, 129, 1)'],
          borderWidth: 1,
        },
      ],
    });

    // Prepare department distribution data
    const departmentTotals = departments.map((dept) => {
      const deptEmployees = employees.filter((emp) => emp.departmentId === dept.id);
      const totalPay = records.reduce((sum, record) => {
        if (deptEmployees.some((emp) => emp.id === record.employeeId)) {
          return sum + record.grossPay;
        }
        return sum;
      }, 0);
      return { name: dept.name, total: totalPay };
    });

    setDepartmentDistribution({
      labels: departmentTotals.map((dept) => dept.name),
      datasets: [
        {
          label: 'Department Distribution',
          data: departmentTotals.map((dept) => dept.total),
          backgroundColor: [
            'rgba(59, 130, 246, 0.5)',
            'rgba(16, 185, 129, 0.5)',
            'rgba(245, 158, 11, 0.5)',
            'rgba(239, 68, 68, 0.5)',
            'rgba(139, 92, 246, 0.5)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(139, 92, 246, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });

    // Prepare earnings vs deductions breakdown
    const totalGrossPay = records.reduce((sum, record) => sum + record.grossPay, 0);
    const totalDeductions = records.reduce(
      (sum, record) =>
        sum +
        record.deductions.tax +
        record.deductions.retirement +
        record.deductions.other,
      0
    );
    const totalNetPay = records.reduce((sum, record) => sum + record.netPay, 0);

    setEarningsBreakdown({
      labels: ['Net Pay', 'Taxes', 'Retirement', 'Other Deductions'],
      datasets: [
        {
          label: 'Earnings Breakdown',
          data: [
            totalNetPay,
            records.reduce((sum, record) => sum + record.deductions.tax, 0),
            records.reduce((sum, record) => sum + record.deductions.retirement, 0),
            records.reduce((sum, record) => sum + record.deductions.other, 0),
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.5)',
            'rgba(239, 68, 68, 0.5)',
            'rgba(245, 158, 11, 0.5)',
            'rgba(139, 92, 246, 0.5)',
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(139, 92, 246, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
  }, [records, departments, employees]);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-medium">Payroll Trends</h3>
        {payrollTrends && (
          <Bar
            data={payrollTrends}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                },
              },
            }}
          />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-medium">Department Distribution</h3>
          {departmentDistribution && (
            <Doughnut
              data={departmentDistribution}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          )}
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-medium">Earnings Breakdown</h3>
          {earningsBreakdown && (
            <Doughnut
              data={earningsBreakdown}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}