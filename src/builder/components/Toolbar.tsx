import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../store/builderStore';

interface ToolbarProps {
  pageTitle?: string;
  onSave: () => void;
  isSaving: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ pageTitle, onSave, isSaving }) => {
  const isPreviewMode = useBuilderStore((state) => state.isPreviewMode);
  const setPreviewMode = useBuilderStore((state) => state.setPreviewMode);
  const resetTree = useBuilderStore((state) => state.resetTree);
  const temporal = useBuilderStore.temporal;
  const tree = useBuilderStore((state) => state.tree);

  const navigate = useNavigate();

  const handleUndo = () => {
    temporal.getState().undo();
  };

  const handleRedo = () => {
    temporal.getState().redo();
  };

  const handlePreviewToggle = () => {
    setPreviewMode(!isPreviewMode);
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

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the entire page? This cannot be undone.')) {
      resetTree();
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const pastStates = temporal.getState().pastStates;
  const futureStatesArr = temporal.getState().futureStates;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="h-6 w-px bg-gray-300" />

        {pageTitle && (
          <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
        )}
      </div>

      {/* Center Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={pastStates.length === 0}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-4-4M21 10l-4 4" />
          </svg>
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={handlePreviewToggle}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            isPreviewMode
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {isPreviewMode ? 'Exit Preview' : 'Preview'}
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        {/* Export JSON */}
        <button
          type="button"
          onClick={handleExportJSON}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Export as JSON"
        >
          Export JSON
        </button>

        {/* Clear */}
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Right Section - Save */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
