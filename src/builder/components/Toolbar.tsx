import React from 'react';
import { ExternalLink, Code } from 'lucide-react';
import { useBuilderStore } from '../store/builderStore';

interface ToolbarProps {
  pageTitle?: string;
  siteDomain?: string;
  pageSlug?: string;
  isDefaultSite?: boolean;
  onSave: () => void;
  isSaving: boolean;
  onToggleNavigator?: () => void;
  showNavigator?: boolean;
  onToggleTemplates?: () => void;
  onToggleCustomCode?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ pageTitle, siteDomain, pageSlug, isDefaultSite = false, onSave, isSaving, onToggleNavigator, showNavigator, onToggleTemplates, onToggleCustomCode }) => {
  const temporal = useBuilderStore.temporal;
  const tree = useBuilderStore((state) => state.tree);

  const handleUndo = () => {
    temporal.getState().undo();
  };

  const handleRedo = () => {
    temporal.getState().redo();
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(tree, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${pageTitle || 'builder'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Construct preview URL
  const getPreviewUrl = () => {
    if (!pageSlug) return '#';
    
    const origin = window.location.origin; // http://localhost, http://360.era, etc.
    const base = import.meta.env.BASE_URL || '/'; // /react.fursan/
    const normalizedBase = base.endsWith('/') ? base : base + '/';
    const normalizedSlug = pageSlug?.startsWith('/') ? pageSlug.slice(1) : pageSlug;
    
    // If this is the default site, don't include siteDomain in URL
    if (isDefaultSite) {
      return `${origin}${normalizedBase}${normalizedSlug}`;
    } else {
      return `${origin}${normalizedBase}${siteDomain}/${normalizedSlug}`;
    }
  };

  const pastStates = temporal.getState().pastStates;
  const futureStatesArr = temporal.getState().futureStates;

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {pageTitle && (
          <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
        )}
      </div>

      {/* Center Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={pastStates.length === 0}
          className="p-2 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l4-4M3 10l4 4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleRedo}
          disabled={futureStatesArr.length === 0}
          className="p-2 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-4-4M21 10l-4 4" />
          </svg>
        </button>

        <div className="h-6 w-px bg-slate-700 mx-2" />

        {/* Export JSON */}
        <button
          type="button"
          onClick={handleExportJSON}
          className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
          title="Export as JSON"
        >
          Export JSON
        </button>

        <div className="h-6 w-px bg-slate-700 mx-2" />

        {/* Navigator Toggle */}
        {onToggleNavigator && (
          <button
            type="button"
            onClick={onToggleNavigator}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              showNavigator
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle Layers Panel"
          >
            ☰ Layers
          </button>
        )}

        {/* Templates Toggle */}
        {onToggleTemplates && (
          <button
            type="button"
            onClick={onToggleTemplates}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
            title="Browse Templates"
          >
            📋 Templates
          </button>
        )}

        <div className="h-6 w-px bg-slate-700 mx-2" />

        {/* Custom Code Toggle */}
        {onToggleCustomCode && (
          <button
            type="button"
            onClick={onToggleCustomCode}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2"
            title="Custom Code (CSS & JS)"
          >
            <Code size={14} />
            Custom Code
          </button>
        )}
      </div>

      {/* Right Section - Preview and Save */}
      <div className="flex items-center gap-2">
        {/* Preview button - links to page URL */}
        {pageSlug && (
          <a
            href={getPreviewUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <ExternalLink size={14} />
            Preview
          </a>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </>
          )}
        </button>
      </div>
    </div>
  );
};
