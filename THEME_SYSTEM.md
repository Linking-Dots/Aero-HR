# AeroHR Theme System

A comprehensive, modern theming system for the AeroHR application that provides smooth transitions, multiple customization options, and a professional user experience.

## Features

### 🎨 Color Themes
- **6 Professional Color Palettes**: Ocean, Emerald, Amethyst, Coral, Rose, and Slate
- **Dynamic Color System**: Uses CSS custom properties for real-time theme switching
- **Smart Color Generation**: Automatic RGB conversion and opacity variants

### 🌙 Dark/Light Mode
- **Smooth Transitions**: Eased transitions between modes (0.4s cubic-bezier)
- **Persistent Preferences**: Auto-saves user selection to localStorage
- **Theme-Aware Components**: All components respect the current mode

### 🖼️ Background Patterns
- **9 Background Options**: 
  - Solid Color
  - Gradient
  - Abstract Pattern
  - Dots Pattern
  - Geometric Gradient
  - Radial Circles
  - Subtle Pattern
  - Mesh Grid
  - Flowing Waves
- **Real-time Preview**: Visual previews in the theme drawer
- **CSS Custom Properties**: Easy switching via data attributes

### 🔤 Typography System
- **4 Font Family Options**:
  - **Inter**: Modern sans-serif (Default)
  - **Fredoka**: Friendly rounded font
  - **JetBrains Mono**: Developer monospace
  - **Playfair Display**: Elegant serif font
- **Font Previews**: Live preview in selection interface
- **Fallback Support**: Comprehensive fallback fonts for each option

## Architecture

### Core Components

#### 1. ThemeSettingDrawer (`/Components/ThemeSettingDrawer.jsx`)
The main interface for theme customization:
- **Modern Glassmorphic UI**: Professional appearance with backdrop blur
- **Real-time Updates**: Instant preview of changes
- **Organized Sections**: Color, Mode, Background, and Typography
- **Auto-save**: Preferences saved to localStorage

#### 2. Theme Utilities (`/utils/themeUtils.js`)
Centralized theme management:
```javascript
// Available theme colors
export const THEME_COLORS = [
  { name: "OCEAN", primary: "#0ea5e9", secondary: "#0284c7" },
  // ... more themes
];

// Apply theme to document root
export const applyThemeToRoot = (themeColor, darkMode) => {
  // Implementation
};
```

#### 3. Material-UI Theme Integration (`/theme.jsx`)
Seamless Material-UI integration with error handling and safe fallbacks.

#### 4. CSS Custom Properties (`app.blade.php`)
Global CSS variables that enable smooth transitions:
```css
:root {
  --theme-primary: #0ea5e9;
  --theme-secondary: #0284c7;
  --theme-primary-rgb: 14, 165, 233;
  --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Implementation Guide

### 1. Setting Up Theme Context

```jsx
// In your main layout component
const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);
const [darkMode, setDarkMode] = useState(false);

// Apply theme on mount and changes
useEffect(() => {
  applyThemeToRoot(themeColor, darkMode);
}, [themeColor, darkMode]);
```

### 2. Using Theme Colors in Components

#### CSS Custom Properties (Recommended)
```css
.my-component {
  background-color: rgba(var(--theme-primary-rgb), 0.1);
  border: 1px solid var(--theme-primary);
  color: var(--theme-primary);
  transition: var(--transition);
}
```

#### JavaScript/React
```jsx
const MyComponent = () => (
  <div style={{
    backgroundColor: `rgba(var(--theme-primary-rgb), 0.1)`,
    borderColor: 'var(--theme-primary)',
    transition: 'var(--transition)'
  }}>
    Content
  </div>
);
```

### 3. Material-UI Integration

```jsx
import { useTheme } from '@mui/material/styles';

const MyMuiComponent = () => {
  const theme = useTheme();
  
  return (
    <Button
      sx={{
        backgroundColor: 'var(--theme-primary)',
        '&:hover': {
          backgroundColor: 'var(--theme-secondary)',
        }
      }}
    >
      Theme-aware Button
    </Button>
  );
};
```

### 4. Background Pattern Usage

Set via data attributes:
```javascript
// Apply background pattern
document.documentElement.setAttribute('data-background', 'gradient');
```

Available patterns:
- `solid` - Clean solid background
- `gradient` - Subtle themed gradient
- `pattern-1` - Modern abstract pattern
- `pattern-2` - Minimal dot pattern
- `pattern-3` - Geometric gradient
- `pattern-4` - Radial gradient circles
- `pattern-5` - Very subtle pattern
- `mesh` - Clean mesh pattern
- `waves` - Flowing wave pattern

### 5. Font Family Selection

```javascript
// Apply font family
const fontOptions = {
  primary: 'var(--font-primary)',
  secondary: 'var(--font-secondary)',
  mono: 'var(--font-mono)',
  serif: 'var(--font-serif)'
};

document.documentElement.style.setProperty('--font-current', fontOptions.primary);
```

## Best Practices

### 1. Performance
- Use CSS custom properties instead of JavaScript for color values
- Leverage the centralized `themeUtils.js` for consistency
- Enable smooth transitions globally via the transition custom property

### 2. Accessibility
- All themes meet WCAG contrast requirements
- Dark mode provides better accessibility in low-light conditions
- Font options include both decorative and highly readable choices

### 3. Consistency
- Use the theme system throughout the application
- Apply the `var(--transition)` to all theme-aware elements
- Follow the established naming conventions for custom properties

### 4. Error Handling
- All theme utilities include safe fallbacks
- Invalid theme data is caught and handled gracefully
- Console warnings for debugging without breaking functionality

## Customization

### Adding New Theme Colors

1. Add to `THEME_COLORS` in `themeUtils.js`:
```javascript
{
  name: "CUSTOM",
  primary: "#your-primary",
  secondary: "#your-secondary",
  gradient: "from-your-500 to-your-600",
  description: "Your Custom Theme",
  tailwind: {
    primary: "your-500",
    secondary: "your-600",
    bg: "bg-your-500/10",
    text: "text-your-600",
    border: "border-your-500/30"
  }
}
```

2. Update Tailwind classes in `getThemeClasses` function.

### Adding New Background Patterns

1. Define CSS custom property in `app.blade.php`:
```css
--bg-pattern-new: url("your-svg-data-uri");
```

2. Add background style:
```css
[data-background="new-pattern"] body {
  background-image: var(--bg-pattern-new);
}
```

3. Add to `backgroundOptions` in `ThemeSettingDrawer.jsx`.

### Adding New Fonts

1. Load font in `app.blade.php`:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;600&display=swap" rel="stylesheet">
```

2. Define CSS custom property:
```css
--font-new: 'YourFont', 'Fallback', sans-serif;
```

3. Add to `fontOptions` in `ThemeSettingDrawer.jsx`.

## Troubleshooting

### Theme Not Applying
- Check browser console for errors
- Verify CSS custom properties are loaded
- Ensure `applyThemeToRoot` is called on theme changes

### Transitions Not Smooth
- Verify `--transition` custom property is applied
- Check for conflicting CSS transitions
- Ensure elements have the transition property

### localStorage Issues
- Check browser localStorage quota
- Verify JSON serialization/deserialization
- Handle localStorage access errors gracefully

## Browser Support

- **Modern Browsers**: Full support with all features
- **Legacy Browsers**: Graceful degradation to default theme
- **CSS Custom Properties**: Required for theme switching
- **localStorage**: Required for preference persistence

## Migration Guide

### From Previous Theme System

1. Replace hardcoded colors with CSS custom properties
2. Update component styles to use `var(--theme-primary)` format
3. Add transition properties for smooth theme switching
4. Integrate with the centralized theme utilities

### Example Migration

**Before:**
```css
.button {
  background-color: #0ea5e9;
  color: white;
}
```

**After:**
```css
.button {
  background-color: var(--theme-primary);
  color: white;
  transition: var(--transition);
}
```

## Contributing

When contributing to the theme system:

1. **Test all theme combinations** - Ensure your changes work with all color themes and modes
2. **Follow naming conventions** - Use consistent naming for CSS custom properties
3. **Add error handling** - Include safe fallbacks and error catching
4. **Update documentation** - Document new features and usage patterns
5. **Test accessibility** - Verify contrast ratios and keyboard navigation

---

**Built with ❤️ for AeroHR** - A modern, accessible, and professional theming system.
