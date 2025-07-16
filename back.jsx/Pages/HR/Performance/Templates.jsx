import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, useMediaQuery, useTheme, Grow } from '@mui/material';
import { 
    DocumentTextIcon, 
    PlusIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { Head } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import { Input, Pagination } from "@heroui/react";
import axios from "axios";
import { toast } from "react-toastify";

const PerformanceTemplates = React.memo(({ auth, title }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [openModalType, setOpenModalType] = useState(null);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const fetchData = async (page, perPage, search) => {
        setLoading(true);
        try {
            const response = await axios.get(route('hr.performance.templates.index'), {
                params: {
                    page,
                    perPage,
                    search: search
                }
            });

            setData(response.data.data);
            setTotalRows(response.data.total);
            setLastPage(response.data.last_page);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch performance templates.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage, perPage, search);
    }, [currentPage, perPage]);

    const handleSearch = useCallback((event) => {
        setSearch(event.target.value);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const openModal = useCallback((modalType, template = null) => {
        setSelectedTemplate(template);
        setOpenModalType(modalType);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModalType(null);
        setSelectedTemplate(null);
    }, []);

    // Action buttons configuration
    const actionButtons = [
        {
            label: "New Template",
            icon: <PlusIcon className="w-4 h-4" />,
            onPress: () => openModal('addTemplate'),
            permission: 'performance-templates.create'
        },
        {
            label: "Back to Reviews",
            icon: <DocumentTextIcon className="w-4 h-4" />,
            onPress: () => window.location.href = route('hr.performance.index'),
            permission: 'performance-reviews.view'
        }
    ].filter(button => !button.permission || auth.permissions.includes(button.permission));

    return (
        <App>
            <Head title={title || "Performance Review Templates"} />
            <PageHeader
                title="Performance Templates"
                subtitle="Manage and create performance review templates"
                actionButtons={actionButtons}
                icon={<DocumentTextIcon className="w-8 h-8" />}
            />
            
            <Box sx={{ mt: 3 }}>
                <GlassCard>
                    <Box sx={{ p: 2 }}>
                        <Input
                            placeholder="Search templates..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full max-w-md"
                            leadingIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                            onKeyUp={(e) => {
                                if (e.key === 'Enter') {
                                    fetchData(1, perPage, search);
                                }
                            }}
                        />
                    </Box>
                    
                    <Box sx={{ overflow: 'auto' }}>
                        <Box sx={{ minWidth: 800, p: 2 }}>
                            {/* Templates Table would go here */}
                            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                                Loading performance templates data...
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={lastPage}
                            onChange={handlePageChange}
                        />
                    </Box>
                </GlassCard>
            </Box>
            
            {/* Modal forms would be included here */}
        </App>
    );
});

export default PerformanceTemplates;
