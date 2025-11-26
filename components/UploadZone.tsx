import React, { useRef, useState } from 'react';
import { UploadCloudIcon } from './Icons';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  bucketName: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected, bucketName }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        flex flex-col items-center justify-center 
        w-full h-64 rounded-2xl border-2 border-dashed 
        transition-all duration-300 ease-in-out
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50 bg-slate-800/20'
        }
      `}
    >
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileInput}
      />
      
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div className={`
          p-4 rounded-full bg-slate-800 transition-transform duration-300
          ${isDragging ? 'scale-110 text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}
        `}>
          <UploadCloudIcon className="w-10 h-10" />
        </div>
        
        <div className="space-y-1">
          <p className="text-lg font-medium text-slate-200">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-slate-400">
            Uploading to bucket: <span className="text-indigo-400 font-mono bg-indigo-400/10 px-1 rounded">{bucketName}</span>
          </p>
          <p className="text-xs text-slate-500">
            SVG, PNG, JPG or GIF (max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;