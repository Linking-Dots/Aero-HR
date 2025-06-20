import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Card,
    CardBody,
    ScrollShadow
} from "@heroui/react";
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BulkActionBar } from './CommonComponents';

/**
 * DataTableTemplate - A reusable data table component with responsive design
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Array of column definitions
 * @param {Function} props.renderCell - Function to render individual cells
 * @param {Function} props.renderMobileCard - Function to render mobile cards
 * @param {boolean} props.isSelectable - Whether rows are selectable
 * @param {Set} props.selectedKeys - Set of selected row keys
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {Object} props.pagination - Pagination configuration
 * @param {Function} props.onPageChange - Page change handler
 * @param {Array} props.bulkActions - Array of bulk action objects
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.emptyMessage - Empty state message
 * @param {string} props.loadingMessage - Loading message
 * @param {Object} props.tableProps - Additional table props
 */
const DataTableTemplate = ({
    data = [],
    columns = [],
    renderCell,
    renderMobileCard,
    isSelectable = false,
    selectedKeys = new Set(),
    onSelectionChange,
    pagination,
    onPageChange,
    bulkActions = [],
    isLoading = false,
    emptyMessage = "No data found",
    loadingMessage = "Loading data...",
    tableProps = {},
    itemLabel = "item",
    ...props
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width: 640px)');
    const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');

    const handlePageChange = useCallback((page) => {
        if (onPageChange) {
            onPageChange(page);
        }
    }, [onPageChange]);

    const handleSelectionChange = useCallback((keys) => {
        if (onSelectionChange) {
            onSelectionChange(keys);
        }
    }, [onSelectionChange]);

    // Mobile view with cards
    if (isMobile && renderMobileCard) {
        return (
            <Box className="space-y-4">
                {/* Bulk Actions for Mobile */}
                {isSelectable && bulkActions.length > 0 && (
                    <BulkActionBar
                        selectedItems={selectedKeys}
                        onClearSelection={() => handleSelectionChange(new Set())}
                        actions={bulkActions}
                        itemLabel={itemLabel}
                        visible={selectedKeys.size > 0}
                    />
                )}
                
                <ScrollShadow className="max-h-[70vh]">
                    {isLoading ? (
                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardBody className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <Typography color="textSecondary">
                                    {loadingMessage}
                                </Typography>
                            </CardBody>
                        </Card>
                    ) : data.length > 0 ? (
                        data.map((item, index) => renderMobileCard(item, index))
                    ) : (
                        <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardBody className="text-center py-8">
                                <CalendarDaysIcon className="w-12 h-12 text-default-300 mb-4 mx-auto" />
                                <Typography variant="h6" color="textSecondary">
                                    {emptyMessage}
                                </Typography>
                            </CardBody>
                        </Card>
                    )}
                </ScrollShadow>
                
                {/* Mobile Pagination */}
                {pagination && pagination.total > pagination.perPage && (
                    <Box className="flex justify-center pt-4">
                        <Pagination
                            initialPage={1}
                            isCompact
                            showControls
                            showShadow
                            color="primary"
                            variant="bordered"
                            page={pagination.currentPage}
                            total={pagination.lastPage}
                            onChange={handlePageChange}
                            size="sm"
                        />
                    </Box>
                )}
            </Box>
        );
    }

    // Desktop/Tablet view with table
    return (
        <Box sx={{ maxHeight: "84vh", overflowY: "auto" }}>
            {/* Bulk Actions Bar */}
            {isSelectable && bulkActions.length > 0 && (
                <BulkActionBar
                    selectedItems={selectedKeys}
                    onClearSelection={() => handleSelectionChange(new Set())}
                    actions={bulkActions}
                    itemLabel={itemLabel}
                    visible={selectedKeys.size > 0}
                />
            )}
            
            <ScrollShadow className="max-h-[70vh]">
                <Table
                    isStriped
                    selectionMode={isSelectable ? "multiple" : "none"}
                    selectionBehavior="toggle"
                    selectedKeys={selectedKeys}
                    onSelectionChange={handleSelectionChange}
                    isCompact={!isLargeScreen}
                    isHeaderSticky
                    removeWrapper
                    aria-label="Data table"
                    classNames={{
                        wrapper: "min-h-[222px]",
                        table: "min-h-[400px]",
                        thead: "[&>tr]:first:shadow-small",
                        tbody: "divide-y divide-default-200/50",
                        tr: "group hover:bg-default-50/50 transition-colors"
                    }}
                    {...tableProps}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn 
                                key={column.uid || column.key} 
                                align={column.align || (column.uid === "actions" ? "center" : "start")}
                                className="bg-default-100/50 backdrop-blur-md"
                                allowsSorting={column.sortable}
                            >
                                <Box className="flex items-center gap-2">
                                    {column.icon && <column.icon className="w-4 h-4" />}
                                    <span>{column.name || column.title}</span>
                                </Box>
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody 
                        items={data}
                        isLoading={isLoading}
                        loadingContent={
                            <Box className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <Typography color="textSecondary">
                                    {loadingMessage}
                                </Typography>
                            </Box>
                        }
                        emptyContent={
                            <Box className="flex flex-col items-center justify-center py-8 text-center">
                                <CalendarDaysIcon className="w-12 h-12 text-default-300 mb-4" />
                                <Typography variant="h6" color="textSecondary">
                                    {emptyMessage}
                                </Typography>
                            </Box>
                        }
                    >
                        {(item) => (
                            <TableRow key={item.id || item.key}>
                                {(columnKey) => renderCell ? renderCell(item, columnKey) : (
                                    <TableCell>{item[columnKey]}</TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollShadow>
            
            {/* Pagination */}
            {pagination && pagination.total > pagination.perPage && (
                <Box className="py-4 flex justify-center">
                    <Pagination
                        initialPage={1}
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        variant="bordered"
                        page={pagination.currentPage}
                        total={pagination.lastPage}
                        onChange={handlePageChange}
                        size={isTablet ? "sm" : "md"}
                    />
                </Box>
            )}
        </Box>
    );
};

export default DataTableTemplate;
