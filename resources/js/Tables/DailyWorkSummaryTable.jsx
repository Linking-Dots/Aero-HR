import React from 'react';
import {
    Box,
    Typography,
    useMediaQuery,
    CardContent,
    CardHeader,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { usePage } from "@inertiajs/react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Card,
    CardBody,
    Divider,
    ScrollShadow,
    Progress
} from "@heroui/react";
import {
    CalendarDaysIcon,
    ChartBarIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    BuildingOfficeIcon,
    DocumentIcon,
    MapPinIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolid,
    ClockIcon as ClockSolid,
    ArrowPathIcon as ArrowPathSolid
} from '@heroicons/react/24/solid';
import GlassCard from "@/Components/GlassCard";


const DailyWorkSummaryTable = ({ filteredData }) => {
    const { auth } = usePage().props;
    const theme = useTheme();
    const isLargeScreen = useMediaQuery('(min-width: 1025px)');
    const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isMobile = useMediaQuery('(max-width: 640px)');

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const getPercentageColor = (percentage) => {
        if (percentage >= 100) return 'success';
        if (percentage >= 75) return 'warning';
        if (percentage >= 50) return 'primary';
        return 'danger';
    };

    const getPercentageIcon = (percentage) => {
        if (percentage >= 100) return <CheckCircleSolid className="w-3 h-3" />;
        if (percentage >= 50) return <ClockSolid className="w-3 h-3" />;
        return <ExclamationTriangleIcon className="w-3 h-3" />;
    };

    const getWorkTypeIcon = (type, count) => {
        const iconProps = "w-3 h-3";
        const baseColor = count > 0 ? "" : "text-gray-400";
        
        switch (type?.toLowerCase()) {
            case "embankment":
                return <BuildingOfficeIcon className={`${iconProps} text-amber-500 ${baseColor}`} />;
            case "structure":
                return <DocumentIcon className={`${iconProps} text-blue-500 ${baseColor}`} />;
            case "pavement":
                return <MapPinIcon className={`${iconProps} text-gray-500 ${baseColor}`} />;
            default:
                return <DocumentTextIcon className={`${iconProps} text-primary ${baseColor}`} />;
        }
    };

    // Mobile card component - matching the pattern from other tables
    const MobileSummaryCard = ({ summary }) => {
        const completionPercentage = summary.totalDailyWorks > 0
            ? (summary.completed / summary.totalDailyWorks * 100).toFixed(1)
            : 0;
        const rfiSubmissionPercentage = summary.rfiSubmissions > 0 && summary.completed > 0
            ? (summary.rfiSubmissions / summary.completed * 100).toFixed(1)
            : 0;
        const pending = summary.totalDailyWorks - summary.completed;

        return (
            <GlassCard className="mb-2" shadow="sm">
                <CardContent className="p-3">
                    <Box className="flex items-start justify-between mb-3">
                        <Box className="flex items-center gap-3 flex-1">
                            <Box className="flex flex-col">
                                <Typography variant="body2" fontWeight="bold" className="text-primary">
                                    {formatDate(summary.date)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {summary.totalDailyWorks} total works
                                </Typography>
                            </Box>
                        </Box>
                        <Box className="flex items-center gap-2">
                            <Chip
                                size="sm"
                                variant="flat"
                                color={getPercentageColor(parseFloat(completionPercentage))}
                                startContent={getPercentageIcon(parseFloat(completionPercentage))}
                            >
                                {completionPercentage}%
                            </Chip>
                        </Box>
                    </Box>

                    <Divider className="my-3" />

                    {/* Progress bars */}
                    <Box className="space-y-3 mb-3">
                        <Box>
                            <Box className="flex justify-between items-center mb-1">
                                <Typography variant="caption" className="text-xs">
                                    Completion Progress
                                </Typography>
                                <Typography variant="caption" className="text-xs font-medium">
                                    {summary.completed}/{summary.totalDailyWorks}
                                </Typography>
                            </Box>
                            <Progress
                                value={parseFloat(completionPercentage)}
                                color={getPercentageColor(parseFloat(completionPercentage))}
                                size="sm"
                                className="w-full"
                            />
                        </Box>

                        {summary.rfiSubmissions > 0 && (
                            <Box>
                                <Box className="flex justify-between items-center mb-1">
                                    <Typography variant="caption" className="text-xs">
                                        RFI Submission
                                    </Typography>
                                    <Typography variant="caption" className="text-xs font-medium">
                                        {summary.rfiSubmissions}/{summary.completed}
                                    </Typography>
                                </Box>
                                <Progress
                                    value={parseFloat(rfiSubmissionPercentage)}
                                    color={getPercentageColor(parseFloat(rfiSubmissionPercentage))}
                                    size="sm"
                                    className="w-full"
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Work type breakdown */}
                    <Box className="grid grid-cols-3 gap-2">
                        <Box className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                            {getWorkTypeIcon("embankment", summary.embankment)}
                            <Typography variant="caption" className="text-xs mt-1">
                                Embankment
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" className="text-xs">
                                {summary.embankment}
                            </Typography>
                        </Box>
                        
                        <Box className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                            {getWorkTypeIcon("structure", summary.structure)}
                            <Typography variant="caption" className="text-xs mt-1">
                                Structure
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" className="text-xs">
                                {summary.structure}
                            </Typography>
                        </Box>
                        
                        <Box className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                            {getWorkTypeIcon("pavement", summary.pavement)}
                            <Typography variant="caption" className="text-xs mt-1">
                                Pavement
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" className="text-xs">
                                {summary.pavement}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Additional metrics */}
                    <Divider className="my-3" />
                    <Box className="flex justify-between text-xs">
                        <Box className="flex items-center gap-1">
                            <ArrowPathSolid className="w-3 h-3 text-warning" />
                            <span>Resubmissions: {summary.resubmissions}</span>
                        </Box>
                        <Box className="flex items-center gap-1">
                            <ClockSolid className="w-3 h-3 text-danger" />
                            <span>Pending: {pending}</span>
                        </Box>
                    </Box>
                </CardContent>
            </GlassCard>
        );
    };

    const renderCell = React.useCallback((summary, columnKey) => {
        const completionPercentage = summary.totalDailyWorks > 0
            ? (summary.completed / summary.totalDailyWorks * 100).toFixed(1)
            : 0;
        const rfiSubmissionPercentage = summary.rfiSubmissions > 0 && summary.completed > 0
            ? (summary.rfiSubmissions / summary.completed * 100).toFixed(1)
            : 0;
        const pending = summary.totalDailyWorks - summary.completed;

        switch (columnKey) {
            case "date":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-3 h-3 text-default-500" />
                            <Typography variant="body2" className="text-sm font-medium">
                                {formatDate(summary.date)}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "totalDailyWorks":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <DocumentTextIcon className="w-3 h-3 text-primary" />
                            <Typography variant="body2" className="text-sm font-bold">
                                {summary.totalDailyWorks}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "resubmissions":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <ArrowPathSolid className="w-3 h-3 text-warning" />
                            <Typography variant="body2" className="text-sm">
                                {summary.resubmissions}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "embankment":
            case "structure":
            case "pavement":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            {getWorkTypeIcon(columnKey, summary[columnKey])}
                            <Typography variant="body2" className="text-sm">
                                {summary[columnKey]}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "completed":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <CheckCircleSolid className="w-3 h-3 text-success" />
                            <Typography variant="body2" className="text-sm font-medium text-success">
                                {summary.completed}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "pending":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <ClockSolid className="w-3 h-3 text-danger" />
                            <Typography variant="body2" className="text-sm font-medium text-danger">
                                {pending}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "completionPercentage":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-2">
                            <Progress
                                value={parseFloat(completionPercentage)}
                                color={getPercentageColor(parseFloat(completionPercentage))}
                                size="sm"
                                className="flex-1 min-w-[80px]"
                            />
                            <Chip
                                size="sm"
                                variant="flat"
                                color={getPercentageColor(parseFloat(completionPercentage))}
                                startContent={getPercentageIcon(parseFloat(completionPercentage))}
                            >
                                {completionPercentage}%
                            </Chip>
                        </Box>
                    </TableCell>
                );

            case "rfiSubmissions":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-1">
                            <DocumentIcon className="w-3 h-3 text-info" />
                            <Typography variant="body2" className="text-sm">
                                {summary.rfiSubmissions}
                            </Typography>
                        </Box>
                    </TableCell>
                );

            case "rfiSubmissionPercentage":
                return (
                    <TableCell>
                        <Box className="flex items-center gap-2">
                            {summary.rfiSubmissions > 0 ? (
                                <>
                                    <Progress
                                        value={parseFloat(rfiSubmissionPercentage)}
                                        color={getPercentageColor(parseFloat(rfiSubmissionPercentage))}
                                        size="sm"
                                        className="flex-1 min-w-[80px]"
                                    />
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={getPercentageColor(parseFloat(rfiSubmissionPercentage))}
                                        startContent={getPercentageIcon(parseFloat(rfiSubmissionPercentage))}
                                    >
                                        {rfiSubmissionPercentage}%
                                    </Chip>
                                </>
                            ) : (
                                <Typography variant="body2" className="text-sm text-default-400">
                                    -
                                </Typography>
                            )}
                        </Box>
                    </TableCell>
                );

            default:
                return <TableCell>{summary[columnKey]}</TableCell>;
        }
    }, []);

    const columns = [
        { name: "Date", uid: "date", icon: CalendarDaysIcon },
        { name: "Total Daily Works", uid: "totalDailyWorks", icon: DocumentTextIcon },
        { name: "Resubmissions", uid: "resubmissions", icon: ArrowPathIcon },
        { name: "Embankment", uid: "embankment", icon: BuildingOfficeIcon },
        { name: "Structure", uid: "structure", icon: DocumentIcon },
        { name: "Pavement", uid: "pavement", icon: MapPinIcon },
        { name: "Completed", uid: "completed", icon: CheckCircleIcon },
        { name: "Pending", uid: "pending", icon: ClockIcon },
        { name: "Completion %", uid: "completionPercentage", icon: ChartBarIcon },
        { name: "RFI Submissions", uid: "rfiSubmissions", icon: DocumentIcon },
        { name: "RFI Submission %", uid: "rfiSubmissionPercentage", icon: ChartBarIcon }
    ];

    if (isMobile) {
        return (
            <Box className="space-y-4">
                <ScrollShadow className="max-h-[70vh]">
                    {filteredData?.map((summary, index) => (
                        <MobileSummaryCard key={index} summary={summary} />
                    ))}
                </ScrollShadow>
            </Box>
        );
    }

    return (
        <Box sx={{ maxHeight: "70vh", overflowY: "auto" }}>
            <ScrollShadow className="max-h-[70vh]">
                <Table
                    isStriped
                    selectionMode="none"
                    isCompact
                    isHeaderSticky
                    removeWrapper
                    aria-label="Daily Work Summary Table"
                    classNames={{
                        wrapper: "min-h-[200px]",
                        table: "min-h-[300px]",
                        thead: "[&>tr]:first:shadow-small bg-default-100/80",
                        tbody: "divide-y divide-default-200/50",
                        tr: "group hover:bg-default-50/50 transition-colors h-12",
                        td: "py-2 px-3 text-sm",
                        th: "py-2 px-3 text-xs font-semibold"
                    }}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn 
                                key={column.uid} 
                                className="bg-default-100/80 backdrop-blur-md"
                            >
                                <Box className="flex items-center gap-1">
                                    {column.icon && <column.icon className="w-3 h-3" />}
                                    <span className="text-xs font-semibold">{column.name}</span>
                                </Box>
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody 
                        items={filteredData || []}
                        emptyContent={
                            <Box className="flex flex-col items-center justify-center py-8 text-center">
                                <ChartBarIcon className="w-12 h-12 text-default-300 mb-4" />
                                <Typography variant="h6" color="textSecondary">
                                    No summary data found
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    No work summary available for the selected period
                                </Typography>
                            </Box>
                        }
                    >
                        {(summary) => (
                            <TableRow key={summary.date}>
                                {(columnKey) => renderCell(summary, columnKey)}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollShadow>
        </Box>
    );
};

export default DailyWorkSummaryTable;
