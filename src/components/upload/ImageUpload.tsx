'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (base64: string, file: File) => void;
  currentImage: string | null;
  onClear: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

export default function ImageUpload({
  onImageSelect,
  currentImage,
  onClear,
  disabled = false,
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be under 10MB.');
        return;
      }

      if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
        setError('Only PNG, JPEG, and WebP files are accepted.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onImageSelect(base64, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled,
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError('File size must be under 10MB.');
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError('Only PNG, JPEG, and WebP files are accepted.');
      }
    },
  });

  // Clipboard paste handler
  useEffect(() => {
    if (disabled) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile, disabled]);

  if (currentImage) {
    return (
      <div className="relative rounded-lg border border-[#E8E8E8] overflow-hidden bg-[#F8F8FA]">
        <div className="relative aspect-video max-h-[300px] flex items-center justify-center p-4">
          <img
            src={currentImage}
            alt="Uploaded screenshot"
            className="max-h-full max-w-full object-contain rounded"
          />
        </div>
        <button
          onClick={onClear}
          className="absolute top-3 right-3 p-1.5 bg-white rounded-full border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
          aria-label="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="px-4 py-2.5 border-t border-[#E8E8E8] bg-white">
          <p className="text-xs text-[#9B9B9B]">
            Screenshot uploaded. Select a framework and generate code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-[#0066FF] bg-blue-50/50'
            : 'border-[#E8E8E8] hover:border-[#9B9B9B] bg-[#F8F8FA]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div
          className={`p-3 rounded-full transition-colors ${
            isDragActive ? 'bg-blue-100' : 'bg-white border border-[#E8E8E8]'
          }`}
        >
          {isDragActive ? (
            <ImageIcon className="w-6 h-6 text-[#0066FF]" />
          ) : (
            <Upload className="w-6 h-6 text-[#9B9B9B]" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#1A1A1A]">
            {isDragActive ? 'Drop your screenshot here' : 'Drop a screenshot, click to browse, or paste'}
          </p>
          <p className="text-xs text-[#9B9B9B] mt-1">
            PNG, JPEG, or WebP up to 10MB
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
