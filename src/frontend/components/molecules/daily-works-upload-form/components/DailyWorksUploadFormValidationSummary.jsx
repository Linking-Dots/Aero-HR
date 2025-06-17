import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Badge,
  Button,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  Database,
  Settings,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';

/**
 * Validation summary component for daily works upload form
 * 
 * Features:
 * - Comprehensive validation error display
 * - File-specific error reporting
 * - Data validation results
 * - Performance metrics
 * - Actionable suggestions
 * - Export validation report
 */
export const DailyWorksUploadFormValidationSummary = ({
  // Validation state
  errors = {},
  fileErrors = {},
  dataErrors = {},
  validationState = {},
  
  // Files and data
  uploadedFiles = [],
  parsedData = [],
  
  // Analytics
  analytics = {},
  
  // Actions
  onValidateField,
  onValidateForm,
  onClearErrors,
  onExportReport,
  
  // Configuration
  showPerformanceMetrics = true,
  showSuggestions = true,
  className = ''
}) => {
  // Categorize validation errors
  const errorCategories = useMemo(() => {
    const categories = {
      critical: [],
      warning: [],
      info: [],
      performance: []
    };

    // Form-level errors
    Object.entries(errors).forEach(([field, message]) => {
      const severity = getCriticalityLevel(field, message);
      categories[severity].push({
        type: 'form',
        field,
        message,
        source: 'Form Validation'
      });
    });

    // File-level errors
    Object.entries(fileErrors).forEach(([fileIndex, fileErrs]) => {
      const fileName = uploadedFiles[fileIndex]?.name || `File ${fileIndex}`;
      Object.entries(fileErrs).forEach(([field, message]) => {
        const severity = getCriticalityLevel(field, message);
        categories[severity].push({
          type: 'file',
          fileIndex: parseInt(fileIndex),
          fileName,
          field,
          message,
          source: 'File Validation'
        });
      });
    });

    // Data-level errors
    Object.entries(dataErrors).forEach(([rowIndex, rowErrs]) => {
      Object.entries(rowErrs).forEach(([field, message]) => {
        const severity = getCriticalityLevel(field, message);
        categories[severity].push({
          type: 'data',
          rowIndex: parseInt(rowIndex),
          field,
          message,
          source: 'Data Validation'
        });
      });
    });

    return categories;
  }, [errors, fileErrors, dataErrors, uploadedFiles]);

  // Get criticality level for error
  const getCriticalityLevel = (field, message) => {
    const criticalFields = ['project', 'files', 'required'];
    const warningFields = ['size', 'format', 'duplicate'];
    const performanceFields = ['memory', 'timeout', 'processing'];

    const lowerMessage = message.toLowerCase();
    
    if (criticalFields.some(cf => field.includes(cf) || lowerMessage.includes(cf))) {
      return 'critical';
    }
    if (performanceFields.some(pf => lowerMessage.includes(pf))) {
      return 'performance';
    }
    if (warningFields.some(wf => lowerMessage.includes(wf))) {
      return 'warning';
    }
    
    return 'info';
  };

  // Calculate validation statistics
  const validationStats = useMemo(() => {
    const totalErrors = Object.keys(errors).length + 
                       Object.keys(fileErrors).length + 
                       Object.keys(dataErrors).length;
    
    const fileCount = uploadedFiles.length;
    const totalRows = parsedData.reduce((sum, data) => sum + (data?.length || 0), 0);
    const errorRows = Object.keys(dataErrors).length;
    const validRows = totalRows - errorRows;

    return {
      totalErrors,
      errorsByCategory: {
        critical: errorCategories.critical.length,
        warning: errorCategories.warning.length,
        info: errorCategories.info.length,
        performance: errorCategories.performance.length
      },
      files: {
        total: fileCount,
        withErrors: Object.keys(fileErrors).length,
        valid: fileCount - Object.keys(fileErrors).length
      },
      data: {
        totalRows,
        validRows,
        errorRows,
        validationRate: totalRows > 0 ? (validRows / totalRows) * 100 : 0
      }
    };
  }, [errors, fileErrors, dataErrors, errorCategories, uploadedFiles, parsedData]);

  // Generate suggestions
  const suggestions = useMemo(() => {
    const suggestions = [];

    if (validationStats.errorsByCategory.critical > 0) {
      suggestions.push({
        type: 'critical',
        title: 'Critical Errors Found',
        message: 'Address critical errors before proceeding with upload',
        action: 'Review required fields and fix validation errors'
      });
    }

    if (validationStats.files.withErrors > 0) {
      suggestions.push({
        type: 'warning',
        title: 'File Issues Detected',
        message: `${validationStats.files.withErrors} files have validation issues`,
        action: 'Check file formats, sizes, and content structure'
      });
    }

    if (validationStats.data.validationRate < 90 && validationStats.data.totalRows > 0) {
      suggestions.push({
        type: 'warning',
        title: 'Low Data Quality',
        message: `Only ${validationStats.data.validationRate.toFixed(1)}% of data rows are valid`,
        action: 'Review data format and fix validation errors'
      });
    }

    if (analytics.performance?.memoryUsage > 100) {
      suggestions.push({
        type: 'performance',
        title: 'High Memory Usage',
        message: 'Large files may impact browser performance',
        action: 'Consider uploading files in smaller batches'
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        title: 'Validation Complete',
        message: 'All validations passed successfully',
        action: 'You can proceed with the upload'
      });
    }

    return suggestions;
  }, [validationStats, analytics]);

  // Get icon for error category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'performance':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get badge variant for category
  const getCategoryVariant = (category) => {
    switch (category) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'performance':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Render error list for category
  const renderErrorList = (categoryErrors, category) => (
    <div className="space-y-2">
      {categoryErrors.map((error, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start space-x-3">
            {getCategoryIcon(category)}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">
                  {error.type === 'data' && `Row ${error.rowIndex + 1}: `}
                  {error.type === 'file' && `${error.fileName}: `}
                  {error.field}
                </p>
                <Badge variant={getCategoryVariant(category)} className="text-xs">
                  {error.source}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{error.message}</p>
              
              {/* Additional context for data errors */}
              {error.type === 'data' && parsedData[0] && (
                <div className="mt-2 p-2 bg-muted rounded text-xs">
                  <span className="font-medium">Context: </span>
                  {Object.entries(parsedData[0]).slice(0, 3).map(([key, value]) => (
                    <span key={key} className="mr-3">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Render validation overview
  const renderValidationOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${
              validationStats.totalErrors === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {validationStats.totalErrors}
            </div>
            <div className="text-sm text-muted-foreground">Total Errors</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {validationStats.files.valid}/{validationStats.files.total}
            </div>
            <div className="text-sm text-muted-foreground">Valid Files</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {validationStats.data.validRows}
            </div>
            <div className="text-sm text-muted-foreground">Valid Rows</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {validationStats.data.validationRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Error Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(validationStats.errorsByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <span className="capitalize font-medium">{category}</span>
                </div>
                <Badge variant={getCategoryVariant(category)}>{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <Alert 
                key={index} 
                variant={suggestion.type === 'critical' ? 'destructive' : 'default'}
              >
                {suggestion.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : suggestion.type === 'critical' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">{suggestion.title}</p>
                    <p className="text-sm">{suggestion.message}</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Action:</strong> {suggestion.action}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render detailed errors by category
  const renderDetailedErrors = () => (
    <Tabs defaultValue="critical" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="critical" className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>Critical ({errorCategories.critical.length})</span>
        </TabsTrigger>
        <TabsTrigger value="warning" className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Warning ({errorCategories.warning.length})</span>
        </TabsTrigger>
        <TabsTrigger value="info" className="flex items-center space-x-2">
          <Info className="h-4 w-4" />
          <span>Info ({errorCategories.info.length})</span>
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4" />
          <span>Performance ({errorCategories.performance.length})</span>
        </TabsTrigger>
      </TabsList>

      {Object.entries(errorCategories).map(([category, categoryErrors]) => (
        <TabsContent key={category} value={category} className="mt-6">
          <ScrollArea className="h-64">
            {categoryErrors.length > 0 ? (
              renderErrorList(categoryErrors, category)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p>No {category} errors found</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );

  // Render performance metrics
  const renderPerformanceMetrics = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Performance Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-lg font-semibold">
              {analytics.performance?.averageValidationTime || 0}ms
            </div>
            <div className="text-sm text-muted-foreground">Avg Validation Time</div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="text-lg font-semibold">
              {analytics.performance?.memoryUsage?.toFixed(1) || 0}MB
            </div>
            <div className="text-sm text-muted-foreground">Memory Usage</div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="text-lg font-semibold">
              {analytics.interactions?.validationTriggers?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Validation Runs</div>
          </div>
        </div>

        {analytics.performance?.validationTimes?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Validation Performance Trend</h4>
            <div className="h-20 bg-muted rounded p-2 flex items-end space-x-1">
              {analytics.performance.validationTimes.slice(-20).map((time, index) => (
                <div
                  key={index}
                  className="bg-primary flex-1 rounded-sm opacity-70"
                  style={{
                    height: `${Math.min((time / 2000) * 100, 100)}%`
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 20 validation runs (height = response time)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Validation Summary</h3>
          <p className="text-sm text-muted-foreground">
            {validationState.isValidating ? 'Validating...' : 
             validationStats.totalErrors === 0 ? 'All validations passed' : 
             `${validationStats.totalErrors} issues found`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onValidateForm}
            disabled={validationState.isValidating}
          >
            {validationState.isValidating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Re-validate
          </Button>
          
          {onExportReport && (
            <Button variant="outline" size="sm" onClick={onExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">
            Detailed Errors ({validationStats.totalErrors})
          </TabsTrigger>
          {showPerformanceMetrics && (
            <TabsTrigger value="performance">Performance</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderValidationOverview()}
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          {renderDetailedErrors()}
        </TabsContent>

        {showPerformanceMetrics && (
          <TabsContent value="performance" className="mt-6">
            {renderPerformanceMetrics()}
          </TabsContent>
        )}
      </Tabs>

      {/* Actions */}
      {validationStats.totalErrors > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Fix validation errors to proceed with upload
          </p>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClearErrors}>
              Clear All Errors
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyWorksUploadFormValidationSummary;
