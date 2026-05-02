import React, { useState } from 'react';
import { breakpoints, Breakpoint, BreakpointConfig, ELEMENTS_BY_TYPE } from '../DynamicPages';

interface ResponsivePanelProps {
  responsive?: Record<string, Record<string, string>>;
  onChange: (responsive: Record<string, Record<string, string>>) => void;
  elementType?: string;
}

export const ResponsivePanel: React.FC<ResponsivePanelProps> = ({ responsive = {}, onChange, elementType = '' }) => {
  // Set default active breakpoint to 'md' (Desktop) - the first breakpoint in the array
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('md');

  // Get the element definition to access its controls
  const elementDef = elementType ? ELEMENTS_BY_TYPE[elementType] : null;

  // Get responsive-only fields from the element definition
  const responsiveFields = elementDef?.controls?.filter((control: any) => control.responsiveOnly) || [];

  // Get the styles for the active breakpoint
  const activeBreakpointStyles = responsive[activeBreakpoint] || {};

  // Check if a breakpoint has any styles defined
  const hasStyles = (bpKey: Breakpoint): boolean => {
    return responsive[bpKey] && Object.keys(responsive[bpKey]).length > 0;
  };

  // Handle property change
  const handlePropChange = (propKey: string, value: string) => {
    const updated = { ...responsive };
    
    if (!updated[activeBreakpoint]) {
      updated[activeBreakpoint] = {};
    }

    if (!value) {
      // Remove the property if value is empty
      const { [propKey]: removed, ...rest } = updated[activeBreakpoint];
      if (Object.keys(rest).length === 0) {
        delete updated[activeBreakpoint];
      } else {
        updated[activeBreakpoint] = rest;
      }
    } else {
      updated[activeBreakpoint] = { ...updated[activeBreakpoint], [propKey]: value };
    }

    onChange(updated);
  };

  // Reset all styles for the active breakpoint
  const handleResetBreakpoint = () => {
    const updated = { ...responsive };
    delete updated[activeBreakpoint];
    onChange(updated);
  };

  // Get icon for breakpoint
  const getIcon = (bp: BreakpointConfig) => {
    const Icon = bp.icon;
    return <Icon size={14} />;
  };

  return (
    <div className="border-t border-gray-200 pt-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-600">Responsive Styles</div>
        {hasStyles(activeBreakpoint) && (
          <button
            onClick={handleResetBreakpoint}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
            title="Reset all styles for this breakpoint"
          >
            Reset BP
          </button>
        )}
      </div>

      {/* Breakpoint Tabs - dynamically generated from breakpoints array */}
      <div className="flex gap-1 mb-3">
        {breakpoints.map((bp) => {
          const hasStylesForBp = hasStyles(bp.key);
          return (
            <button
              key={bp.key}
              onClick={() => setActiveBreakpoint(bp.key)}
              className={`flex-1 flex flex-col items-center py-2 px-1 text-xs rounded-md transition-all relative ${
                activeBreakpoint === bp.key
                  ? 'bg-blue-500 text-white font-medium shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={`${bp.label} (${bp.width})`}
            >
              {getIcon(bp)}
              <span className="text-[9px] mt-0.5 font-semibold">{bp.label}</span>
              {hasStylesForBp && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Breakpoint Info */}
      <div className="mb-3 px-2 py-1.5 bg-gray-50 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Editing: {breakpoints.find(bp => bp.key === activeBreakpoint)?.label}
          </span>
          <span className="text-[10px] text-gray-400">
            {breakpoints.find(bp => bp.key === activeBreakpoint)?.width}
          </span>
        </div>
      </div>

      {/* Responsive Properties - only show fields marked with responsiveOnly */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {responsiveFields.length > 0 ? (
          responsiveFields.map((field: any) => {
            const value = activeBreakpointStyles[field.key] || '';
            return (
              <div key={field.key} className="flex items-center gap-2">
                <label className="text-xs text-gray-600 w-24 flex-shrink-0" title={field.key}>
                  {field.label}:
                </label>
                {field.type === 'select' ? (
                  <select
                    value={value}
                    onChange={(e) => handlePropChange(field.key, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Default</option>
                    {(field.options || []).map((option: any) => {
                      const optionValue = typeof option === 'object' ? option.value : option;
                      const optionLabel = typeof option === 'object' ? option.label : option;
                      return (
                        <option key={optionValue} value={optionValue}>
                          {optionLabel}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handlePropChange(field.key, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="text-xs text-gray-400 text-center py-4">
            No responsive fields defined for this element.
          </div>
        )}
      </div>

      {/* Info about cascade */}
      <div className="mt-3 p-2 bg-blue-50 rounded-md">
        <p className="text-[10px] text-blue-600">
          <strong>Note:</strong> Styles cascade from smaller to larger breakpoints. 
          Base styles apply to all sizes unless overridden.
        </p>
      </div>
    </div>
  );
};
