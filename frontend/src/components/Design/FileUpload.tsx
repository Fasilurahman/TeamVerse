import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label: string;
  preview?: string;
  onRemove?: () => void;
}

export function FileUpload({ 
  onFileSelect, 
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif']
  },
  maxSize = 5242880, // 5MB
  label,
  preview,
  onRemove
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  if (preview) {
    return (
      <div className="relative">
        <img 
          src={preview} 
          alt="Preview" 
          className="w-full h-48 object-cover rounded-xl"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-slate-900/90 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
      <p className="text-sm text-slate-400">
        {isDragActive
          ? "Drop the file here"
          : label}
      </p>
      <p className="text-xs text-slate-500 mt-1">
        Max size: 5MB
      </p>
    </div>
  );
}

interface DocumentUploadProps {
  onFilesSelect: (files: File[]) => void;
  files: File[];
  onRemove: (file: File) => void;
}

export function DocumentUpload({ onFilesSelect, files, onRemove }: DocumentUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelect(acceptedFiles);
  }, [onFilesSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10485760, // 10MB
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-colors duration-200 mb-4
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-500/10' 
            : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-400">
          {isDragActive
            ? "Drop the documents here"
            : "Drag & drop documents or click to select"}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supported formats: PDF, DOC, DOCX, TXT (Max size: 10MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Upload className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(file)}
                className="p-1 hover:bg-slate-700/50 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}