/**
 * useIconResolver — React hook wrapping IconRegistry.resolve()
 *
 * Returns { Icon, loading } where Icon is the resolved component
 * (or null) and loading is true while the async import is in flight.
 *
 * Automatically handles:
 *   - Cancellation on unmount or prop change
 *   - Null/undefined inputs
 *   - Error recovery
 */

import { useState, useEffect } from 'react';
import { iconRegistry } from './IconRegistry';

/**
 * @param {string|null|undefined} iconType  e.g. "lucide", "fa", "md"
 * @param {string|null|undefined} iconName  e.g. "Settings", "FaHome"
 * @returns {{ Icon: React.ComponentType|null, loading: boolean }}
 */
export function useIconResolver(iconType, iconName) {
  const [Icon, setIcon] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No icon to resolve — reset immediately
    if (!iconType || !iconName) {
      setIcon(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    iconRegistry
      .resolve(iconType, iconName)
      .then((comp) => {
        if (!cancelled) {
          // Wrap in a function so React treats it as a component reference
          setIcon(() => comp);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[useIconResolver] Error resolving icon:', err);
          setIcon(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [iconType, iconName]);

  return { Icon, loading };
}
