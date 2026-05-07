/**
 * Icon Library — Public API
 *
 * PageRenderer only needs to:
 *   import DynamicIcon from '../icons';
 *
 * Builder uses:
 *   import { IconPicker, iconRegistry } from '../icons';
 */

export { default as DynamicIcon } from './DynamicIcon';
export { default as IconPicker } from './IconPicker';
export { iconRegistry } from './IconRegistry';
export { useIconResolver } from './useIconResolver';
export { ICON_PACK_MAP, PACK_LABELS, PACK_PREFIXES, POPULAR_PACKS, ALL_PACKS } from './iconPackMap';

// Default export for convenience (PageRenderer just does `import DynamicIcon from '../icons'`)
export { default } from './DynamicIcon';
