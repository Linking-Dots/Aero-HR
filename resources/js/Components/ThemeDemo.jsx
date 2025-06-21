import React from 'react';
import { Box, Typography, Card, CardContent, Button, Chip } from '@mui/material';
import { Card as HeroCard, CardBody, Button as HeroButton } from '@heroui/react';
import { 
  Palette as PaletteIcon,
  AutoAwesome as AutoAwesomeIcon,
  Brush as BrushIcon,
  Colorize as ColorizeIcon
} from '@mui/icons-material';

const ThemeDemo = ({ currentTheme, darkMode }) => {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        textAlign: 'center',
        fontWeight: 700,
        background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}>
        <AutoAwesomeIcon sx={{ color: 'var(--theme-primary)' }} />
        Theme System Demo
      </Typography>

      {/* Theme Information */}
      <HeroCard className="mb-6 bg-white/5 backdrop-blur-md border border-white/10">
        <CardBody className="p-6">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <PaletteIcon sx={{ color: 'var(--theme-primary)' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Current Theme Settings
            </Typography>
          </Box>
          
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Theme Color
              </Typography>
              <Chip 
                label={currentTheme?.name || 'OCEAN'}
                sx={{ 
                  backgroundColor: 'var(--theme-primary)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Mode
              </Typography>
              <Chip 
                label={darkMode ? 'Dark Mode' : 'Light Mode'}
                sx={{ 
                  backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
                  color: darkMode ? 'white' : 'black',
                  fontWeight: 600
                }}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Primary Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1,
                  backgroundColor: 'var(--theme-primary)',
                  border: '2px solid rgba(255,255,255,0.2)'
                }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {currentTheme?.primary || '#0ea5e9'}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Secondary Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1,
                  backgroundColor: 'var(--theme-secondary)',
                  border: '2px solid rgba(255,255,255,0.2)'
                }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {currentTheme?.secondary || '#0284c7'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardBody>
      </HeroCard>

      {/* Component Examples */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BrushIcon sx={{ color: 'var(--theme-primary)' }} />
        Component Examples
      </Typography>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Material-UI Components */}
        <Card sx={{ 
          background: 'rgba(var(--theme-primary-rgb), 0.05)',
          border: '1px solid rgba(var(--theme-primary-rgb), 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-primary)' }}>
              Material-UI Components
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                sx={{ 
                  backgroundColor: 'var(--theme-primary)',
                  '&:hover': { backgroundColor: 'var(--theme-secondary)' }
                }}
              >
                Primary Button
              </Button>
              <Button 
                variant="outlined" 
                sx={{ 
                  borderColor: 'var(--theme-primary)',
                  color: 'var(--theme-primary)',
                  '&:hover': { 
                    borderColor: 'var(--theme-secondary)',
                    backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)'
                  }
                }}
              >
                Outlined Button
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                These components automatically adapt to the selected theme colors with smooth transitions.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* HeroUI Components */}
        <HeroCard className="theme-aware-card">
          <CardBody>
            <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-primary)' }}>
              HeroUI Components
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <HeroButton 
                className="theme-aware-button"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: 'white'
                }}
              >
                Hero Primary Button
              </HeroButton>
              <HeroButton 
                variant="bordered"
                className="theme-aware-button"
                style={{
                  borderColor: 'var(--theme-primary)',
                  color: 'var(--theme-primary)'
                }}
              >
                Hero Bordered Button
              </HeroButton>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                HeroUI components also respect the theme system with custom CSS properties.
              </Typography>
            </Box>
          </CardBody>
        </HeroCard>

        {/* Color Palette */}
        <HeroCard className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardBody>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ColorizeIcon sx={{ color: 'var(--theme-primary)' }} />
              Color Palette
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: '100%',
                  height: 60,
                  borderRadius: 2,
                  backgroundColor: 'var(--theme-primary)',
                  mb: 1
                }} />
                <Typography variant="caption">Primary</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: '100%',
                  height: 60,
                  borderRadius: 2,
                  backgroundColor: 'var(--theme-secondary)',
                  mb: 1
                }} />
                <Typography variant="caption">Secondary</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: '100%',
                  height: 60,
                  borderRadius: 2,
                  backgroundColor: 'rgba(var(--theme-primary-rgb), 0.3)',
                  mb: 1
                }} />
                <Typography variant="caption">Primary 30%</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: '100%',
                  height: 60,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))',
                  mb: 1
                }} />
                <Typography variant="caption">Gradient</Typography>
              </Box>
            </Box>
          </CardBody>
        </HeroCard>

        {/* Typography Examples */}
        <HeroCard className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardBody>
            <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-primary)' }}>
              Typography Styles
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="h4" sx={{ color: 'var(--theme-primary)' }}>
                Heading 4
              </Typography>
              <Typography variant="h6" sx={{ color: 'var(--theme-secondary)' }}>
                Heading 6
              </Typography>
              <Typography variant="body1">
                Body text adapts to the current font family selection and theme colors.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Caption text with theme-aware secondary color.
              </Typography>
            </Box>
          </CardBody>
        </HeroCard>
      </Box>

      {/* Instructions */}
      <Box sx={{ mt: 4, p: 3, borderRadius: 2, backgroundColor: 'rgba(var(--theme-primary-rgb), 0.05)', border: '1px solid rgba(var(--theme-primary-rgb), 0.1)' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-primary)' }}>
          How to Use the Theme System
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          The AeroHR theme system provides a comprehensive, smooth, and professional theming experience:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Theme Colors:</strong> Choose from 6 professionally curated color palettes
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Dark/Light Mode:</strong> Toggle between modes with smooth transitions
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Background Patterns:</strong> Select from 9 different background styles
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Typography:</strong> Choose from 4 different font families
          </Typography>
          <Typography component="li" variant="body2">
            <strong>Auto-Save:</strong> All preferences are automatically saved and restored
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ThemeDemo;
