/**
 * Glass Dialog Configuration
 * 
 * Configuration object for glass dialog component.
 * Contains styling, animations, and behavior settings.
 */

export const GLASS_DIALOG_CONFIG = {
  // Styling Configuration
  styling: {
    borderRadius: '20px',
    lightBoxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
    darkBoxShadow: 'none',
    minHeight: '200px',
    maxHeight: '90vh',
    minWidth: '320px'
  },

  // Backdrop Configuration
  backdrop: {
    blur: 'blur(8px)',
    color: 'rgba(0, 0, 0, 0.3)',
    opacity: 1
  },

  // Animation Settings
  animation: {
    transitionDuration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    grow: {
      timeout: 300,
      easing: 'ease-out'
    },
    fade: {
      timeout: 225,
      easing: 'ease-in'
    }
  },

  // Draggable Settings
  draggable: {
    handle: '#draggable-dialog-title',
    cancel: '[class*="MuiDialogContent-root"]',
    bounds: 'parent',
    enableUserSelectHack: false
  },

  // Responsive Behavior
  responsive: {
    mobile: {
      fullScreen: false,
      margin: 16,
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 64px)'
    },
    tablet: {
      margin: 32,
      maxWidth: 'calc(100vw - 64px)',
      maxHeight: 'calc(100vh - 128px)'
    },
    desktop: {
      margin: 'auto',
      centerPosition: true
    }
  },

  // Accessibility
  accessibility: {
    role: 'dialog',
    modal: true,
    ariaModal: true,
    focusTrap: true,
    restoreFocus: true,
    escapeKeyDown: true
  },

  // Size Presets
  sizes: {
    xs: { maxWidth: '320px' },
    sm: { maxWidth: '600px' },
    md: { maxWidth: '900px' },
    lg: { maxWidth: '1200px' },
    xl: { maxWidth: '1536px' }
  },

  // Content Padding
  contentPadding: {
    mobile: 16,
    tablet: 24,
    desktop: 32
  },

  // Header Configuration
  header: {
    height: 64,
    padding: 24,
    borderBottom: true,
    closeButton: true
  },

  // Footer Configuration
  footer: {
    height: 64,
    padding: 24,
    borderTop: true,
    alignment: 'flex-end'
  }
};
