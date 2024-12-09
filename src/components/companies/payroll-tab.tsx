import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import { PayrollTabs } from '@/components/payroll/payroll-tabs';
import { PayrollRecordsLookup } from '@/components/payroll/records-lookup';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function PayrollTab() {
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);

  if (!selectedCompany) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Payroll Management</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create and manage payroll records
        </p>
      </div>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create Records</TabsTrigger>
          <TabsTrigger value="lookup">Records Lookup</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <PayrollTabs />
        </TabsContent>

        <TabsContent value="lookup">
          <PayrollRecordsLookup />
        </TabsContent>
      </Tabs>
    </div>
  );
}