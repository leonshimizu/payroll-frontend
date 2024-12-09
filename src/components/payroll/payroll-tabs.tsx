import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SingleRecordForm } from './single-record-form';
import { BulkEntryForm } from './bulk-entry-form';
import { ImportForm } from './import-form';

type TabType = 'single' | 'bulk' | 'import';

export function PayrollTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('single');
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  return (
    <div className="space-y-6">
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('single')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'single'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            Single Record
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'bulk'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            Bulk Entry
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === 'import'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            Import Data
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'single' && (
          <div className="text-center">
            <h3 className="text-lg font-medium">Create Single Payroll Record</h3>
            <p className="mt-1 text-sm text-slate-600">
              Add a payroll record for an individual employee
            </p>
            <div className="mt-4">
              <Button onClick={() => setIsCreatingRecord(true)}>
                Create Payroll Record
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'bulk' && <BulkEntryForm />}

        {activeTab === 'import' && <ImportForm />}
      </div>

      <SingleRecordForm
        open={isCreatingRecord}
        onClose={() => setIsCreatingRecord(false)}
      />
    </div>
  );
}