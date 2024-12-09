import { useEffect, useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyForm } from '@/components/companies/company-form';
import { CompanyCard } from '@/components/companies/company-card';

export function DashboardPage() {
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const companies = useCompanyStore((state) => state.companies);
  const loadCompanies = useCompanyStore((state) => state.loadCompanies);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your companies and their payroll
          </p>
        </div>
        <Button onClick={() => setIsAddingCompany(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>

      <CompanyForm
        open={isAddingCompany}
        onClose={() => setIsAddingCompany(false)}
      />
    </div>
  );
}
