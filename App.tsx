
import React, { useState, useCallback } from 'react';
import { UploadedFile } from './types';
import UploadZone from './components/UploadZone';
import FileItem from './components/FileItem';
import SettingsModal from './components/SettingsModal';
import { uploadFileToBackend } from './services/uploadService';
import { analyzeImage } from './services/geminiService';
import { UploadCloudIcon, SettingsIcon, CheckCircleIcon, KeyIcon } from './components/Icons';
import { DEFAULT_BUCKET_NAME, ENV_CONFIG } from './constants';

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Configuration State
  const [bucketName, setBucketName] = useState(ENV_CONFIG.BUCKET_NAME || DEFAULT_BUCKET_NAME);
  
  // Smart default for Backend URL:
  // 1. Env var takes precedence
  // 2. Split Dev Mode: If we are on localhost but NOT port 3001 (the server port), assume split dev environment (Frontend on 3000, Backend on 3001)
  // 3. Integrated Mode (Production or Localhost:3001): Use relative path ("") to avoid CORS and hardcoded domains.
  const getInitialBackendUrl = () => {
    if (ENV_CONFIG.BACKEND_URL) return ENV_CONFIG.BACKEND_URL;
    
    // Check if we are likely in a split development environment (e.g. Vite on 5173, Server on 3001)
    if (window.location.hostname === 'localhost' && window.location.port !== '3001') {
      return 'http://localhost:3001';
    }
    
    // Default to relative path for "One App" deployment
    return '';
  };

  const [backendUrl, setBackendUrl] = useState(getInitialBackendUrl());
  
  // Computed Auth State
  const isEnvBucket = !!ENV_CONFIG.BUCKET_NAME;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const newUploads: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...newUploads]);

    // Automatically start uploading
    newUploads.forEach((upload) => {
      startUpload(upload);
    });
  }, [bucketName, backendUrl]);

  const startUpload = async (upload: UploadedFile) => {
    updateFileStatus(upload.id, { status: 'uploading' });

    try {
      const publicUrl = await uploadFileToBackend(
        upload.file, 
        backendUrl,
        bucketName,
        (progress) => {
          updateFileStatus(upload.id, { progress });
        }
      );

      updateFileStatus(upload.id, {
        status: 'completed',
        progress: 100,
        publicUrl,
      });
    } catch (error) {
      updateFileStatus(upload.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  };

  const updateFileStatus = (id: string, updates: Partial<UploadedFile>) => {
    setFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleAnalyze = async (id: string) => {
    const fileItem = files.find((f) => f.id === id);
    if (!fileItem || fileItem.isAnalyzing) return;

    updateFileStatus(id, { isAnalyzing: true });

    try {
      const analysis = await analyzeImage(fileItem.file);
      updateFileStatus(id, {
        isAnalyzing: false,
        geminiAnalysis: analysis,
      });
    } catch (error) {
      updateFileStatus(id, {
        isAnalyzing: false,
        error: "Gemini analysis failed. Check console for details.",
      });
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 md:p-12 lg:p-16 max-w-4xl mx-auto relative">
      
      {/* Settings Toggle */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10 flex gap-3 items-center">
        {isEnvBucket && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-medium">
            <CheckCircleIcon className="w-3 h-3" />
            Env Configured
          </div>
        )}
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
          title="Configuration"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        bucketName={bucketName}
        setBucketName={setBucketName}
        backendUrl={backendUrl}
        setBackendUrl={setBackendUrl}
      />

      <header className="mb-10 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
             <UploadCloudIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            GCloud Uploader
          </h1>
        </div>
        <p className="text-slate-400 max-w-lg">
          Securely upload assets to <code className="text-indigo-400">{bucketName}</code> via backend.
        </p>
      </header>

      <main className="space-y-8">
        <section>
          <UploadZone onFilesSelected={handleFilesSelected} bucketName={bucketName} />
        </section>

        {files.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">
                Uploads ({files.length})
              </h2>
              <button 
                onClick={() => setFiles([])}
                className="text-sm text-slate-500 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>
            
            <div className="grid gap-4">
              {files.map((file) => (
                <FileItem
                  key={file.id}
                  item={file}
                  onRemove={handleRemove}
                  onAnalyze={handleAnalyze}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>
           Uploads are proxied through a secure backend server.
        </p>
      </footer>
    </div>
  );
}

export default App;
