/**
 * IconPicker — Builder-only icon selection UI with virtualization.
 *
 * Features:
 *   - Lazy-loads icon list from the selected pack on open
 *   - Tab bar for popular packs + "More" dropdown for the rest
 *   - Debounced search (200 ms)
 *   - Virtualized grid via react-window v2 <Grid>
 *   - Preloads adjacent packs on hover
 *   - Shows icon name below each cell (truncated with ellipsis)
 *
 * Usage in ElementSettings:
 *   <IconPicker
 *     selectedIcon={icon}
 *     selectedPack={iconType || source}
 *     onSelect={(iconName, packType) => { ... }}
 *   />
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Grid } from 'react-window';
import { iconRegistry } from './IconRegistry';
import {
  ICON_PACK_MAP,
  PACK_LABELS,
  POPULAR_PACKS,
  ALL_PACKS,
} from './iconPackMap';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_COLUMN_WIDTH = 80;
const GRID_ROW_HEIGHT = 90;
const GRID_VISIBLE_HEIGHT = 400;
const OVERSCAN_COUNT = 3;
const SEARCH_DEBOUNCE_MS = 200;
const POPULAR_SET = new Set(POPULAR_PACKS);
const MINOR_PACKS = ALL_PACKS.filter((p) => !POPULAR_SET.has(p));

// ---------------------------------------------------------------------------
// Debounce hook
// ---------------------------------------------------------------------------

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Grid Cell Component (rendered once, receives data via cellProps)
// ---------------------------------------------------------------------------

const IconGridCell = React.memo(
  ({
    columnIndex,
    rowIndex,
    style,
    /* from cellProps: */
    filteredIcons,
    columnCount,
    selectedIcon,
    selectedPack,
    activePack,
    onSelect,
    preloadPack,
  }) => {
    const index = rowIndex * columnCount + columnIndex;
    const iconName = filteredIcons?.[index];
    if (!iconName) return null;

    const isSelected = iconName === selectedIcon && activePack === selectedPack;

    return (
      <div
        style={{
          ...style,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          cursor: 'pointer',
        }}
        onClick={() => onSelect(iconName, activePack)}
        onMouseEnter={() => preloadPack && preloadPack(activePack)}
        title={iconName}
      >
        <div
          style={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            backgroundColor: isSelected
              ? 'rgba(168,85,247,0.25)'
              : 'rgba(30,41,59,0.6)',
            border: isSelected
              ? '2px solid #a855f7'
              : '2px solid transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <IconPreview iconName={iconName} pack={activePack} />
        </div>
        <span
          style={{
            fontSize: 9,
            color: isSelected ? '#a855f7' : '#94a3b8',
            marginTop: 4,
            maxWidth: 72,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            fontWeight: isSelected ? 700 : 400,
          }}
        >
          {iconName}
        </span>
      </div>
    );
  },
);

IconGridCell.displayName = 'IconGridCell';

// ---------------------------------------------------------------------------
// IconPicker
// ---------------------------------------------------------------------------

const IconPicker = ({ selectedIcon, selectedPack, onSelect, onClose }) => {
  const [activePack, setActivePack] = useState(selectedPack || 'lucide');
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const containerRef = useRef(null);
  const gridWrapperRef = useRef(null);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  // ---- Load icon names for the active pack ----
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    iconRegistry
      .getIconNames(activePack)
      .then((names) => {
        if (!cancelled) {
          setIcons(names);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[IconPicker] Failed to load icons:', err);
          setError(`Failed to load "${PACK_LABELS[activePack]}" icons.`);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activePack]);

  // ---- Preload neighbouring packs ----
  const preloadPack = useCallback((pack) => {
    if (!iconRegistry.isPackReady(pack)) {
      iconRegistry.preloadPack(pack);
    }
  }, []);

  // ---- Filter icons by search term ----
  const filteredIcons = useMemo(() => {
    if (!debouncedSearch) return icons;
    const lower = debouncedSearch.toLowerCase();
    return icons.filter((name) => name.toLowerCase().includes(lower));
  }, [icons, debouncedSearch]);

  // ---- Grid dimensions ----
  const gridWidth = useMemo(() => {
    // react-window v2 uses container-based sizing, defaultWidth as fallback
    return 520; // fixed width matching maxWidth of the picker
  }, []);

  const columnCount = Math.max(1, Math.floor(gridWidth / GRID_COLUMN_WIDTH));
  const rowCount = Math.ceil(filteredIcons.length / columnCount);

  // ---- Stable cellProps reference to avoid infinite Grid re-mounts ----
  const cellProps = useMemo(
    () => ({
      filteredIcons,
      columnCount,
      selectedIcon,
      selectedPack,
      activePack,
      onSelect,
      preloadPack,
    }),
    [
      filteredIcons,
      columnCount,
      selectedIcon,
      selectedPack,
      activePack,
      onSelect,
      preloadPack,
    ],
  );

  // ---- Tab bar ----
  const renderTabs = () => (
    <div
      style={{
        display: 'flex',
        gap: 4,
        marginBottom: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {POPULAR_PACKS.map((pack) => (
        <button
          key={pack}
          onClick={() => {
            setActivePack(pack);
            setShowMoreDropdown(false);
          }}
          onMouseEnter={() => preloadPack(pack)}
          style={{
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            backgroundColor:
              activePack === pack ? '#a855f7' : 'rgba(30,41,59,0.6)',
            color: activePack === pack ? '#fff' : '#94a3b8',
            transition: 'all 0.15s ease',
          }}
        >
          {PACK_LABELS[pack] || pack}
        </button>
      ))}

      {/* More dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMoreDropdown((v) => !v)}
          onMouseEnter={() => setShowMoreDropdown(true)}
          style={{
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'rgba(30,41,59,0.6)',
            color: '#94a3b8',
            transition: 'all 0.15s ease',
          }}
        >
          More ▾
        </button>
        {showMoreDropdown && (
          <div
            onMouseLeave={() => setShowMoreDropdown(false)}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: 4,
              zIndex: 100,
              minWidth: 160,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            {MINOR_PACKS.map((pack) => (
              <button
                key={pack}
                onClick={() => {
                  setActivePack(pack);
                  setShowMoreDropdown(false);
                }}
                onMouseEnter={() => preloadPack(pack)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: activePack === pack ? 700 : 400,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor:
                    activePack === pack
                      ? 'rgba(168,85,247,0.2)'
                      : 'transparent',
                  color: activePack === pack ? '#a855f7' : '#cbd5e1',
                  textAlign: 'left',
                  transition: 'all 0.1s ease',
                }}
              >
                {PACK_LABELS[pack] || pack}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: 12,
        width: '100%',
        maxWidth: 560,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#e2e8f0',
          }}
        >
          Select Icon
        </span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons..."
        autoFocus
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 12,
          backgroundColor: 'rgba(15,23,42,0.8)',
          border: '1px solid #334155',
          borderRadius: 8,
          color: '#e2e8f0',
          outline: 'none',
          marginBottom: 12,
          boxSizing: 'border-box',
        }}
      />

      {/* Tabs */}
      {renderTabs()}

      {/* Grid area */}
      <div
        ref={gridWrapperRef}
        style={{ position: 'relative', minHeight: 200 }}
      >
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: '#64748b',
              fontSize: 12,
            }}
          >
            Loading icons...
          </div>
        )}

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: '#f87171',
              fontSize: 12,
              textAlign: 'center',
              padding: 16,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && filteredIcons.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: '#64748b',
              fontSize: 12,
            }}
          >
            {debouncedSearch
              ? `No icons match "${debouncedSearch}"`
              : 'No icons found for this pack.'}
          </div>
        )}

        {!loading && !error && filteredIcons.length > 0 && (
          <Grid
            columnCount={columnCount}
            columnWidth={GRID_COLUMN_WIDTH}
            rowCount={rowCount}
            rowHeight={GRID_ROW_HEIGHT}
            defaultHeight={GRID_VISIBLE_HEIGHT}
            defaultWidth={gridWidth}
            overscanCount={OVERSCAN_COUNT}
            cellComponent={IconGridCell}
            cellProps={cellProps}
          />
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// IconPreview — renders a tiny preview of a single icon inside the grid
// ---------------------------------------------------------------------------

const IconPreview = React.memo(({ iconName, pack }) => {
  const [Icon, setIcon] = useState(null);

  useEffect(() => {
    let cancelled = false;

    iconRegistry.resolve(pack, iconName).then((comp) => {
      if (!cancelled && comp) {
        setIcon(() => comp);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pack, iconName]);

  if (!Icon) {
    return (
      <span
        style={{
          width: 24,
          height: 24,
          display: 'inline-block',
          backgroundColor: 'rgba(100,116,139,0.3)',
          borderRadius: 4,
        }}
      />
    );
  }

  return <Icon size={24} color="#e2e8f0" />;
});

IconPreview.displayName = 'IconPreview';

export default IconPicker;
