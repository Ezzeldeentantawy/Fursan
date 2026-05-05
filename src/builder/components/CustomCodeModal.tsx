import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { X, Code } from 'lucide-react';

interface CustomCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomCodeModal: React.FC<CustomCodeModalProps> = ({ isOpen, onClose }) => {
  const customCss = useBuilderStore((state) => state.customCss);
  const customJs = useBuilderStore((state) => state.customJs);
  const setCustomCss = useBuilderStore((state) => state.setCustomCss);
  const setCustomJs = useBuilderStore((state) => state.setCustomJs);
  
  const [localCss, setLocalCss] = useState(customCss || '');
  const [localJs, setLocalJs] = useState(customJs || '');
  
  // Sync from store when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalCss(customCss || '');
      setLocalJs(customJs || '');
    }
  }, [isOpen, customCss, customJs]);
  
  const handleSave = () => {
    setCustomCss(localCss || null);
    setCustomJs(localJs || null);
  };
  
  const handleClearAll = () => {
    setLocalCss('');
    setLocalJs('');
  };
  
  if (!isOpen) return null;
    
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-[75vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Code size={20} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Custom Code</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">CSS & JS</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
          
        {/* Body - Two Columns */}
        <div className="flex-1 flex gap-4 p-6 overflow-hidden min-h-0">
          {/* CSS Column */}
<div className="flex-1 flex flex-col gap-2 min-h-0">
             <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-400"></span>
               Custom CSS
             </label>
             <textarea
               value={localCss}
               onChange={(e) => setLocalCss(e.target.value)}
               placeholder=".my-class { color: red; }"
               className="flex-1 w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-auto leading-relaxed"
               spellCheck={false}
             />
          </div>
            
          {/* JS Column */}
<div className="flex-1 flex flex-col gap-2 min-h-0">
             <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
               Custom JS
             </label>
             <textarea
               value={localJs}
               onChange={(e) => setLocalJs(e.target.value)}
               placeholder="console.log('Hello');"
               className="flex-1 w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none overflow-auto leading-relaxed"
               spellCheck={false}
             />
          </div>
        </div>
          
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
          <p className="text-[10px] text-slate-500 flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Code is applied to the builder preview in real-time
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => { handleSave(); onClose(); }}
              className="px-6 py-2 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
