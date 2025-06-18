import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";

/**
 * Performance Dashboard Page - Glass ERP Phase 5
 * 
 * Real-time performance monitoring dashboard integrated into Laravel application.
 * Displays Core Web Vitals, feature performance, and system metrics.
 */
const PerformanceDashboardPage = ({ auth, title = "Performance Dashboard" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch performance data
  const fetchPerformanceData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch baseline data
      const baselineResponse = await fetch('/storage/app/performance/baseline.json');
      let baseline = null;
      if (baselineResponse.ok) {
        baseline = await baselineResponse.json();
      }

      // Fetch comparison data
      const comparisonResponse = await fetch('/storage/app/performance/comparison.json');
      let comparison = null;
      if (comparisonResponse.ok) {
        comparison = await comparisonResponse.json();
      }

      // Fetch reports data
      const reportResponse = await fetch('/storage/app/reports/performance-export.json');
      let report = null;
      if (reportResponse.ok) {
        report = await reportResponse.json();
      }

      setPerformanceData({
        baseline,
        comparison,
        report,
        lastUpdated: new Date()
      });

      // Generate alerts based on performance data
      const newAlerts = [];
      if (baseline) {
        if (baseline.overall.performanceScore < 70) {
          newAlerts.push({
            type: 'error',
            message: `Performance score is below threshold: ${baseline.overall.performanceScore}/100`
          });
        }
        
        if (baseline.overall.totalIssues > 0) {
          newAlerts.push({
            type: 'warning',
            message: `${baseline.overall.totalIssues} performance issues detected`
          });
        }
      }

      if (comparison && comparison.summary.regressions.length > 0) {
        newAlerts.push({
          type: 'error',
          message: `${comparison.summary.regressions.length} performance regressions detected`
        });
      }

      setAlerts(newAlerts);
      
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setAlerts([{
        type: 'error',
        message: 'Failed to load performance data. Please check if performance monitoring is running.'
      }]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPerformanceData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPerformanceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate reports
  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/performance/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });
      
      if (response.ok) {
        await fetchPerformanceData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  // Download report
  const handleDownloadReport = () => {
    const link = document.createElement('a');
    link.href = '/storage/app/reports/performance-export.json';
    link.download = `glass-erp-performance-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Performance Score Component
  const PerformanceScore = ({ score, size = 120 }) => {
    const getColor = (score) => {
      if (score >= 90) return theme.palette.success.main;
      if (score >= 70) return theme.palette.warning.main;
      return theme.palette.error.main;
    };

    return (
      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          value={score}
          size={size}
          thickness={4}
          sx={{ color: getColor(score) }}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          right={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Typography variant="h4" component="div" color={getColor(score)} fontWeight="bold">
            {score}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            /100
          </Typography>
        </Box>
      </Box>
    );
  };
  // Core Web Vitals Component
  const CoreWebVitals = ({ vitals }) => {
    if (!vitals) return null;

    const metrics = [
      { name: 'FCP', value: vitals.FCP, unit: 'ms', threshold: 1800, label: 'First Contentful Paint' },
      { name: 'LCP', value: vitals.LCP, unit: 'ms', threshold: 2500, label: 'Largest Contentful Paint' },
      { name: 'FID', value: vitals.FID, unit: 'ms', threshold: 100, label: 'First Input Delay' },
      { name: 'INP', value: vitals.INP || 0, unit: 'ms', threshold: 200, label: 'Interaction to Next Paint' },
      { name: 'CLS', value: vitals.CLS, unit: '', threshold: 0.1, label: 'Cumulative Layout Shift' },
      { name: 'TTFB', value: vitals.TTFB, unit: 'ms', threshold: 800, label: 'Time to First Byte' }
    ];

    return (
      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={2} key={metric.name}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {metric.name}
                </Typography>
                <Typography variant="h4" component="div" sx={{ 
                  color: metric.value <= metric.threshold ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  {metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)}
                  <Typography variant="caption" component="span" sx={{ ml: 0.5 }}>
                    {metric.unit}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {metric.label}
                </Typography>
                <br />
                <Chip 
                  size="small" 
                  label={metric.value <= metric.threshold ? 'Good' : 'Needs Work'}
                  color={metric.value <= metric.threshold ? 'success' : 'error'}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Feature Performance Component
  const FeaturePerformance = ({ features }) => {
    if (!features) return null;

    return (
      <Grid container spacing={2}>
        {Object.entries(features).map(([name, feature]) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{name}</Typography>
                  <Chip 
                    size="small"
                    label={feature.priority}
                    color={feature.priority === 'high' ? 'error' : feature.priority === 'medium' ? 'warning' : 'default'}
                  />
                </Box>
                <Typography variant="h4" sx={{ 
                  color: feature.averageLoadTime <= feature.target ? 'success.main' : 'warning.main',
                  fontWeight: 'bold'
                }}>
                  {Math.round(feature.averageLoadTime)}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Target: {feature.target}ms | Routes: {Object.keys(feature.routes).length}
                </Typography>
                <Box mt={1}>
                  <Chip 
                    size="small"
                    icon={feature.averageLoadTime <= feature.target ? <CheckCircleIcon /> : <WarningIcon />}
                    label={feature.averageLoadTime <= feature.target ? 'Meeting Target' : 'Exceeds Target'}
                    color={feature.averageLoadTime <= feature.target ? 'success' : 'warning'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading) {
    return (
      <App title={title} auth={auth}>
        <Head title={title} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </App>
    );
  }

  return (
    <App title={title} auth={auth}>
      <Head title={title} />
      
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              🚀 Performance Monitor
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time performance monitoring and optimization insights
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={fetchPerformanceData} 
                disabled={refreshing}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Generate Report">
              <Button 
                variant="outlined" 
                startIcon={<TrendingUpIcon />}
                onClick={handleGenerateReport}
                size="small"
              >
                Generate Report
              </Button>
            </Tooltip>
            <Tooltip title="Download Data">
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={handleDownloadReport}
                size="small"
              >
                Export
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Alerts */}
        {alerts.map((alert, index) => (
          <Alert severity={alert.type} sx={{ mb: 2 }} key={index}>
            {alert.message}
          </Alert>
        ))}

        {/* Performance Overview */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <GlassCard>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Overall Performance
                </Typography>
                <PerformanceScore 
                  score={performanceData?.baseline?.overall?.performanceScore || 0} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Last Updated: {performanceData?.lastUpdated?.toLocaleTimeString()}
                </Typography>
              </CardContent>
            </GlassCard>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <GlassCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Core Web Vitals
                </Typography>
                <CoreWebVitals vitals={performanceData?.baseline?.overall?.coreWebVitals} />
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>

        {/* Feature Performance */}
        <GlassCard sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📦 Feature Module Performance
            </Typography>
            <FeaturePerformance features={performanceData?.baseline?.features} />
          </CardContent>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔧 Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<SpeedIcon />}
                  onClick={() => window.open('/storage/app/reports/performance-dashboard.html', '_blank')}
                >
                  View Full Dashboard
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth 
                  variant="outlined"
                  onClick={() => window.open('/storage/app/reports/technical-report.md', '_blank')}
                >
                  Technical Report
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth 
                  variant="outlined"
                  onClick={() => window.open('/storage/app/reports/executive-summary.md', '_blank')}
                >
                  Executive Summary
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  fullWidth 
                  variant="outlined"
                  onClick={handleDownloadReport}
                >
                  Download Data
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </GlassCard>
      </Box>
    </App>
  );
};

PerformanceDashboardPage.layout = (page) => <App>{page}</App>;

export default PerformanceDashboardPage;
