import React from 'react';
import { UploadedFile } from '../types';
import { FileIcon, CheckCircleIcon, XCircleIcon, TrashIcon, CopyIcon, SparklesIcon, LoaderIcon } from './Icons';

interface FileItemProps {
  item: UploadedFile;
  onRemove: (id: string) => void;
  onAnalyze: (id: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({ item, onRemove, onAnalyze }) => {
  const [copied, setCopied] = React.useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = async () => {
    if (item.publicUrl) {
      try {
        await navigator.clipboard.writeText(item.publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const isImage = item.file.type.startsWith('image/');

  return (
    <div className="group bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-300">
      <div className="flex gap-4">
        {/* Thumbnail or Icon */}
        <div className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center">
          {isImage ? (
            <img 
              src={item.previewUrl} 
              alt={item.file.name} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <FileIcon className="text-slate-500" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-medium text-slate-200 truncate pr-4" title={item.file.name}>
              {item.file.name}
            </h4>
            <button 
              onClick={() => onRemove(item.id)}
              className="text-slate-500 hover:text-red-400 transition-colors"
              title="Remove file"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center text-xs text-slate-400 gap-3 mb-2">
            <span>{formatSize(item.file.size)}</span>
            {item.status === 'completed' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Uploaded</span>}
            {item.status === 'error' && <span className="text-red-400 flex items-center gap-1"><XCircleIcon className="w-3 h-3" /> Failed</span>}
          </div>

          {/* Progress Bar */}
          {item.status === 'uploading' && (
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          )}

          {/* Actions Bar */}
          {item.status === 'completed' && (
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                {copied ? <CheckCircleIcon className="w-3 h-3 text-emerald-400" /> : <CopyIcon className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              {isImage && (
                <button
                  onClick={() => onAnalyze(item.id)}
                  disabled={item.isAnalyzing || !!item.geminiAnalysis}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${item.geminiAnalysis 
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }
                    disabled:opacity-70 disabled:cursor-not-allowed
                  `}
                >
                  {item.isAnalyzing ? (
                    <LoaderIcon className="w-3 h-3 animate-spin" />
                  ) : (
                    <SparklesIcon className="w-3 h-3" />
                  )}
                  {item.geminiAnalysis ? 'Analyzed' : 'Ask Gemini'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Gemini Analysis Result */}
      {item.geminiAnalysis && (
        <div className="mt-4 pt-3 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex items-start gap-2">
             <SparklesIcon className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
             <p className="text-sm text-slate-300 leading-relaxed">
               {item.geminiAnalysis}
             </p>
           </div>
        </div>
      )}

      {/* Error Message */}
      {item.error && (
         <div className="mt-2 text-xs text-red-400">
           Error: {item.error}
         </div>
      )}
    </div>
  );
};

export default FileItem;
