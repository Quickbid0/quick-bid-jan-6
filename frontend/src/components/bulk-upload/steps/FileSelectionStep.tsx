// src/components/bulk-upload/steps/FileSelectionStep.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Download, CheckCircle, AlertTriangle } from 'lucide-react';

interface FileSelectionStepProps {
  files: File[];
  onFilesSelected: (files: File[]) => void;
  maxFiles: number;
  maxFileSize: number;
  supportedFormats: string[];
}

const FileSelectionStep: React.FC<FileSelectionStepProps> = ({
  files,
  onFilesSelected,
  maxFiles,
  maxFileSize,
  supportedFormats,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidSize = file.size <= maxFileSize * 1024 * 1024;
      const isValidFormat = supportedFormats.some(format =>
        file.name.toLowerCase().endsWith(format)
      );

      return isValidSize && isValidFormat;
    });

    const newFiles = [...files, ...validFiles].slice(0, maxFiles);
    onFilesSelected(newFiles);
  }, [files, maxFiles, maxFileSize, supportedFormats, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive: dropzoneDragActive } = useDropzone({
    onDrop,
    accept: supportedFormats.reduce((acc, format) => {
      acc[format] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize * 1024 * 1024,
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesSelected(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadTemplate = () => {
    // In a real app, this would download a CSV template
    const csvContent = `make,model,year,price,mileage,fuel_type,transmission,location,description
Honda,City,2020,850000,45000,petrol,manual,Delhi,Well maintained sedan with single owner
Royal Enfield,Classic 350,2022,185000,1500,petrol,manual,Mumbai,Brand new condition showroom fresh`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicle_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Vehicle Data
        </h3>
        <p className="text-gray-600">
          Select CSV or Excel files containing your vehicle inventory
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive || dropzoneDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
            isDragActive || dropzoneDragActive ? 'bg-blue-200' : 'bg-gray-100'
          }`}>
            <File className={`h-6 w-6 ${
              isDragActive || dropzoneDragActive ? 'text-blue-600' : 'text-gray-400'
            }`} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragActive || dropzoneDragActive ? 'Drop files here' : 'Choose files or drag them here'}
            </p>
            <p className="text-sm text-gray-500">
              Supports {supportedFormats.join(', ')} files up to {maxFileSize}MB each
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* File Requirements */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">File Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>CSV or Excel format (.csv, .xlsx, .xls)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Up to {maxFiles} files</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Maximum {maxFileSize}MB per file</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Required columns: make, model, year, price</span>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Selected Files ({files.length}/{maxFiles})
            </h4>
            <button
              onClick={() => onFilesSelected([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {files.map((file, index) => {
              const isOversized = file.size > maxFileSize * 1024 * 1024;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    isOversized ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isOversized ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <File className={`h-5 w-5 ${
                        isOversized ? 'text-red-600' : 'text-gray-600'
                      }`} />
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isOversized ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Too large</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Ready</span>
                      </div>
                    )}

                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Need a template?</h4>
            <p className="text-sm text-blue-700">
              Download our CSV template to ensure correct formatting and avoid common errors.
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="ml-4 inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileSelectionStep;
