/**
 * Sidebar Organism Export
 * 
 * Navigation sidebar component with hierarchical menu support,
 * state persistence, and responsive behavior.
 */

export { default } from './Sidebar';
export { sidebarUtils } from './utils';

// Component metadata for documentation and testing
export const SidebarMeta = {
  component: 'Sidebar',
  type: 'organism',
  category: 'navigation',
  description: 'Complex navigation sidebar with submenu support and responsive behavior',
  props: {
    isOpen: 'boolean - Controls sidebar visibility',
    onToggle: 'function - Callback for sidebar toggle',
    navigationItems: 'array - Array of navigation page objects',
    currentUrl: 'string - Current active URL path',
    config: 'object - Optional configuration object'
  },
  features: [
    'Hierarchical navigation with submenus',
    'State persistence in localStorage',
    'Responsive design (mobile overlay, desktop sidebar)',
    'Accessibility support with ARIA attributes',
    'Auto-expand parent menus for active pages',
    'Customizable configuration',
    'Development tools for state management'
  ],
  usage: `
import { Sidebar } from '@components/organisms/sidebar';

<Sidebar 
  isOpen={sidebarOpen}
  onToggle={toggleSidebar}
  navigationItems={pages}
  currentUrl={currentUrl}
  config={{
    showVersionInfo: true,
    enableStateReset: false,
    maxSubMenuItems: 10
  }}
/>
  `
};
