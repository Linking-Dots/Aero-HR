import React, { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
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
    Chip,
    Divider,
    User,
    Progress,
    Badge,
    Tabs,
    Tab,
    Avatar,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/react";
import { 
    DocumentTextIcon,
    ArrowLeftIcon,
    PencilIcon,
    EyeIcon,
    CloudArrowDownIcon,
    ShareIcon,
    TrashIcon,
    ClockIcon,
    UserIcon,
    CalendarIcon,
    TagIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    DocumentDuplicateIcon,
    PrinterIcon,
    ArchiveBoxIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ShowControlledDocument = ({ document, revisions = [], access_logs = [], can_edit = false, can_delete = false }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [activeTab, setActiveTab] = useState('overview');
    const [isDeleting, setIsDeleting] = useState(false);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const goBack = () => {
        router.visit(route('compliance.controlled-documents.index'));
    };

    const goToEdit = () => {
        router.visit(route('compliance.controlled-documents.edit', document.id));
    };

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            await router.delete(route('compliance.controlled-documents.destroy', document.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Document deleted successfully');
                    router.visit(route('compliance.controlled-documents.index'));
                },
                onError: () => {
                    toast.error('Failed to delete document');
                    setIsDeleting(false);
                }
            });
        } catch (error) {
            toast.error('An error occurred while deleting');
            setIsDeleting(false);
        }
        onDeleteClose();
    }, [document.id, onDeleteClose]);

    const downloadDocument = () => {
        // Implementation for document download
        toast.info('Download functionality would be implemented here');
    };

    const shareDocument = () => {
        // Implementation for document sharing
        toast.info('Share functionality would be implemented here');
    };

    const printDocument = () => {
        window.print();
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'draft': 'default',
            'under_review': 'warning',
            'approved': 'success',
            'published': 'primary',
            'archived': 'secondary',
            'expired': 'danger'
        };
        return statusColors[status] || 'default';
    };

    const getAccessLevelColor = (level) => {
        const colors = {
            'public': 'success',
            'internal': 'primary',
            'confidential': 'warning',
            'restricted': 'danger'
        };
        return colors[level] || 'default';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <App>
            <Head title={`${document.title} - Controlled Documents`} />
            
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                <PageHeader
                    title={document.title}
                    subtitle={`Document ${document.document_number} • Version ${document.version}`}
                    icon={DocumentTextIcon}
                    breadcrumbs={[
                        { label: 'Compliance', href: route('compliance.dashboard') },
                        { label: 'Controlled Documents', href: route('compliance.controlled-documents.index') },
                        { label: document.title, href: '#' }
                    ]}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                color="default"
                                variant="flat"
                                startContent={<PrinterIcon className="w-4 h-4" />}
                                onPress={printDocument}
                                size="sm"
                            >
                                Print
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<ShareIcon className="w-4 h-4" />}
                                onPress={shareDocument}
                                size="sm"
                            >
                                Share
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<CloudArrowDownIcon className="w-4 h-4" />}
                                onPress={downloadDocument}
                                size="sm"
                            >
                                Download
                            </Button>
                            {can_edit && (
                                <Button
                                    color="primary"
                                    startContent={<PencilIcon className="w-4 h-4" />}
                                    onPress={goToEdit}
                                    size="sm"
                                >
                                    Edit
                                </Button>
                            )}
                            <Button
                                color="default"
                                variant="flat"
                                startContent={<ArrowLeftIcon className="w-4 h-4" />}
                                onPress={goBack}
                                size="sm"
                            >
                                Back
                            </Button>
                        </div>
                    }
                />

                <Grow in timeout={800}>
                    <Box>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Status Banner */}
                                {document.status === 'expired' && (
                                    <GlassCard className="border-l-4 border-l-danger">
                                        <CardBody>
                                            <div className="flex items-center gap-3">
                                                <ExclamationTriangleIcon className="w-6 h-6 text-danger" />
                                                <div>
                                                    <Typography variant="h6" className="text-danger">
                                                        Document Expired
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-600">
                                                        This document expired on {dayjs(document.expiry_date).format('MMMM DD, YYYY')}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {/* Tabs */}
                                <GlassCard>
                                    <CardBody className="p-0">
                                        <Tabs
                                            selectedKey={activeTab}
                                            onSelectionChange={setActiveTab}
                                            variant="underlined"
                                            classNames={{
                                                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                                cursor: "w-full bg-primary",
                                                tab: "max-w-fit px-6 h-12",
                                                tabContent: "group-data-[selected=true]:text-primary"
                                            }}
                                        >
                                            <Tab key="overview" title="Overview" />
                                            <Tab key="content" title="Content" />
                                            <Tab key="revisions" title={`Revisions (${revisions.length})`} />
                                            <Tab key="activity" title={`Activity (${access_logs.length})`} />
                                        </Tabs>
                                    </CardBody>
                                </GlassCard>

                                {/* Tab Content */}
                                {activeTab === 'overview' && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Document Overview</Typography>
                                        </CardHeader>
                                        <CardBody className="space-y-6">
                                            {document.description && (
                                                <div>
                                                    <Typography variant="body2" className="font-medium mb-2">
                                                        Description
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-600">
                                                        {document.description}
                                                    </Typography>
                                                </div>
                                            )}

                                            {document.tags && (
                                                <div>
                                                    <Typography variant="body2" className="font-medium mb-2">
                                                        Tags
                                                    </Typography>
                                                    <div className="flex flex-wrap gap-2">
                                                        {document.tags.split(',').map((tag, index) => (
                                                            <Chip key={index} size="sm" variant="flat">
                                                                {tag.trim()}
                                                            </Chip>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {document.file_attachments && document.file_attachments.length > 0 && (
                                                <div>
                                                    <Typography variant="body2" className="font-medium mb-2">
                                                        File Attachments
                                                    </Typography>
                                                    <div className="space-y-2">
                                                        {document.file_attachments.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                                                                <div className="flex items-center gap-2">
                                                                    <DocumentIcon className="w-4 h-4 text-default-400" />
                                                                    <span className="text-sm">{file.name}</span>
                                                                    <Chip size="sm" variant="flat">
                                                                        {formatFileSize(file.size)}
                                                                    </Chip>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    variant="light"
                                                                    startContent={<CloudArrowDownIcon className="w-4 h-4" />}
                                                                >
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {activeTab === 'content' && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Document Content</Typography>
                                        </CardHeader>
                                        <CardBody>
                                            {document.content ? (
                                                <div className="prose max-w-none">
                                                    <Typography variant="body2" className="whitespace-pre-wrap">
                                                        {document.content}
                                                    </Typography>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <DocumentIcon className="w-12 h-12 mx-auto text-default-300 mb-2" />
                                                    <Typography variant="body2" className="text-default-500">
                                                        No content available for this document
                                                    </Typography>
                                                </div>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {activeTab === 'revisions' && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Revision History</Typography>
                                        </CardHeader>
                                        <CardBody>
                                            {revisions.length > 0 ? (
                                                <div className="space-y-4">
                                                    {revisions.map((revision, index) => (
                                                        <div key={revision.id} className="flex items-start gap-4 pb-4 border-b border-divider last:border-b-0">
                                                            <Avatar
                                                                size="sm"
                                                                name={revision.user?.name}
                                                                src={revision.user?.avatar}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Typography variant="body2" className="font-medium">
                                                                        Version {revision.version}
                                                                    </Typography>
                                                                    <Chip size="sm" variant="flat">
                                                                        {revision.change_type}
                                                                    </Chip>
                                                                </div>
                                                                <Typography variant="body2" className="text-default-600 mb-1">
                                                                    {revision.change_summary}
                                                                </Typography>
                                                                <Typography variant="body2" className="text-default-500 text-xs">
                                                                    {revision.user?.name} • {dayjs(revision.created_at).fromNow()}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <ClockIcon className="w-12 h-12 mx-auto text-default-300 mb-2" />
                                                    <Typography variant="body2" className="text-default-500">
                                                        No revision history available
                                                    </Typography>
                                                </div>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                )}

                                {activeTab === 'activity' && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Access Activity</Typography>
                                        </CardHeader>
                                        <CardBody>
                                            {access_logs.length > 0 ? (
                                                <div className="space-y-4">
                                                    {access_logs.map((log, index) => (
                                                        <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-divider last:border-b-0">
                                                            <Avatar
                                                                size="sm"
                                                                name={log.user?.name}
                                                                src={log.user?.avatar}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Typography variant="body2" className="font-medium">
                                                                        {log.action}
                                                                    </Typography>
                                                                    <Chip size="sm" variant="flat" color={log.action === 'viewed' ? 'primary' : 'default'}>
                                                                        {log.action}
                                                                    </Chip>
                                                                </div>
                                                                <Typography variant="body2" className="text-default-500 text-xs">
                                                                    {log.user?.name} • {dayjs(log.created_at).fromNow()}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <EyeIcon className="w-12 h-12 mx-auto text-default-300 mb-2" />
                                                    <Typography variant="body2" className="text-default-500">
                                                        No access activity recorded
                                                    </Typography>
                                                </div>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Document Status */}
                                <GlassCard>
                                    <CardHeader>
                                        <Typography variant="h6">Status & Info</Typography>
                                    </CardHeader>
                                    <CardBody className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Status
                                            </Typography>
                                            <Chip 
                                                color={getStatusColor(document.status)} 
                                                variant="flat"
                                                size="sm"
                                            >
                                                {document.status?.replace('_', ' ').toUpperCase()}
                                            </Chip>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Access Level
                                            </Typography>
                                            <Chip 
                                                color={getAccessLevelColor(document.access_level)} 
                                                variant="flat"
                                                size="sm"
                                            >
                                                {document.access_level?.toUpperCase()}
                                            </Chip>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Version
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {document.version}
                                            </Typography>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Document Number
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {document.document_number}
                                            </Typography>
                                        </div>

                                        {document.category && (
                                            <div className="flex items-center justify-between">
                                                <Typography variant="body2" className="text-default-600">
                                                    Category
                                                </Typography>
                                                <Typography variant="body2" className="font-medium">
                                                    {document.category.name}
                                                </Typography>
                                            </div>
                                        )}
                                    </CardBody>
                                </GlassCard>

                                {/* Ownership */}
                                <GlassCard>
                                    <CardHeader>
                                        <Typography variant="h6">Ownership</Typography>
                                    </CardHeader>
                                    <CardBody className="space-y-4">
                                        {document.owner && (
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    size="sm"
                                                    name={document.owner.name}
                                                    src={document.owner.avatar}
                                                />
                                                <div>
                                                    <Typography variant="body2" className="font-medium">
                                                        {document.owner.name}
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-500 text-xs">
                                                        Document Owner
                                                    </Typography>
                                                </div>
                                            </div>
                                        )}

                                        {document.approver && (
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    size="sm"
                                                    name={document.approver.name}
                                                    src={document.approver.avatar}
                                                />
                                                <div>
                                                    <Typography variant="body2" className="font-medium">
                                                        {document.approver.name}
                                                    </Typography>
                                                    <Typography variant="body2" className="text-default-500 text-xs">
                                                        Approver
                                                    </Typography>
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </GlassCard>

                                {/* Important Dates */}
                                <GlassCard>
                                    <CardHeader>
                                        <Typography variant="h6">Important Dates</Typography>
                                    </CardHeader>
                                    <CardBody className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Created
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {dayjs(document.created_at).format('MMM DD, YYYY')}
                                            </Typography>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Typography variant="body2" className="text-default-600">
                                                Last Updated
                                            </Typography>
                                            <Typography variant="body2" className="font-medium">
                                                {dayjs(document.updated_at).format('MMM DD, YYYY')}
                                            </Typography>
                                        </div>

                                        {document.review_date && (
                                            <div className="flex items-center justify-between">
                                                <Typography variant="body2" className="text-default-600">
                                                    Review Date
                                                </Typography>
                                                <Typography variant="body2" className="font-medium">
                                                    {dayjs(document.review_date).format('MMM DD, YYYY')}
                                                </Typography>
                                            </div>
                                        )}

                                        {document.expiry_date && (
                                            <div className="flex items-center justify-between">
                                                <Typography variant="body2" className="text-default-600">
                                                    Expires
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    className={`font-medium ${
                                                        dayjs(document.expiry_date).isBefore(dayjs()) ? 'text-danger' : ''
                                                    }`}
                                                >
                                                    {dayjs(document.expiry_date).format('MMM DD, YYYY')}
                                                </Typography>
                                            </div>
                                        )}
                                    </CardBody>
                                </GlassCard>

                                {/* Actions */}
                                {(can_edit || can_delete) && (
                                    <GlassCard>
                                        <CardHeader>
                                            <Typography variant="h6">Actions</Typography>
                                        </CardHeader>
                                        <CardBody className="space-y-3">
                                            {can_edit && (
                                                <>
                                                    <Button
                                                        color="primary"
                                                        variant="flat"
                                                        startContent={<DocumentDuplicateIcon className="w-4 h-4" />}
                                                        className="w-full"
                                                    >
                                                        Create New Version
                                                    </Button>
                                                    <Button
                                                        color="warning"
                                                        variant="flat"
                                                        startContent={<ArchiveBoxIcon className="w-4 h-4" />}
                                                        className="w-full"
                                                    >
                                                        Archive Document
                                                    </Button>
                                                </>
                                            )}
                                            {can_delete && (
                                                <Button
                                                    color="danger"
                                                    variant="flat"
                                                    startContent={<TrashIcon className="w-4 h-4" />}
                                                    onPress={onDeleteOpen}
                                                    className="w-full"
                                                >
                                                    Delete Document
                                                </Button>
                                            )}
                                        </CardBody>
                                    </GlassCard>
                                )}
                            </div>
                        </div>
                    </Box>
                </Grow>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
                    <ModalContent>
                        <ModalHeader className="flex flex-col gap-1">
                            Delete Document
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-danger" />
                                </div>
                                <div>
                                    <Typography variant="body1" className="mb-2">
                                        Are you sure you want to delete this document?
                                    </Typography>
                                    <Typography variant="body2" className="text-default-600">
                                        This action cannot be undone. The document "{document.title}" will be permanently removed from the system.
                                    </Typography>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="flat" onPress={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button 
                                color="danger" 
                                onPress={handleDelete}
                                isLoading={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Document'}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </App>
    );
};

export default ShowControlledDocument;
