
import React, { useState } from 'react';
import { SettingsIcon, XCircleIcon } from './Icons';
import { ENV_CONFIG } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bucketName: string;
  setBucketName: (name: string) => void;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  bucketName,
  setBucketName,
  backendUrl,
  setBackendUrl
}) => {
  if (!isOpen) return null;

  const isEnvBucket = !!ENV_CONFIG.BUCKET_NAME;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
               <SettingsIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Backend Configuration */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">
              Backend Server URL
            </label>
            <input 
              type="text" 
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="http://localhost:3001"
            />
            <p className="text-xs text-slate-500">
              {backendUrl === '' 
                ? <span className="text-emerald-400">✓ Using relative path (Same Host) - Recommended for Production</span> 
                : 'Leave empty to use relative path (same host), or enter full URL for split-server dev.'
              }
            </p>
          </div>

          {/* Bucket Configuration */}
          <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">
                Bucket Name {isEnvBucket && <span className="text-slate-600 text-xs">(LOCKED BY ENV)</span>}
              </label>
              <input 
                type="text" 
                value={bucketName}
                disabled={isEnvBucket}
                onChange={(e) => setBucketName(e.target.value)}
                className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                  ${isEnvBucket ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                placeholder="my-bucket-name"
              />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
             <h4 className="text-blue-400 text-sm font-medium mb-1">Architecture Note</h4>
             <p className="text-xs text-blue-400/80 leading-relaxed">
               Authentication is handled by the backend. Ensure <code>GCP_SERVICE_ACCOUNT_KEY</code> is set in the server environment.
             </p>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
