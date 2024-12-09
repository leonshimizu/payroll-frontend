import { Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileMenu } from './profile-menu';
import { useCompanyStore } from '@/lib/store/company-store';

export function Header() {
  const location = useLocation();
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <Building2 className="h-6 w-6 text-slate-900" />
            <span>PayrollPro</span>
          </Link>
          <nav className="flex items-center gap-4">
            {selectedCompany && (
              <Link
                to={`/companies/${selectedCompany.id}`}
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
        <ProfileMenu />
      </div>
    </header>
  );
}