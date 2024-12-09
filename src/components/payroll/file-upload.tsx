import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string[];
}

export function FileUpload({ onUpload, accept = ['.csv'] }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': accept,
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mb-2 h-8 w-8 text-gray-400" />
      {isDragActive ? (
        <p className="text-sm text-gray-600">Drop the file here...</p>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Drag and drop a file here, or click to select
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: {accept.join(', ')}
          </p>
          <Button variant="outline" size="sm" className="mt-4">
            Select File
          </Button>
        </div>
      )}
    </div>
  );
}