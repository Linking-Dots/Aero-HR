/**
 * Sidebar Utility Functions
 * 
 * Utility functions for sidebar navigation component following
 * ISO 25010 maintainability standards.
 */

/**
 * Group navigation pages by category
 * @param {Array} pages - Array of navigation page objects
 * @returns {Object} Grouped pages object with mainPages and settingsPages
 */
export const groupPagesByCategory = (pages) => {
  const mainPages = pages.filter(page => !page.category || page.category === 'main');
  const settingsPages = pages.filter(page => page.category === 'settings');
  
  return { mainPages, settingsPages };
};

/**
 * Find active parent menu for a given URL
 * @param {string} currentUrl - Current active URL
 * @param {Array} pages - Array of navigation page objects
 * @returns {string|null} Name of active parent menu or null
 */
export const findActiveParentMenu = (currentUrl, pages) => {
  for (const page of pages) {
    if (page.subMenu) {
      const hasActiveSubPage = page.subMenu.some(
        subPage => "/" + subPage.route === currentUrl
      );
      if (hasActiveSubPage) {
        return page.name;
      }
    }
  }
  return null;
};

/**
 * Check if a page is active (including submenu pages)
 * @param {Object} page - Page object
 * @param {string} currentUrl - Current active URL
 * @returns {boolean} True if page or any submenu item is active
 */
export const isPageActive = (page, currentUrl) => {
  // Direct page match
  if ("/" + page.route === currentUrl) {
    return true;
  }
  
  // Check submenu items
  if (page.subMenu) {
    return page.subMenu.some(subPage => "/" + subPage.route === currentUrl);
  }
  
  return false;
};

/**
 * Get navigation breadcrumbs for current URL
 * @param {string} currentUrl - Current active URL
 * @param {Array} pages - Array of navigation page objects
 * @returns {Array} Array of breadcrumb objects
 */
export const getNavigationBreadcrumbs = (currentUrl, pages) => {
  const breadcrumbs = [];
  
  for (const page of pages) {
    if ("/" + page.route === currentUrl) {
      breadcrumbs.push({ name: page.name, route: page.route });
      break;
    }
    
    if (page.subMenu) {
      const activeSubPage = page.subMenu.find(
        subPage => "/" + subPage.route === currentUrl
      );
      
      if (activeSubPage) {
        breadcrumbs.push({ name: page.name, route: null }); // Parent doesn't have route
        breadcrumbs.push({ name: activeSubPage.name, route: activeSubPage.route });
        break;
      }
    }
  }
  
  return breadcrumbs;
};

/**
 * Validate navigation page structure
 * @param {Object} page - Page object to validate
 * @returns {boolean} True if page structure is valid
 */
export const validatePageStructure = (page) => {
  const requiredFields = ['name', 'route'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!page[field]) {
      console.warn(`Invalid page structure: missing ${field}`, page);
      return false;
    }
  }
  
  // Validate submenu structure if present
  if (page.subMenu && Array.isArray(page.subMenu)) {
    for (const subPage of page.subMenu) {
      if (!validatePageStructure(subPage)) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Filter and validate navigation pages
 * @param {Array} pages - Array of navigation page objects
 * @returns {Array} Filtered and validated pages
 */
export const processNavigationPages = (pages) => {
  if (!Array.isArray(pages)) {
    console.warn('Navigation pages must be an array');
    return [];
  }
  
  return pages.filter(page => {
    if (!validatePageStructure(page)) {
      console.warn('Skipping invalid page:', page);
      return false;
    }
    return true;
  });
};

// Export as default object for easier imports
export const sidebarUtils = {
  groupPagesByCategory,
  findActiveParentMenu,
  isPageActive,
  getNavigationBreadcrumbs,
  validatePageStructure,
  processNavigationPages
};
