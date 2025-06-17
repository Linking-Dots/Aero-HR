/**
 * Glass Dropdown Configuration
 * 
 * Configuration object for glass dropdown component.
 * Contains styling, animations, and accessibility settings.
 */

export const GLASS_DROPDOWN_CONFIG = {
  // Styling Configuration
  styling: {
    borderRadius: '12px',
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
    backdropFilter: 'blur(16px) saturate(200%)',
    minWidth: '160px',
    maxWidth: '320px',
    zIndex: 1300
  },

  // CSS Class Names
  classNames: {
    content: 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg',
    trigger: 'glass-dropdown-trigger',
    menu: 'glass-dropdown-menu',
    item: 'glass-dropdown-item'
  },

  // Animation Settings
  animation: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    origin: 'top',
    scale: {
      initial: 0.95,
      final: 1
    },
    opacity: {
      initial: 0,
      final: 1
    }
  },

  // Positioning
  positioning: {
    offset: 8,
    crossOffset: 0,
    placement: 'bottom',
    fallbackPlacements: ['top', 'bottom-start', 'bottom-end']
  },

  // Accessibility
  accessibility: {
    role: 'menu',
    ariaLabel: 'Dropdown menu',
    keyboardNavigation: true,
    focusManagement: true
  },

  // Responsive Behavior
  responsive: {
    mobile: {
      fullWidth: false,
      placement: 'bottom-start'
    },
    tablet: {
      maxWidth: '280px',
      placement: 'bottom'
    },
    desktop: {
      maxWidth: '320px',
      placement: 'bottom'
    }
  }
};
