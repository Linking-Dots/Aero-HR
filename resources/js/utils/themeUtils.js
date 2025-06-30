/**
 * Theme Utility Functions
 * Provides consistent theming across the application
 */

export const THEME_COLORS = [
  { 
    name: "OCEAN", 
    primary: "#0ea5e9", 
    secondary: "#0284c7",
    accent: "#06b6d4",
    gradient: "from-sky-500 to-blue-600",
    description: "Ocean Blue - Professional & Trustworthy",
    category: "Professional",
    gradients: {
      primary: "from-sky-400 to-sky-600",
      secondary: "from-blue-400 to-blue-600",
      accent: "from-cyan-400 to-blue-600",
      light: "from-sky-100 to-blue-100",
      dark: "from-sky-800 to-blue-900",
      subtle: "from-sky-50 to-blue-50",
      neon: "from-cyan-400 via-blue-500 to-indigo-600"
    },
    tailwind: {
      primary: "sky-500",
      secondary: "blue-600",
      bg: "bg-sky-500/10",
      text: "text-sky-600",
      border: "border-sky-500/30"
    }
  },
  { 
    name: "SUNSET", 
    primary: "#f97316", 
    secondary: "#ea580c",
    accent: "#f59e0b",
    gradient: "from-orange-500 to-red-500",
    description: "Sunset Orange - Warm & Energetic",
    category: "Vibrant",
    gradients: {
      primary: "from-orange-400 to-orange-600",
      secondary: "from-red-400 to-red-600",
      accent: "from-amber-400 to-orange-600",
      light: "from-orange-100 to-red-100",
      dark: "from-orange-800 to-red-900",
      subtle: "from-orange-50 to-red-50",
      neon: "from-yellow-400 via-orange-500 to-red-600"
    },
    tailwind: {
      primary: "orange-500",
      secondary: "red-600",
      bg: "bg-orange-500/10",
      text: "text-orange-600",
      border: "border-orange-500/30"
    }
  },
  { 
    name: "FOREST", 
    primary: "#059669", 
    secondary: "#047857",
    accent: "#10b981",
    gradient: "from-emerald-500 to-green-600",
    description: "Forest Green - Natural & Growth",
    category: "Nature",
    gradients: {
      primary: "from-emerald-400 to-emerald-600",
      secondary: "from-green-400 to-green-600",
      accent: "from-teal-400 to-emerald-600",
      light: "from-emerald-100 to-green-100",
      dark: "from-emerald-800 to-green-900",
      subtle: "from-emerald-50 to-green-50",
      neon: "from-lime-400 via-emerald-500 to-green-600"
    },
    tailwind: {
      primary: "emerald-500",
      secondary: "green-600",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      border: "border-emerald-500/30"
    }
  },
  { 
    name: "ROYAL", 
    primary: "#7c3aed", 
    secondary: "#6d28d9",
    accent: "#8b5cf6",
    gradient: "from-violet-500 to-purple-600",
    description: "Royal Purple - Luxury & Creativity",
    category: "Premium",
    gradients: {
      primary: "from-violet-400 to-violet-600",
      secondary: "from-purple-400 to-purple-600",
      accent: "from-indigo-400 to-purple-600",
      light: "from-violet-100 to-purple-100",
      dark: "from-violet-800 to-purple-900",
      subtle: "from-violet-50 to-purple-50",
      neon: "from-fuchsia-400 via-violet-500 to-purple-600"
    },
    tailwind: {
      primary: "violet-500",
      secondary: "purple-600",
      bg: "bg-violet-500/10",
      text: "text-violet-600",
      border: "border-violet-500/30"
    }
  },
  { 
    name: "CHERRY", 
    primary: "#e11d48", 
    secondary: "#be185d",
    accent: "#f43f5e",
    gradient: "from-rose-500 to-pink-600",
    description: "Cherry Blossom - Elegant & Passionate",
    category: "Elegant",
    gradients: {
      primary: "from-rose-400 to-rose-600",
      secondary: "from-pink-400 to-pink-600",
      accent: "from-red-400 to-pink-600",
      light: "from-rose-100 to-pink-100",
      dark: "from-rose-800 to-pink-900",
      subtle: "from-rose-50 to-pink-50",
      neon: "from-pink-400 via-rose-500 to-red-600"
    },
    tailwind: {
      primary: "rose-500",
      secondary: "pink-600",
      bg: "bg-rose-500/10",
      text: "text-rose-600",
      border: "border-rose-500/30"
    }
  },
  { 
    name: "MIDNIGHT", 
    primary: "#475569", 
    secondary: "#334155",
    accent: "#64748b",
    gradient: "from-slate-500 to-gray-600",
    description: "Midnight Slate - Sophisticated & Minimal",
    category: "Minimal",
    gradients: {
      primary: "from-slate-400 to-slate-600",
      secondary: "from-gray-400 to-gray-600",
      accent: "from-zinc-400 to-slate-600",
      light: "from-slate-100 to-gray-100",
      dark: "from-slate-800 to-gray-900",
      subtle: "from-slate-50 to-gray-50",
      neon: "from-slate-400 via-gray-500 to-zinc-600"
    },
    tailwind: {
      primary: "slate-500",
      secondary: "gray-600",
      bg: "bg-slate-500/10",
      text: "text-slate-600",
      border: "border-slate-500/30"
    }
  },  { 
    name: "EMERALD", 
    primary: "#10b981", 
    secondary: "#059669",
    gradient: "from-emerald-500 to-teal-600",
    description: "Emerald Green - Growth & Success",
    gradients: {
      primary: "from-emerald-400 to-emerald-600",
      secondary: "from-teal-400 to-teal-600",
      accent: "from-green-400 to-teal-600",
      light: "from-emerald-100 to-teal-100",
      dark: "from-emerald-800 to-teal-900",
      subtle: "from-emerald-50 to-teal-50"
    },
    tailwind: {
      primary: "emerald-500",
      secondary: "teal-600",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      border: "border-emerald-500/30"
    }
  },  { 
    name: "AMETHYST", 
    primary: "#8b5cf6", 
    secondary: "#7c3aed",
    gradient: "from-violet-500 to-purple-600",
    description: "Amethyst Purple - Creative & Premium",
    gradients: {
      primary: "from-violet-400 to-violet-600",
      secondary: "from-purple-400 to-purple-600",
      accent: "from-indigo-400 to-purple-600",
      light: "from-violet-100 to-purple-100",
      dark: "from-violet-800 to-purple-900",
      subtle: "from-violet-50 to-purple-50"
    },
    tailwind: {
      primary: "violet-500",
      secondary: "purple-600",
      bg: "bg-violet-500/10",
      text: "text-violet-600",
      border: "border-violet-500/30"
    }
  },  { 
    name: "CORAL", 
    primary: "#f97316", 
    secondary: "#ea580c",
    gradient: "from-orange-500 to-red-500",
    description: "Coral Orange - Energetic & Bold",
    gradients: {
      primary: "from-orange-400 to-orange-600",
      secondary: "from-red-400 to-red-600",
      accent: "from-amber-400 to-red-600",
      light: "from-orange-100 to-red-100",
      dark: "from-orange-800 to-red-900",
      subtle: "from-orange-50 to-red-50"
    },
    tailwind: {
      primary: "orange-500",
      secondary: "red-500",
      bg: "bg-orange-500/10",
      text: "text-orange-600",
      border: "border-orange-500/30"
    }
  },  { 
    name: "ROSE", 
    primary: "#e11d48", 
    secondary: "#be123c",
    gradient: "from-rose-500 to-pink-600",
    description: "Rose Red - Passionate & Dynamic",
    gradients: {
      primary: "from-rose-400 to-rose-600",
      secondary: "from-pink-400 to-pink-600",
      accent: "from-red-400 to-pink-600",
      light: "from-rose-100 to-pink-100",
      dark: "from-rose-800 to-pink-900",
      subtle: "from-rose-50 to-pink-50"
    },
    tailwind: {
      primary: "rose-500",
      secondary: "pink-600",
      bg: "bg-rose-500/10",
      text: "text-rose-600",
      border: "border-rose-500/30"
    }
  },  { 
    name: "SLATE", 
    primary: "#64748b", 
    secondary: "#475569",
    gradient: "from-slate-500 to-gray-600",
    description: "Slate Gray - Minimal & Elegant",
    gradients: {
      primary: "from-slate-400 to-slate-600",
      secondary: "from-gray-400 to-gray-600",
      accent: "from-zinc-400 to-slate-600",
      light: "from-slate-100 to-gray-100",
      dark: "from-slate-800 to-gray-900",
      subtle: "from-slate-50 to-gray-50"
    },
    tailwind: {
      primary: "slate-500",
      secondary: "gray-600",
      bg: "bg-slate-500/10",
      text: "text-slate-600",
      border: "border-slate-500/30"
    }
  }
];

/**
 * Get theme color by name
 * @param {string} name - Theme color name
 * @returns {Object} Theme color object
 */
export const getThemeColor = (name) => {
  return THEME_COLORS.find(color => color.name === name) || THEME_COLORS[0];
};

/**
 * Convert hex color to RGB string (industry standard)
 * @param {string} hex - Hex color code (e.g. #0ea5e9)
 * @returns {string} rgb value as 'r, g, b'
 */
export const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return '14, 165, 233';
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return '14, 165, 233';
  try {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
    if (!result) return '14, 165, 233';
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  } catch (error) {
    console.warn('Error converting hex to RGB:', error);
    return '14, 165, 233';
  }
};

/**
 * Generate CSS custom properties for theme
 * @param {Object} themeColor - Theme color object
 * @returns {Object} CSS custom properties
 */
export const generateThemeProperties = (themeColor) => {
  // Ensure themeColor has valid properties
  const safeThemeColor = {
    name: themeColor?.name || "OCEAN",
    primary: themeColor?.primary || "#0ea5e9",
    secondary: themeColor?.secondary || "#0284c7",
    gradient: themeColor?.gradient || "from-sky-500 to-blue-600",
    gradients: themeColor?.gradients || {
      primary: "from-sky-400 to-sky-600",
      secondary: "from-blue-400 to-blue-600",
      accent: "from-cyan-400 to-blue-600",
      light: "from-sky-100 to-blue-100",
      dark: "from-sky-800 to-blue-900",
      subtle: "from-sky-50 to-blue-50"
    },
    description: themeColor?.description || "Ocean Blue - Professional & Trustworthy"
  };
  
  const primaryRgb = hexToRgb(safeThemeColor.primary);
  const secondaryRgb = hexToRgb(safeThemeColor.secondary);
  
  return {
    '--theme-primary': safeThemeColor.primary,
    '--theme-secondary': safeThemeColor.secondary,
    '--theme-primary-rgb': primaryRgb.rgb,
    '--theme-secondary-rgb': secondaryRgb.rgb,
    '--theme-gradient': safeThemeColor.gradient,
    '--theme-gradient-primary': safeThemeColor.gradients.primary,
    '--theme-gradient-secondary': safeThemeColor.gradients.secondary,
    '--theme-gradient-accent': safeThemeColor.gradients.accent,
    '--theme-gradient-light': safeThemeColor.gradients.light,
    '--theme-gradient-dark': safeThemeColor.gradients.dark,
    '--theme-gradient-subtle': safeThemeColor.gradients.subtle,
    '--theme-name': safeThemeColor.name
  };
};

/**
 * Apply theme to document root
 * @param {Object} themeColor - Theme color object
 * @param {boolean} darkMode - Dark mode flag
 */
export const applyThemeToRoot = (themeColor, darkMode = false) => {
  try {
    const root = document.documentElement;
    if (!root) return;
    
    const properties = generateThemeProperties(themeColor);
    
    // Apply custom properties
    Object.entries(properties).forEach(([property, value]) => {
      if (property && value) {
        root.style.setProperty(property, value);
      }
    });
    
    // Apply theme class
    const safeName = themeColor?.name || 'OCEAN';
    root.setAttribute('data-theme', safeName.toLowerCase());
    root.setAttribute('data-theme-mode', darkMode ? 'dark' : 'light');
  } catch (error) {
    console.warn('Error applying theme to root:', error);
  }
};

/**
 * Get dynamic theme classes for Tailwind
 * @param {Object} themeColor - Theme color object
 * @param {string} variant - Variant type (bg, text, border, gradient, etc.)
 * @returns {string} Tailwind classes
 */
export const getThemeClasses = (themeColor, variant = 'primary') => {
  const colorMap = {
    'OCEAN': {
      primary: 'text-sky-500',
      bg: 'bg-sky-500/10 hover:bg-sky-500/20',
      border: 'border-sky-500/30 hover:border-sky-500',
      gradient: 'bg-gradient-to-r from-sky-500 to-blue-600',
      gradientPrimary: 'bg-gradient-to-r from-sky-400 to-sky-600',
      gradientSecondary: 'bg-gradient-to-r from-blue-400 to-blue-600',
      gradientAccent: 'bg-gradient-to-r from-cyan-400 to-blue-600',
      gradientLight: 'bg-gradient-to-r from-sky-100 to-blue-100',
      gradientDark: 'bg-gradient-to-r from-sky-800 to-blue-900',
      gradientSubtle: 'bg-gradient-to-r from-sky-50 to-blue-50',
      button: 'bg-sky-500 hover:bg-sky-600 text-white'
    },
    'EMERALD': {
      primary: 'text-emerald-500',
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      border: 'border-emerald-500/30 hover:border-emerald-500',
      gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      gradientPrimary: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
      gradientSecondary: 'bg-gradient-to-r from-teal-400 to-teal-600',
      gradientAccent: 'bg-gradient-to-r from-green-400 to-teal-600',
      gradientLight: 'bg-gradient-to-r from-emerald-100 to-teal-100',
      gradientDark: 'bg-gradient-to-r from-emerald-800 to-teal-900',
      gradientSubtle: 'bg-gradient-to-r from-emerald-50 to-teal-50',
      button: 'bg-emerald-500 hover:bg-emerald-600 text-white'
    },
    'AMETHYST': {
      primary: 'text-violet-500',
      bg: 'bg-violet-500/10 hover:bg-violet-500/20',
      border: 'border-violet-500/30 hover:border-violet-500',
      gradient: 'bg-gradient-to-r from-violet-500 to-purple-600',
      gradientPrimary: 'bg-gradient-to-r from-violet-400 to-violet-600',
      gradientSecondary: 'bg-gradient-to-r from-purple-400 to-purple-600',
      gradientAccent: 'bg-gradient-to-r from-indigo-400 to-purple-600',
      gradientLight: 'bg-gradient-to-r from-violet-100 to-purple-100',
      gradientDark: 'bg-gradient-to-r from-violet-800 to-purple-900',
      gradientSubtle: 'bg-gradient-to-r from-violet-50 to-purple-50',
      button: 'bg-violet-500 hover:bg-violet-600 text-white'
    },
    'CORAL': {
      primary: 'text-orange-500',
      bg: 'bg-orange-500/10 hover:bg-orange-500/20',
      border: 'border-orange-500/30 hover:border-orange-500',
      gradient: 'bg-gradient-to-r from-orange-500 to-red-500',
      gradientPrimary: 'bg-gradient-to-r from-orange-400 to-orange-600',
      gradientSecondary: 'bg-gradient-to-r from-red-400 to-red-600',
      gradientAccent: 'bg-gradient-to-r from-amber-400 to-red-600',
      gradientLight: 'bg-gradient-to-r from-orange-100 to-red-100',
      gradientDark: 'bg-gradient-to-r from-orange-800 to-red-900',
      gradientSubtle: 'bg-gradient-to-r from-orange-50 to-red-50',
      button: 'bg-orange-500 hover:bg-orange-600 text-white'
    },    'ROSE': {
      primary: 'text-rose-500',
      bg: 'bg-rose-500/10 hover:bg-rose-500/20',
      border: 'border-rose-500/30 hover:border-rose-500',
      gradient: 'bg-gradient-to-r from-rose-500 to-pink-600',
      gradientPrimary: 'bg-gradient-to-r from-rose-400 to-rose-600',
      gradientSecondary: 'bg-gradient-to-r from-pink-400 to-pink-600',
      gradientAccent: 'bg-gradient-to-r from-red-400 to-pink-600',
      gradientLight: 'bg-gradient-to-r from-rose-100 to-pink-100',
      gradientDark: 'bg-gradient-to-r from-rose-800 to-pink-900',
      gradientSubtle: 'bg-gradient-to-r from-rose-50 to-pink-50',
      button: 'bg-rose-500 hover:bg-rose-600 text-white'
    },
    'SLATE': {
      primary: 'text-slate-500',
      bg: 'bg-slate-500/10 hover:bg-slate-500/20',
      border: 'border-slate-500/30 hover:border-slate-500',
      gradient: 'bg-gradient-to-r from-slate-500 to-gray-600',
      gradientPrimary: 'bg-gradient-to-r from-slate-400 to-slate-600',
      gradientSecondary: 'bg-gradient-to-r from-gray-400 to-gray-600',
      gradientAccent: 'bg-gradient-to-r from-zinc-400 to-slate-600',
      gradientLight: 'bg-gradient-to-r from-slate-100 to-gray-100',
      gradientDark: 'bg-gradient-to-r from-slate-800 to-gray-900',
      gradientSubtle: 'bg-gradient-to-r from-slate-50 to-gray-50',
      button: 'bg-slate-500 hover:bg-slate-600 text-white'
    }
  };
    return colorMap[themeColor.name]?.[variant] || colorMap['OCEAN'][variant];
};

/**
 * Get theme gradient classes dynamically
 * @param {Object} themeColor - Theme color object
 * @param {string} gradientType - Type of gradient (primary, secondary, accent, light, dark, subtle)
 * @param {string} direction - Gradient direction (to-r, to-br, to-b, etc.)
 * @returns {string} Tailwind gradient classes
 */
export const getThemeGradient = (themeColor, gradientType = 'primary', direction = 'to-r') => {
  const gradientClasses = {
    'OCEAN': {
      primary: `bg-gradient-${direction} from-sky-400 to-sky-600`,
      secondary: `bg-gradient-${direction} from-blue-400 to-blue-600`,
      accent: `bg-gradient-${direction} from-cyan-400 to-blue-600`,
      light: `bg-gradient-${direction} from-sky-100 to-blue-100`,
      dark: `bg-gradient-${direction} from-sky-800 to-blue-900`,
      subtle: `bg-gradient-${direction} from-sky-50 to-blue-50`
    },
    'EMERALD': {
      primary: `bg-gradient-${direction} from-emerald-400 to-emerald-600`,
      secondary: `bg-gradient-${direction} from-teal-400 to-teal-600`,
      accent: `bg-gradient-${direction} from-green-400 to-teal-600`,
      light: `bg-gradient-${direction} from-emerald-100 to-teal-100`,
      dark: `bg-gradient-${direction} from-emerald-800 to-teal-900`,
      subtle: `bg-gradient-${direction} from-emerald-50 to-teal-50`
    },
    'AMETHYST': {
      primary: `bg-gradient-${direction} from-violet-400 to-violet-600`,
      secondary: `bg-gradient-${direction} from-purple-400 to-purple-600`,
      accent: `bg-gradient-${direction} from-indigo-400 to-purple-600`,
      light: `bg-gradient-${direction} from-violet-100 to-purple-100`,
      dark: `bg-gradient-${direction} from-violet-800 to-purple-900`,
      subtle: `bg-gradient-${direction} from-violet-50 to-purple-50`
    },
    'CORAL': {
      primary: `bg-gradient-${direction} from-orange-400 to-orange-600`,
      secondary: `bg-gradient-${direction} from-red-400 to-red-600`,
      accent: `bg-gradient-${direction} from-amber-400 to-red-600`,
      light: `bg-gradient-${direction} from-orange-100 to-red-100`,
      dark: `bg-gradient-${direction} from-orange-800 to-red-900`,
      subtle: `bg-gradient-${direction} from-orange-50 to-red-50`
    },
    'ROSE': {
      primary: `bg-gradient-${direction} from-rose-400 to-rose-600`,
      secondary: `bg-gradient-${direction} from-pink-400 to-pink-600`,
      accent: `bg-gradient-${direction} from-red-400 to-pink-600`,
      light: `bg-gradient-${direction} from-rose-100 to-pink-100`,
      dark: `bg-gradient-${direction} from-rose-800 to-pink-900`,
      subtle: `bg-gradient-${direction} from-rose-50 to-pink-50`
    },
    'SLATE': {
      primary: `bg-gradient-${direction} from-slate-400 to-slate-600`,
      secondary: `bg-gradient-${direction} from-gray-400 to-gray-600`,
      accent: `bg-gradient-${direction} from-zinc-400 to-slate-600`,
      light: `bg-gradient-${direction} from-slate-100 to-gray-100`,
      dark: `bg-gradient-${direction} from-slate-800 to-gray-900`,
      subtle: `bg-gradient-${direction} from-slate-50 to-gray-50`
    }
  };

  return gradientClasses[themeColor.name]?.[gradientType] || gradientClasses['OCEAN'][gradientType];
};

export default {
  THEME_COLORS,
  getThemeColor,
  hexToRgb,
  generateThemeProperties,
  applyThemeToRoot,
  getThemeClasses,
  getThemeGradient
};
