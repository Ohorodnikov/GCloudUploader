export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  publicUrl?: string;
  error?: string;
  geminiAnalysis?: string;
  isAnalyzing?: boolean;
}

export interface BucketConfig {
  name: string;
  region: string;
}

export enum UploadStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}