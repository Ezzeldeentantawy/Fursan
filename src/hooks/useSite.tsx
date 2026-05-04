import { useMemo } from 'react';

/**
 * Custom hook for site-related utilities
 * @returns {Object} Site utilities including getPreviewUrl
 */
export const useSite = () => {
  /**
   * Generate preview URL for a page
   * @param {string} siteDomain - The site domain
   * @param {string} pageSlug - The page slug
   * @param {boolean} isDefaultSite - Whether this is the default site
   * @returns {string} Full preview URL
   */
  const getPreviewUrl = (siteDomain: string, pageSlug: string, isDefaultSite: boolean = false) => {
    const origin = window.location.origin;
    const base = import.meta.env.BASE_URL || '/';
    const normalizedBase = base.endsWith('/') ? base : base + '/';
    const normalizedSlug = pageSlug?.startsWith('/') ? pageSlug.slice(1) : pageSlug;
    
    // If this is the default site, don't include siteDomain in URL
    if (isDefaultSite) {
      return `${origin}${normalizedBase}${normalizedSlug}`;
    } else {
      return `${origin}${normalizedBase}${siteDomain}/${normalizedSlug}`;
    }
  };

  return useMemo(() => ({
    getPreviewUrl,
  }), []);
};

export default useSite;
