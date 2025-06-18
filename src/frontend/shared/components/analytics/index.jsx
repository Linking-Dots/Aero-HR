/**
 * Analytics Components - Shared Components
 * 
 * @file index.jsx
 * @description Shared analytics and statistics components for the application
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @components
 * - StatsCard: Individual statistic card component
 * - ChartCard: Chart container component
 * - MetricsCard: Metrics display component
 * 
 * @design
 * - Consistent styling across analytics components
 * - Glass morphism design pattern
 * - Responsive and accessible
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';

/**
 * StatsCard Component
 * 
 * @description Individual statistic card with value, label, and trend indicator
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main statistic value
 * @param {string} props.subtitle - Additional description
 * @param {Object} props.icon - Icon component
 * @param {string} props.trend - Trend direction ('up', 'down', 'flat')
 * @param {number} props.trendValue - Trend percentage value
 * @param {string} props.color - Theme color ('primary', 'secondary', 'success', 'warning', 'error')
 * @param {Object} props.sx - Additional styling
 */
const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend = 'flat',
  trendValue = 0,
  color = 'primary',
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" fontSize="small" />;
      case 'down':
        return <TrendingDown color="error" fontSize="small" />;
      default:
        return <TrendingFlat color="disabled" fontSize="small" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      default:
        return theme.palette.text.disabled;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette[color].main, 0.3)}`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.4)}`,
        },
        ...sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                color: theme.palette.text.primary,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette[color].main, 0.1),
                color: theme.palette[color].main,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: theme.palette.text.primary,
          }}
        >
          {value}
        </Typography>

        {trendValue !== 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {getTrendIcon(trend)}
            <Typography
              variant="body2"
              sx={{
                color: getTrendColor(trend),
                fontWeight: 500,
              }}
            >
              {trendValue > 0 ? '+' : ''}{trendValue}%
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * ChartCard Component
 * 
 * @description Container for charts with title and optional actions
 * @param {Object} props - Component props
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {React.ReactNode} props.children - Chart component
 * @param {React.ReactNode} props.actions - Optional action buttons
 * @param {string} props.color - Theme color
 * @param {Object} props.sx - Additional styling
 */
const ChartCard = ({
  title,
  subtitle,
  children,
  actions,
  color = 'primary',
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        ...sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                color: theme.palette.text.primary,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {actions}
            </Box>
          )}
        </Box>

        <Box sx={{ width: '100%', height: '100%' }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * MetricsCard Component
 * 
 * @description Display multiple metrics in a single card
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {Array} props.metrics - Array of metric objects
 * @param {string} props.color - Theme color
 * @param {Object} props.sx - Additional styling
 */
const MetricsCard = ({
  title,
  metrics = [],
  color = 'primary',
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        borderRadius: 2,
        ...sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: theme.palette.text.primary,
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {metrics.map((metric, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1,
                borderBottom: index < metrics.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {metric.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  {metric.value}
                </Typography>
                {metric.status && (
                  <Chip
                    label={metric.status}
                    size="small"
                    color={metric.statusColor || 'default'}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export { StatsCard, ChartCard, MetricsCard };
export default { StatsCard, ChartCard, MetricsCard };
