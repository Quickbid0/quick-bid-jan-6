import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

/**
 * FIX 15: Image Upload Validation (F-02, V-08, V-09)
 * Validates file type and size before upload
 */

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  onError?: (error: string) => void;
}

export const ImageUploadHandler: React.FC<ImageUploadProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMb = 10,
  onError,
}) => {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE_BYTES = maxSizeMb * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          valid: false,
          error: `Invalid file type: ${file.name}. Only JPG, PNG, WebP, GIF allowed.`,
        };
      }

      // Check file size
      if (file.size > MAX_SIZE_BYTES) {
        return {
          valid: false,
          error: `${file.name} exceeds ${maxSizeMb}MB limit.`,
        };
      }

      return { valid: true };
    },
    [ALLOWED_TYPES, MAX_SIZE_BYTES, maxSizeMb]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      // Check file count
      if (files.length > maxFiles) {
        onError?.(
          `Too many files. Maximum ${maxFiles} files allowed.`
        );
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
          onError?.(validation.error);
          return;
        }
        validFiles.push(file);
      }

      onFilesSelected(validFiles);
    },
    [maxFiles, validateFile, onError]
  );

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-600 transition-colors">
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 mb-2">Drag and drop images here or click to select</p>
      <p className="text-sm text-gray-500 mb-4">
        Supported: JPG, PNG, WebP, GIF (Max {maxSizeMb}MB each, Max {maxFiles} files)
      </p>
      <label className="block">
        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            input?.click();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Select Files
        </button>
      </label>
    </div>
  );
};

// Image preview component
interface ImagePreviewProps {
  file: File;
  onRemove: (file: File) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove }) => {
  const [preview, setPreview] = React.useState<string>('');

  React.useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [file]);

  return (
    <div className="relative inline-block">
      <img
        src={preview}
        alt={file.name}
        className="w-24 h-24 object-cover rounded-lg"
      />
      <button
        type="button"
        onClick={() => onRemove(file)}
        className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 transform translate-x-2 -translate-y-2 hover:bg-red-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
