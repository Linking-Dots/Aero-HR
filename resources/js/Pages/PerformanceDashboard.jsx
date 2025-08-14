import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { 
  CircularProgress,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  useTheme,
  useMediaQuery,
  Grow,
  Fade
} from '@mui/material';
import { 
  Card, 
  CardBody, 
  CardHeader
} from "@heroui/react";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { 
  ChartBarIcon, 
  CpuChipIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon as HeroCheckCircleIcon
} from '@heroicons/react/24/outline';

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
      if (score >= 90) return '#10b981'; // green-500
      if (score >= 70) return '#f59e0b'; // amber-500
      return '#ef4444'; // red-500
    };

    return (
      <div className="relative inline-flex">
        <CircularProgress
          variant="determinate"
          value={score}
          size={size}
          thickness={4}
          sx={{ color: getColor(score) }}
        />
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-3xl font-bold" style={{ color: getColor(score) }}>
            {score}
          </div>
          <div className="text-xs text-gray-400">
            /100
          </div>
        </div>
      </div>
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
            <div className="text-sm font-medium text-gray-400 mb-2">
              {metric.name}
            </div>
            <div className={`text-2xl font-bold mb-1 ${
              metric.value <= metric.threshold ? 'text-green-400' : 'text-red-400'
            }`}>
              {metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)}
              <span className="text-xs ml-1">{metric.unit}</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">
              {metric.label}
            </div>
            <Chip 
              size="small" 
              label={metric.value <= metric.threshold ? 'Good' : 'Needs Work'}
              color={metric.value <= metric.threshold ? 'success' : 'error'}
            />
          </div>
        ))}
      </div>
    );
  };

  // Feature Performance Component
  const FeaturePerformance = ({ features }) => {
    if (!features) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(features).map(([name, feature]) => (
          <div key={name} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-lg font-semibold text-white">{name}</div>
              <Chip 
                size="small"
                label={feature.priority}
                color={feature.priority === 'high' ? 'error' : feature.priority === 'medium' ? 'warning' : 'default'}
              />
            </div>
            <div className={`text-3xl font-bold mb-2 ${
              feature.averageLoadTime <= feature.target ? 'text-green-400' : 'text-orange-400'
            }`}>
              {Math.round(feature.averageLoadTime)}ms
            </div>
            <div className="text-sm text-gray-400 mb-3">
              Target: {feature.target}ms | Routes: {Object.keys(feature.routes).length}
            </div>
            <Chip 
              size="small"
              icon={feature.averageLoadTime <= feature.target ? <CheckCircleIcon /> : <WarningIcon />}
              label={feature.averageLoadTime <= feature.target ? 'Meeting Target' : 'Exceeds Target'}
              color={feature.averageLoadTime <= feature.target ? 'success' : 'warning'}
            />
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Head title={title} />
        <div className="min-h-screen flex items-center justify-center">
          <CircularProgress size={60} />
        </div>
      </>
    );
  }

  return (
    <>
      <Head title={title} />
      
      <div className="min-h-screen p-2 sm:p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Grow in timeout={800}>
            <div>
              <GlassCard>
                {/* Header Section with Gradient Background */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
                  <div className="relative px-6 py-8">
                    <div className="flex flex-col gap-6">
                      {/* Title and Description */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10">
                            <ChartBarIcon className="w-8 h-8 text-blue-400" />
                          </div>
                          <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                              🚀 Performance Monitor
                            </h1>
                            <p className="text-gray-400 mt-1 text-sm md:text-base">
                              Real-time performance monitoring and optimization insights
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          <Tooltip title="Refresh Data">
                            <IconButton 
                              onClick={fetchPerformanceData} 
                              disabled={refreshing}
                              className="text-blue-400 hover:bg-blue-500/10"
                            >
                              <ArrowPathIcon className="w-5 h-5" />
                            </IconButton>
                          </Tooltip>
                          <Button 
                            variant="outlined" 
                            startIcon={<TrendingUpIcon />}
                            onClick={handleGenerateReport}
                            size="small"
                            className="border-blue-400/50 text-blue-400 hover:bg-blue-500/10"
                          >
                            Generate Report
                          </Button>
                          <Button 
                            variant="outlined" 
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadReport}
                            size="small"
                            className="border-purple-400/50 text-purple-400 hover:bg-purple-500/10"
                          >
                            Export
                          </Button>
                        </div>
                      </div>

                      {/* Statistics Cards */}
                      <Fade in timeout={1000}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                <SpeedIcon className="w-5 h-5 text-blue-400" />
                              </div>
                              <div>
                                <div className="text-xl font-bold text-blue-400">
                                  {performanceData?.baseline?.overall?.performanceScore || 0}
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">
                                  Performance Score
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              </div>
                              <div>
                                <div className="text-xl font-bold text-green-400">
                                  {performanceData?.baseline?.overall?.totalIssues || 0}
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">
                                  Issues Detected
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                <CpuChipIcon className="w-5 h-5 text-purple-400" />
                              </div>
                              <div>
                                <div className="text-xl font-bold text-purple-400">
                                  {performanceData?.comparison?.summary?.regressions?.length || 0}
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">
                                  Regressions
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                                <DocumentArrowDownIcon className="w-5 h-5 text-orange-400" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-orange-400">
                                  {performanceData?.lastUpdated?.toLocaleTimeString() || 'Never'}
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">
                                  Last Updated
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Fade>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="px-6 pb-6">
                  {/* Alerts */}
                  {alerts.map((alert, index) => (
                    <Alert severity={alert.type} className="mb-4" key={index}>
                      {alert.message}
                    </Alert>
                  ))}

                  {/* Performance Overview */}
                  <Fade in timeout={1200}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                      <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                          <div className="text-lg font-semibold text-white mb-4">
                            Overall Performance
                          </div>
                          <PerformanceScore 
                            score={performanceData?.baseline?.overall?.performanceScore || 0} 
                          />
                          <div className="text-xs text-gray-400 mt-4">
                            Last Updated: {performanceData?.lastUpdated?.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                          <div className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            📊 Core Web Vitals
                          </div>
                          <CoreWebVitals vitals={performanceData?.baseline?.overall?.coreWebVitals} />
                        </div>
                      </div>
                    </div>
                  </Fade>

                  {/* Feature Performance */}
                  <Fade in timeout={1400}>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
                      <div className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        📦 Feature Module Performance
                      </div>
                      <FeaturePerformance features={performanceData?.baseline?.features} />
                    </div>
                  </Fade>

                  {/* Quick Actions */}
                  <Fade in timeout={1600}>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                      <div className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        🔧 Quick Actions
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button 
                          fullWidth 
                          variant="outlined" 
                          startIcon={<SpeedIcon />}
                          onClick={() => window.open('/storage/app/reports/performance-dashboard.html', '_blank')}
                          className="border-blue-400/50 text-blue-400 hover:bg-blue-500/10"
                        >
                          View Full Dashboard
                        </Button>
                        <Button 
                          fullWidth 
                          variant="outlined"
                          onClick={() => window.open('/storage/app/reports/technical-report.md', '_blank')}
                          className="border-green-400/50 text-green-400 hover:bg-green-500/10"
                        >
                          Technical Report
                        </Button>
                        <Button 
                          fullWidth 
                          variant="outlined"
                          onClick={() => window.open('/storage/app/reports/executive-summary.md', '_blank')}
                          className="border-purple-400/50 text-purple-400 hover:bg-purple-500/10"
                        >
                          Executive Summary
                        </Button>
                        <Button 
                          fullWidth 
                          variant="outlined"
                          onClick={handleDownloadReport}
                          className="border-orange-400/50 text-orange-400 hover:bg-orange-500/10"
                        >
                          Download Data
                        </Button>
                      </div>
                    </div>
                  </Fade>
                </div>
              </GlassCard>
            </div>
          </Grow>
        </div>
      </div>
    </>
  );
};

PerformanceDashboardPage.layout = (page) => <App>{page}</App>;

export default PerformanceDashboardPage;
