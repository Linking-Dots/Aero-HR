import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Alert,
  AlertDescription,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  ScrollArea
} from '@/components/ui';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  Eye,
  Settings,
  BarChart3,
  FileSpreadsheet,
  FileCsv,
  FileImage,
  Trash2,
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react';

/**
 * Core component for daily works upload form
 * 
 * Features:
 * - Multi-step upload workflow
 * - Drag-and-drop file interface
 * - Real-time data preview
 * - Advanced validation display
 * - Progress tracking
 * - File management
 */
export const DailyWorksUploadFormCore = ({
  // Form state
  currentStep,
  isProcessing,
  processingStatus,
  uploadResults,
  completionState,
  
  // Files and data
  uploadedFiles,
  parsedData,
  
  // Validation
  errors,
  fileErrors,
  dataErrors,
  hasErrors,
  
  // Step management
  steps,
  getCurrentStepInfo,
  goToNextStep,
  goToPreviousStep,
  canProceed,
  
  // File operations
  addFiles,
  removeFile,
  clearFiles,
  
  // Form operations
  submitForm,
  cancelUpload,
  resetForm,
  
  // Form data
  formData,
  updateFormData,
  
  // Analytics
  trackCustomEvent,
  
  // Configuration
  config = {},
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState('table');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Current step info
  const stepInfo = getCurrentStepInfo();

  // File type icons mapping
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
      case 'csv':
        return <FileCsv className="h-6 w-6 text-blue-600" />;
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600" />;
      default:
        return <FileImage className="h-6 w-6 text-gray-600" />;
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      addFiles(files);
      trackCustomEvent('file_select', 'click', files.length);
    }
  }, [addFiles, trackCustomEvent]);

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      addFiles(files);
      trackCustomEvent('file_drop', 'drop', files.length);
    }
  }, [addFiles, trackCustomEvent]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file status
  const getFileStatus = (fileIndex) => {
    if (fileErrors[fileIndex] && Object.keys(fileErrors[fileIndex]).length > 0) {
      return { status: 'error', message: 'Validation failed' };
    }
    if (parsedData[fileIndex]) {
      return { status: 'success', message: 'Ready to upload' };
    }
    return { status: 'pending', message: 'Processing...' };
  };

  // Memoized parsed data for current file
  const currentFileData = useMemo(() => {
    if (!parsedData[selectedFileIndex]) return [];
    return parsedData[selectedFileIndex].slice(0, 100); // Limit preview to 100 rows
  }, [parsedData, selectedFileIndex]);

  // Render file selection step
  const renderFileSelectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Files to Upload</h3>
        <p className="text-muted-foreground">
          Choose Excel, CSV, or PDF files containing daily work data
        </p>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {dragActive ? 'Drop files here' : 'Click to select files or drag and drop'}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports Excel (.xlsx, .xls), CSV (.csv), and PDF files up to 50MB each
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Selected Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Files ({uploadedFiles.length})</h4>
            <Button variant="outline" size="sm" onClick={clearFiles}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => {
              const fileStatus = getFileStatus(index);
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        fileStatus.status === 'success' ? 'default' :
                        fileStatus.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {fileStatus.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {fileStatus.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {fileStatus.message}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* File errors */}
                  {fileErrors[index] && Object.keys(fileErrors[index]).length > 0 && (
                    <Alert className="mt-3" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {Object.values(fileErrors[index]).join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Global errors */}
      {errors.files && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.files}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Render data preview step
  const renderDataPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Preview Data</h3>
        <p className="text-muted-foreground">
          Review the parsed data before uploading
        </p>
      </div>

      {/* File selector */}
      {uploadedFiles.length > 1 && (
        <div className="flex items-center space-x-4">
          <Label htmlFor="file-selector">Select file to preview:</Label>
          <Select value={selectedFileIndex.toString()} onValueChange={(value) => setSelectedFileIndex(parseInt(value))}>
            <SelectTrigger id="file-selector" className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {uploadedFiles.map((file, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Preview options */}
      <div className="flex items-center justify-between">
        <Tabs value={previewMode} onValueChange={setPreviewMode} className="w-auto">
          <TabsList>
            <TabsTrigger value="table">
              <Eye className="h-4 w-4 mr-2" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="summary">
              <BarChart3 className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {currentFileData.length} rows
          </Badge>
          {parsedData[selectedFileIndex] && parsedData[selectedFileIndex].length > 100 && (
            <Badge variant="secondary">
              Showing first 100 rows
            </Badge>
          )}
        </div>
      </div>

      {/* Preview content */}
      <Card>
        <CardContent className="p-0">
          <TabsContent value="table" className="m-0">
            <ScrollArea className="h-96">
              {currentFileData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(currentFileData[0] || {}).map((column) => (
                        <TableHead key={column} className="font-medium">
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentFileData.map((row, index) => (
                      <TableRow 
                        key={index}
                        className={dataErrors[index] ? 'bg-destructive/5' : ''}
                      >
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex} className="max-w-32 truncate">
                            {value?.toString() || ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No data available for preview</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summary" className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{parsedData[selectedFileIndex]?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {Object.keys(currentFileData[0] || {}).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Columns</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(dataErrors).length === 0 ? parsedData[selectedFileIndex]?.length || 0 : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Valid Rows</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Object.keys(dataErrors).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Error Rows</div>
                </CardContent>
              </Card>
            </div>

            {/* Column mapping info */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Column Mapping</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(currentFileData[0] || {}).map((column) => (
                  <div key={column} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{column}</span>
                    <Badge variant="outline">Detected</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Card>

      {/* Data errors */}
      {Object.keys(dataErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {Object.keys(dataErrors).length} rows have validation errors. 
            Please review and fix the issues before proceeding.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Render configuration step
  const renderConfigurationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Configure Upload</h3>
        <p className="text-muted-foreground">
          Set preferences and options for the upload process
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Selection */}
        <div className="space-y-2">
          <Label htmlFor="project">Project *</Label>
          <Select 
            value={formData.project || ''} 
            onValueChange={(value) => updateFormData({ project: value })}
          >
            <SelectTrigger id="project">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highway-expansion">Highway Expansion Project</SelectItem>
              <SelectItem value="bridge-construction">Bridge Construction</SelectItem>
              <SelectItem value="road-maintenance">Road Maintenance</SelectItem>
            </SelectContent>
          </Select>
          {errors.project && (
            <p className="text-sm text-destructive">{errors.project}</p>
          )}
        </div>

        {/* Work Type */}
        <div className="space-y-2">
          <Label htmlFor="workType">Default Work Type</Label>
          <Select 
            value={formData.workType || ''} 
            onValueChange={(value) => updateFormData({ workType: value })}
          >
            <SelectTrigger id="workType">
              <SelectValue placeholder="Select work type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="structure">Structure Work</SelectItem>
              <SelectItem value="embankment">Embankment</SelectItem>
              <SelectItem value="pavement">Pavement</SelectItem>
              <SelectItem value="drainage">Drainage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload Options */}
        <div className="space-y-4">
          <h4 className="font-medium">Upload Options</h4>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.skipDuplicates || false}
                onChange={(e) => updateFormData({ skipDuplicates: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Skip duplicate entries</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.validateBusinessRules || true}
                onChange={(e) => updateFormData({ validateBusinessRules: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Validate business rules</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.sendNotification || false}
                onChange={(e) => updateFormData({ sendNotification: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Send notification on completion</span>
            </label>
          </div>
        </div>

        {/* Processing Options */}
        <div className="space-y-4">
          <h4 className="font-medium">Processing Options</h4>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                min="1"
                max="1000"
                value={formData.batchSize || 100}
                onChange={(e) => updateFormData({ batchSize: parseInt(e.target.value) })}
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                Number of records to process at once
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="p-0 h-auto font-normal"
        >
          <Settings className="h-4 w-4 mr-2" />
          {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
        </Button>

        {showAdvancedOptions && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    value={formData.dateFormat || 'auto'} 
                    onValueChange={(value) => updateFormData({ dateFormat: value })}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberFormat">Number Format</Label>
                  <Select 
                    value={formData.numberFormat || 'auto'} 
                    onValueChange={(value) => updateFormData({ numberFormat: value })}
                  >
                    <SelectTrigger id="numberFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="decimal">Decimal (1.23)</SelectItem>
                      <SelectItem value="comma">Comma (1,23)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  // Render confirmation step
  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Confirm Upload</h3>
        <p className="text-muted-foreground">
          Review your settings before starting the upload process
        </p>
      </div>

      {/* Upload Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{uploadedFiles.length}</div>
              <div className="text-sm text-muted-foreground">Files to Upload</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {parsedData.reduce((sum, data) => sum + (data?.length || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.size, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </div>
          </div>

          <Separator />

          {/* Configuration Summary */}
          <div className="space-y-3">
            <h4 className="font-medium">Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project:</span>
                <span className="font-medium">{formData.project || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Work Type:</span>
                <span className="font-medium">{formData.workType || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skip Duplicates:</span>
                <span className="font-medium">{formData.skipDuplicates ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch Size:</span>
                <span className="font-medium">{formData.batchSize || 100}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Files to Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {parsedData[index]?.length || 0} records
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Ready</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Upload Progress</h4>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelUpload}
                    disabled={!isProcessing}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
              
              <Progress 
                value={(completionState.processedFiles / completionState.totalFiles) * 100} 
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{processingStatus}</span>
                <span>
                  {completionState.processedFiles} / {completionState.totalFiles} files
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="font-medium">Upload Results</h4>
              
              {uploadResults.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upload completed successfully! {uploadResults.processedRecords} records processed.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upload failed: {uploadResults.error}
                  </AlertDescription>
                </Alert>
              )}

              {uploadResults.summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResults.summary.successful}
                    </div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResults.summary.failed}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {uploadResults.summary.skipped}
                    </div>
                    <div className="text-sm text-muted-foreground">Skipped</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final validation */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please resolve all validation errors before proceeding with the upload.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderFileSelectionStep();
      case 1:
        return renderDataPreviewStep();
      case 2:
        return renderConfigurationStep();
      case 3:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Daily Works Upload</h2>
          <Badge variant="outline">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        
        <Progress value={stepInfo.progress} className="w-full" />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{stepInfo.title}</span>
          <span>{Math.round(stepInfo.progress)}% complete</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-96">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 0 || isProcessing}
        >
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={goToNextStep}
              disabled={!canProceed || isProcessing}
            >
              {stepInfo.isValid ? 'Next' : 'Next (Skip)'}
            </Button>
          ) : (
            <Button
              onClick={submitForm}
              disabled={!canProceed || isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Upload
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyWorksUploadFormCore;
