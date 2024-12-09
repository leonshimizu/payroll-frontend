import { Building, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Company } from '@/lib/store/company-store';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <Building className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{company.name}</h3>
            <p className="text-sm text-slate-600">{company.location}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Users className="h-4 w-4" />
        <span>{company.employeeCount} employees</span>
      </div>
      <div className="mt-4 flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          asChild
        >
          <Link to={`/companies/${company.id}`}>View Details</Link>
        </Button>
        <Button
          size="sm"
          className="flex-1"
          asChild
        >
          <Link to={`/companies/${company.id}/payroll`}>Manage Payroll</Link>
        </Button>
      </div>
    </div>
  );
}