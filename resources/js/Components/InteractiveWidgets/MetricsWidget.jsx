
import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { TrendingUpIcon, TrendingDownIcon, MoreVertIcon } from '@heroicons/react/24/outline';
import GlassCard from '../GlassCard.jsx';
import { useTheme } from '@mui/material/styles';

const MetricsWidget = ({ 
  title, 
  value, 
  previousValue, 
  unit = '', 
  icon: IconComponent,
  color = '#0ea5e9',
  interactive = true,
  sparklineData = [],
  onClick
}) => {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setDarkMode(localStorage.getItem('darkMode') === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const calculateTrend = () => {
    if (!previousValue || previousValue === 0) return { trend: 0, isPositive: true };
    const trend = ((value - previousValue) / previousValue) * 100;
    return { trend: Math.abs(trend), isPositive: trend >= 0 };
  };

  const { trend, isPositive } = calculateTrend();

  const renderSparkline = () => {
    if (!sparklineData.length) return null;

    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    const points = sparklineData.map((val, index) => {
      const x = (index / (sparklineData.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 30" className="w-full h-8 mt-2 opacity-60">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="drop-shadow-sm"
        />
      </svg>
    );
  };

  return (
    <GlassCard
      variant="elevated"
      hover={interactive}
      className={`cursor-pointer transition-all duration-300 ${interactive ? 'hover:scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <Box sx={{ p: 3, position: 'relative' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                border: `1px solid ${color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComponent 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: color,
                }} 
              />
            </Box>
            <Typography variant="subtitle2" sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {title}
            </Typography>
          </Box>
          {interactive && (
            <IconButton size="small" sx={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
              <MoreVertIcon style={{ width: '16px', height: '16px' }} />
            </IconButton>
          )}
        </Box>

        {/* Main Value */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2.25rem' },
              lineHeight: 1,
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
            <span style={{ fontSize: '0.6em', marginLeft: '0.25rem' }}>{unit}</span>
          </Typography>
        </Box>

        {/* Trend Indicator */}
        {previousValue && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {isPositive ? (
              <TrendingUpIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
            ) : (
              <TrendingDownIcon style={{ width: '16px', height: '16px', color: '#ef4444' }} />
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                color: isPositive ? '#10b981' : '#ef4444',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              {trend.toFixed(1)}% {isPositive ? 'increase' : 'decrease'}
            </Typography>
          </Box>
        )}

        {/* Sparkline */}
        {renderSparkline()}

        {/* Interactive Glow Effect */}
        {interactive && isHovered && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)`,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              transition: 'opacity 0.3s ease',
            }}
          />
        )}
      </Box>
    </GlassCard>
  );
};

export default MetricsWidget;
