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
   * @returns {string} Full preview URL
   */
  const getPreviewUrl = (siteDomain, pageSlug) => {
    const baseUrl = import.meta.env.BASE_URL || '';
    // Remove trailing slash from baseUrl if present
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Remove leading slash from pageSlug if present
    const normalizedSlug = pageSlug?.startsWith('/') ? pageSlug.slice(1) : pageSlug;
    
    return `/${normalizedBase}/${siteDomain}/${normalizedSlug}`;
  };

  return useMemo(() => ({
    getPreviewUrl,
  }), []);
};

export default useSite;
