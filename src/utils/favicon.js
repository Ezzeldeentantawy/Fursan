/**
 * Update the favicon of the page
 * @param {string|null} faviconUrl - The URL of the favicon to set, or null to revert to default
 */
export const updateFavicon = (faviconUrl) => {
  // Find existing favicon link element
  let link = document.querySelector("link[rel*='icon']");

  // If no favicon link exists, create one
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  // Set the href to the new favicon URL or revert to default
  if (faviconUrl) {
    // Clean the URL in case it has JSON escape sequences
    const cleanedUrl = faviconUrl.replace(/\\\//g, '/');
    link.href = cleanedUrl;
  } else {
    // Revert to default favicon
    link.href = '/favicon.ico';
  }
};
