/**
 * IconRegistry — Singleton Cache + Dynamic Import Manager
 *
 * Resolves icon components from any supported pack using lazy
 * dynamic imports. Deduplicates concurrent requests for the same
 * pack via the `pending` Map. Caches both resolved components and
 * full module objects to avoid re-importing.
 *
 * Usage:
 *   import { iconRegistry } from './IconRegistry';
 *
 *   // Get a component (async, loads the pack on first call)
 *   const SettingsIcon = await iconRegistry.resolve('lucide', 'Settings');
 *
 *   // Preload a pack in the background
 *   iconRegistry.preloadPack('fa');
 *
 *   // Check if already cached (sync, returns null if not loaded)
 *   const cached = iconRegistry.getSync('lucide', 'Settings');
 */

import { ICON_PACK_MAP, PACK_PREFIXES } from './iconPackMap';

class IconRegistry {
  constructor() {
    /** @type {Map<string, React.ComponentType>} "lucide:Settings" -> component */
    this.cache = new Map();

    /** @type {Map<string, Object>} "lucide" -> full module namespace object */
    this.moduleCache = new Map();

    /** @type {Map<string, Promise<Object>>} "lucide" -> in-flight Promise to dedupe */
    this.pending = new Map();
  }

  /**
   * Resolve an icon component by pack + name.
   * Returns the component (not JSX) so the caller can render it.
   * Returns `null` if the icon is not found.
   *
   * @param {string|null|undefined} iconType  e.g. "lucide", "fa", "md"
   * @param {string|null|undefined} iconName  e.g. "Settings", "FaHome"
   * @returns {Promise<React.ComponentType|null>}
   */
  async resolve(iconType, iconName) {
    if (!iconType || !iconName) return null;

    const cacheKey = `${iconType}:${iconName}`;

    // 1. Check component cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 2. Load the full module
    const mod = await this._loadModule(iconType);

    // 3. Extract the component
    const Icon = mod[iconName];
    if (!Icon) {
      console.warn(
        `[IconRegistry] Icon "${iconName}" not found in pack "${iconType}"`
      );
      this.cache.set(cacheKey, null);
      return null;
    }

    this.cache.set(cacheKey, Icon);
    return Icon;
  }

  /**
   * Internal: load (or retrieve cached) module for a pack.
   * Deduplicates concurrent requests using the `pending` Map.
   *
   * @param {string} iconType
   * @returns {Promise<Object>} module namespace object
   */
  async _loadModule(iconType) {
    // Return cached module
    if (this.moduleCache.has(iconType)) {
      return this.moduleCache.get(iconType);
    }

    // Deduplicate concurrent requests
    if (this.pending.has(iconType)) {
      return this.pending.get(iconType);
    }

    const importFn = ICON_PACK_MAP[iconType];
    if (!importFn) {
      console.warn(`[IconRegistry] Unknown icon pack: "${iconType}"`);
      return {};
    }

    const promise = importFn()
      .then((mod) => {
        // Normalize: mod might be default or namespace
        const namespace = mod.default || mod;
        this.moduleCache.set(iconType, namespace);
        this.pending.delete(iconType);
        return namespace;
      })
      .catch((err) => {
        this.pending.delete(iconType);
        console.error(
          `[IconRegistry] Failed to load pack "${iconType}":`,
          err
        );
        return {};
      });

    this.pending.set(iconType, promise);
    return promise;
  }

  /**
   * Preload a pack in the background without resolving a specific icon.
   * Safe to call concurrently — uses deduplication internally.
   *
   * @param {string} iconType
   */
  async preloadPack(iconType) {
    await this._loadModule(iconType);
  }

  /**
   * Synchronous lookup — returns the component only if already cached.
   * Returns `null` if the pack or icon hasn't been loaded yet.
   *
   * @param {string} iconType
   * @param {string} iconName
   * @returns {React.ComponentType|null}
   */
  getSync(iconType, iconName) {
    if (!iconType || !iconName) return null;
    return this.cache.get(`${iconType}:${iconName}`) || null;
  }

  /**
   * Get ALL icon component names for a given pack.
   * Loads the pack if not already cached.
   * Filters module exports to only actual icon components using
   * the naming prefix convention.
   *
   * @param {string} iconType
   * @returns {Promise<string[]>} sorted array of icon names
   */
  async getIconNames(iconType) {
    const mod = await this._loadModule(iconType);
    const prefix = PACK_PREFIXES[iconType] || '';

    return Object.keys(mod)
      .filter((key) => {
        const export_ = mod[key];
        // Must be a function or object (React component)
        if (typeof export_ !== 'function' && typeof export_ !== 'object') {
          return false;
        }
        // Must be a known icon function (not a utility)
        if (typeof export_ !== 'function') return false;

        if (iconType === 'lucide') {
          // Lucide icons are PascalCase component functions
          return key[0] === key[0]?.toUpperCase() && key[0] !== undefined;
        }

        // react-icons: must start with the pack prefix
        return prefix ? key.startsWith(prefix) : true;
      })
      .sort();
  }

  /**
   * Check if a pack is currently loading or cached.
   *
   * @param {string} iconType
   * @returns {boolean}
   */
  isPackReady(iconType) {
    return this.moduleCache.has(iconType);
  }

  /**
   * Clear all caches (useful for testing or hard refresh).
   */
  clear() {
    this.cache.clear();
    this.moduleCache.clear();
    this.pending.clear();
  }
}

/** Singleton instance */
export const iconRegistry = new IconRegistry();
