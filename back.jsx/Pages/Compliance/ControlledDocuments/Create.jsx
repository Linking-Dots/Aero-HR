import React, { useState, useCallback } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Box,
    Typography,
    CircularProgress,
    Grow,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { 
    Card, 
    CardBody, 
    CardHeader,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    Divider,
    Chip,
    Spacer,
    User,
    DatePicker,
    Switch,
    Progress
} from "@heroui/react";
import { 
    DocumentTextIcon,
    ArrowLeftIcon,
    PlusIcon,
    CloudArrowUpIcon,
    XMarkIcon,
    DocumentIcon,
    FolderIcon,
    TagIcon,
    UserIcon,
    CalendarIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const CreateControlledDocument = ({ users = [], categories = [], statuses = [] }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        document_number: '',
        version: '1.0',
        category_id: '',
        description: '',
        content: '',
        owner_id: '',
        approver_id: '',
        review_date: dayjs().add(1, 'year').format('YYYY-MM-DD'),
        expiry_date: '',
        tags: '',
        is_active: true,
        requires_training: false,
        access_level: 'internal',
        file_attachments: []
    });

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'file_attachments') {
                uploadedFiles.forEach((file, index) => {
                    formData.append(`file_attachments[${index}]`, file);
                });
            } else if (key === 'tags') {
                formData.append(key, data[key].split(',').map(tag => tag.trim()).join(','));
            } else {
                formData.append(key, data[key]);
            }
        });

        post(route('compliance.controlled-documents.store'), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Controlled document created successfully');
                reset();
                setUploadedFiles([]);
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Please check the form for errors');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    }, [data, uploadedFiles, post, reset]);

    const handleFileUpload = useCallback((files) => {
        const validFiles = Array.from(files).filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png',
                'text/plain'
            ];
            
            if (file.size > maxSize) {
                toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            
            if (!allowedTypes.includes(file.type)) {
                toast.error(`File ${file.name} has an unsupported format.`);
                return false;
            }
            
            return true;
        });

        setUploadedFiles(prev => [...prev, ...validFiles]);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileUpload(e.dataTransfer.files);
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const removeFile = useCallback((index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const goBack = () => {
        router.visit(route('compliance.controlled-documents.index'));
    };

    return (
        <App>
            <Head title="Create Controlled Document - Compliance Management" />
            
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <PageHeader
                    title="Create Controlled Document"
                    subtitle="Add a new controlled document to the compliance system"
                    icon={DocumentTextIcon}
                    breadcrumbs={[
                        { label: 'Compliance', href: route('compliance.dashboard') },
                        { label: 'Controlled Documents', href: route('compliance.controlled-documents.index') },
                        { label: 'Create', href: '#' }
                    ]}
                    actions={
                        <Button
                            color="default"
                            variant="flat"
                            startContent={<ArrowLeftIcon className="w-4 h-4" />}
                            onPress={goBack}
                        >
                            Back to Documents
                        </Button>
                    }
                />

                <Grow in timeout={800}>
                    <Box>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Form */}
                                <div className="lg:col-span-2 space-y-6">
                                    <GlassCard>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <DocumentIcon className="w-5 h-5 text-primary" />
                                                <Typography variant="h6">Document Information</Typography>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Document Title"
                                                    placeholder="Enter document title"
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    isInvalid={!!errors.title}
                                                    errorMessage={errors.title}
                                                    isRequired
                                                />
                                                <Input
                                                    label="Document Number"
                                                    placeholder="DOC-XXXX-YYYY"
                                                    value={data.document_number}
                                                    onChange={(e) => setData('document_number', e.target.value)}
                                                    isInvalid={!!errors.document_number}
                                                    errorMessage={errors.document_number}
                                                    isRequired
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Version"
                                                    placeholder="1.0"
                                                    value={data.version}
                                                    onChange={(e) => setData('version', e.target.value)}
                                                    isInvalid={!!errors.version}
                                                    errorMessage={errors.version}
                                                />
                                                <Select
                                                    label="Category"
                                                    placeholder="Select category"
                                                    selectedKeys={data.category_id ? [data.category_id] : []}
                                                    onSelectionChange={(keys) => setData('category_id', Array.from(keys)[0] || '')}
                                                    isInvalid={!!errors.category_id}
                                                    errorMessage={errors.category_id}
                                                    isRequired
                                                >
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>

                                            <Textarea
                                                label="Description"
                                                placeholder="Enter document description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                isInvalid={!!errors.description}
                                                errorMessage={errors.description}
                                                minRows={3}
                                            />

                                            <Textarea
                                                label="Document Content"
                                                placeholder="Enter document content or summary"
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                isInvalid={!!errors.content}
                                                errorMessage={errors.content}
                                                minRows={6}
                                            />

                                            <Input
                                                label="Tags"
                                                placeholder="Enter tags separated by commas"
                                                value={data.tags}
                                                onChange={(e) => setData('tags', e.target.value)}
                                                isInvalid={!!errors.tags}
                                                errorMessage={errors.tags}
                                                startContent={<TagIcon className="w-4 h-4 text-default-400" />}
                                            />
                                        </CardBody>
                                    </GlassCard>

                                    {/* File Upload */}
                                    <GlassCard>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <CloudArrowUpIcon className="w-5 h-5 text-primary" />
                                                <Typography variant="h6">File Attachments</Typography>
                                            </div>
                                        </CardHeader>
                                        <CardBody>
                                            <div
                                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                                    isDragOver ? 'border-primary bg-primary/5' : 'border-default-300'
                                                }`}
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                            >
                                                <CloudArrowUpIcon className="w-12 h-12 mx-auto text-default-400 mb-2" />
                                                <Typography variant="body1" className="mb-2">
                                                    Drop files here or click to upload
                                                </Typography>
                                                <Typography variant="body2" className="text-default-500 mb-4">
                                                    Supports PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (Max 10MB each)
                                                </Typography>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                                                    onChange={(e) => handleFileUpload(e.target.files)}
                                                    className="hidden"
                                                    id="file-upload"
                                                />
                                                <Button
                                                    color="primary"
                                                    variant="flat"
                                                    startContent={<PlusIcon className="w-4 h-4" />}
                                                    onPress={() => document.getElementById('file-upload').click()}
                                                >
                                                    Choose Files
                                                </Button>
                                            </div>

                                            {uploadedFiles.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    <Typography variant="body2" className="font-medium">
                                                        Selected Files:
                                                    </Typography>
                                                    {uploadedFiles.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <DocumentIcon className="w-4 h-4 text-default-400" />
                                                                <span className="text-sm">{file.name}</span>
                                                                <Chip size="sm" variant="flat">
                                                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                                </Chip>
                                                            </div>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                color="danger"
                                                                variant="light"
                                                                onPress={() => removeFile(index)}
                                                            >
                                                                <XMarkIcon className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    <GlassCard>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="w-5 h-5 text-primary" />
                                                <Typography variant="h6">Ownership & Access</Typography>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-4">
                                            <Select
                                                label="Document Owner"
                                                placeholder="Select owner"
                                                selectedKeys={data.owner_id ? [data.owner_id] : []}
                                                onSelectionChange={(keys) => setData('owner_id', Array.from(keys)[0] || '')}
                                                isInvalid={!!errors.owner_id}
                                                errorMessage={errors.owner_id}
                                                isRequired
                                            >
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                            <Select
                                                label="Approver"
                                                placeholder="Select approver"
                                                selectedKeys={data.approver_id ? [data.approver_id] : []}
                                                onSelectionChange={(keys) => setData('approver_id', Array.from(keys)[0] || '')}
                                                isInvalid={!!errors.approver_id}
                                                errorMessage={errors.approver_id}
                                            >
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>

                                            <Select
                                                label="Access Level"
                                                placeholder="Select access level"
                                                selectedKeys={[data.access_level]}
                                                onSelectionChange={(keys) => setData('access_level', Array.from(keys)[0] || 'internal')}
                                                isInvalid={!!errors.access_level}
                                                errorMessage={errors.access_level}
                                            >
                                                <SelectItem key="public" value="public">Public</SelectItem>
                                                <SelectItem key="internal" value="internal">Internal</SelectItem>
                                                <SelectItem key="confidential" value="confidential">Confidential</SelectItem>
                                                <SelectItem key="restricted" value="restricted">Restricted</SelectItem>
                                            </Select>
                                        </CardBody>
                                    </GlassCard>

                                    <GlassCard>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-5 h-5 text-primary" />
                                                <Typography variant="h6">Dates & Settings</Typography>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="space-y-4">
                                            <Input
                                                type="date"
                                                label="Review Date"
                                                value={data.review_date}
                                                onChange={(e) => setData('review_date', e.target.value)}
                                                isInvalid={!!errors.review_date}
                                                errorMessage={errors.review_date}
                                                isRequired
                                            />

                                            <Input
                                                type="date"
                                                label="Expiry Date (Optional)"
                                                value={data.expiry_date}
                                                onChange={(e) => setData('expiry_date', e.target.value)}
                                                isInvalid={!!errors.expiry_date}
                                                errorMessage={errors.expiry_date}
                                            />

                                            <Divider />

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Typography variant="body2" className="font-medium">
                                                        Active Status
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-500 text-xs">
                                                        Document is active and accessible
                                                    </Typography>
                                                </div>
                                                <Switch
                                                    isSelected={data.is_active}
                                                    onValueChange={(checked) => setData('is_active', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Typography variant="body2" className="font-medium">
                                                        Requires Training
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-500 text-xs">
                                                        Users must complete training
                                                    </Typography>
                                                </div>
                                                <Switch
                                                    isSelected={data.requires_training}
                                                    onValueChange={(checked) => setData('requires_training', checked)}
                                                />
                                            </div>
                                        </CardBody>
                                    </GlassCard>

                                    {/* Submit Actions */}
                                    <GlassCard>
                                        <CardBody>
                                            <div className="space-y-3">
                                                <Button
                                                    color="primary"
                                                    size="lg"
                                                    className="w-full"
                                                    type="submit"
                                                    isLoading={isSubmitting || processing}
                                                    startContent={!isSubmitting && !processing && <ShieldCheckIcon className="w-4 h-4" />}
                                                >
                                                    {isSubmitting || processing ? 'Creating Document...' : 'Create Document'}
                                                </Button>
                                                <Button
                                                    color="default"
                                                    variant="flat"
                                                    size="lg"
                                                    className="w-full"
                                                    onPress={goBack}
                                                    isDisabled={isSubmitting || processing}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                </div>
                            </div>
                        </form>
                    </Box>
                </Grow>
            </Box>
        </App>
    );
};

export default CreateControlledDocument;
