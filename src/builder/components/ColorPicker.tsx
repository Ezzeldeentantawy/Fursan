import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { HexColorPicker } from 'react-colorful';
import { X } from 'lucide-react';
import { mergeAlpha, getAlpha, toSixDigitHex, formatOpacity } from '../../utils/color';

interface ColorPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  id: string;
  /** Legacy opacity value (0-100) from {prop}Opacity */
  alphaValue?: number | null;
  /** Update legacy {prop}Opacity */
  onAlphaChange?: (alpha: number) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  id,
  alphaValue,
  onAlphaChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  // Resolve current alpha: from legacy opacity prop OR from hex
  const currentAlpha =
    alphaValue !== undefined && alphaValue !== null
      ? Math.min(1, Math.max(0, alphaValue / 100))
      : getAlpha(value);

  // Clean 6-digit hex for the color picker
  const cleanHex = toSixDigitHex(value);

  // Handle color change from picker
  const handleColorChange = (newHex: string) => {
    const merged = mergeAlpha(newHex, currentAlpha);
    onChange(merged);
    if (onAlphaChange) onAlphaChange(formatOpacity(currentAlpha));
  };

  // Handle alpha slider change
  const handleAlphaSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAlpha = parseInt(e.target.value, 10) / 100;
    const merged = mergeAlpha(cleanHex, newAlpha);
    onChange(merged);
    if (onAlphaChange) onAlphaChange(formatOpacity(newAlpha));
  };

  // Clear color
  const handleClear = () => {
    onChange(null);
    if (onAlphaChange) onAlphaChange(100);
  };

  // Calculate popover position relative to viewport
  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 8, // 8px gap (mt-2 equivalent)
        left: rect.left,
      });
    }
  }, []);

  // Open popover: calculate position, then show
  const openPopover = () => {
    updatePosition();
    setIsOpen(true);
  };

  // Close popover
  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Recalculate position on scroll or resize while open
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Close popover on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // Ignore clicks on the trigger button itself (it has its own toggle)
        if (triggerRef.current && triggerRef.current.contains(e.target as Node)) return;
        closePopover();
      }
    };
    // Delay adding listener to avoid the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, closePopover]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Color swatch button */}
        <div ref={triggerRef} className="relative">
          <div
            className="w-8 h-8 border border-slate-700 rounded-lg cursor-pointer overflow-hidden"
            onClick={openPopover}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundColor: value || 'transparent',
              }}
            />
          </div>
          {!value || value === 'transparent' ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs pointer-events-none">⊘</div>
          ) : null}
        </div>

        {/* Hex text input */}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="#000000"
          className="flex-1 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
        />

        {/* Clear button */}
        <button
          onClick={handleClear}
          className="p-1 text-slate-500 hover:text-red-400 transition-colors shrink-0"
          title="Clear color"
        >
          <X size={14} />
        </button>
      </div>

      {/* Popover — rendered via Portal to escape overflow:hidden containers */}
      {isOpen && ReactDOM.createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[100] bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl"
          style={{ width: '240px', top: popoverPos.top, left: popoverPos.left }}
        >
          {/* Color picker */}
          <HexColorPicker
            color={cleanHex}
            onChange={handleColorChange}
            style={{ width: '100%', height: '170px' }}
          />

          {/* Alpha slider */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Opacity</span>
              <span className="text-[10px] font-mono text-slate-500">{formatOpacity(currentAlpha)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={formatOpacity(currentAlpha)}
              onChange={handleAlphaSlider}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, transparent, ${cleanHex})`,
              }}
            />
          </div>

          {/* Preview */}
          <div className="mt-2 flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg">
            <div
              className="w-5 h-5 rounded border border-slate-600 shrink-0"
              style={{ backgroundColor: mergeAlpha(cleanHex, currentAlpha) }}
            />
            <span className="text-[10px] font-mono text-slate-500 truncate">
              {mergeAlpha(cleanHex, currentAlpha)}
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
