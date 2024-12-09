import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CompanyFormProps {
  open: boolean;
  onClose: () => void;
}

interface CompanyFormData {
  name: string;
  address: string;
  location: string;
}

export function CompanyForm({ open, onClose }: CompanyFormProps) {
  const { register, handleSubmit, reset } = useForm<CompanyFormData>();
  const addCompany = useCompanyStore((state) => state.addCompany);

  const onSubmit = (data: CompanyFormData) => {
    addCompany({
      ...data,
      employeeCount: 0,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              {...register('name')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              {...register('address')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              {...register('location')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="City, State"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Company</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}