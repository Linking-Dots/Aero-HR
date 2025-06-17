/**
 * Theme Setting Drawer Configuration
 * 
 * Configuration object for theme setting drawer component.
 * Contains theme options, UI settings, animations, and accessibility options.
 */

export const THEME_SETTING_DRAWER_CONFIG = {
  // Available theme colors with styling classes
  themeColors: [
    { 
      name: "DEFAULT", 
      color: "#2563eb",
      className: "bg-blue-600/25 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[hover=true]:bg-blue-600 data-[hover=true]:text-white text-blue-600 font-bold" 
    },
    { 
      name: "TEAL", 
      color: "#0d9488",
      className: "bg-teal-600/25 data-[active=true]:bg-teal-600 data-[active=true]:text-white text-teal-600 font-bold data-[hover=true]:bg-teal-600 data-[hover=true]:text-white"
    },
    { 
      name: "GREEN", 
      color: "#16a34a",
      className: "bg-green-600/25 data-[active=true]:bg-green-600 data-[active=true]:text-white data-[hover=true]:bg-green-600 data-[hover=true]:text-white text-green-600 font-bold"
    },
    { 
      name: "PURPLE", 
      color: "#9333ea",
      className: "bg-purple-600/25 data-[active=true]:bg-purple-600 data-[active=true]:text-white data-[hover=true]:bg-purple-600 data-[hover=true]:text-white text-purple-600 font-bold"
    },
    { 
      name: "RED", 
      color: "#dc2626",
      className: "bg-red-600/25 data-[active=true]:bg-red-600 data-[active=true]:text-white data-[hover=true]:bg-red-600 data-[hover=true]:text-white text-red-600 font-bold"
    },
    { 
      name: "ORANGE", 
      color: "#ea580c",
      className: "bg-orange-600/25 data-[active=true]:bg-orange-600 data-[active=true]:text-white data-[hover=true]:bg-orange-600 data-[hover=true]:text-white text-orange-600 font-bold"
    }
  ],

  // UI Configuration
  ui: {
    drawerWidth: 280,
    headerHeight: 64,
    listItemPadding: 1,
    buttonRadius: 'full',
    iconSize: 24,
    spacing: {
      section: 2,
      item: 1
    }
  },

  // Animation Settings
  animation: {
    transitionDuration: 300,
    easing: 'ease-in-out',
    stagger: 50
  },

  // Glass Morphism Styling
  glassStyle: {
    backdrop: 'blur(24px) saturate(180%)',
    borderRadius: '0px',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  },

  // Accessibility
  accessibility: {
    drawerLabel: 'Theme settings drawer',
    closeButtonLabel: 'Close theme settings',
    darkModeLabel: 'Toggle dark mode',
    themeColorLabel: 'Select theme color'
  },

  // Labels and Text
  labels: {
    title: 'Theme Settings',
    themeBase: 'THEME BASE',
    themeColors: 'THEME COLORS',
    darkMode: 'DARK MODE'
  }
};
