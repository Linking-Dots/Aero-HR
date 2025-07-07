import React from 'react';
import { 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    DocumentTextIcon,
    CalendarIcon,
    CheckCircleIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { 
    Button, 
    Chip, 
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Spinner
} from '@heroui/react';
import { format } from 'date-fns';

const JobPostingsTable = ({ data, loading, permissions, onView, onEdit, onDelete, onApplications }) => {
    const getStatusChip = (status) => {
        switch (status) {
            case 'draft':
                return (
                    <Chip 
                        variant="flat" 
                        color="default" 
                        size="sm"
                        startContent={<DocumentTextIcon className="w-4 h-4" />}
                    >
                        Draft
                    </Chip>
                );
            case 'pending':
                return (
                    <Chip 
                        variant="flat" 
                        color="warning" 
                        size="sm"
                        startContent={<CalendarIcon className="w-4 h-4" />}
                    >
                        Pending
                    </Chip>
                );
            case 'published':
                return (
                    <Chip 
                        variant="flat" 
                        color="success" 
                        size="sm"
                        startContent={<CheckCircleIcon className="w-4 h-4" />}
                    >
                        Published
                    </Chip>
                );
            case 'closed':
                return (
                    <Chip 
                        variant="flat" 
                        color="danger" 
                        size="sm"
                    >
                        Closed
                    </Chip>
                );
            case 'on_hold':
                return (
                    <Chip 
                        variant="flat" 
                        color="secondary" 
                        size="sm"
                    >
                        On Hold
                    </Chip>
                );
            default:
                return (
                    <Chip 
                        variant="flat" 
                        color="default" 
                        size="sm"
                    >
                        {status}
                    </Chip>
                );
        }
    };

    const columns = [
        { name: "Job Title", uid: "title" },
        { name: "Department", uid: "department" },
        { name: "Job Type", uid: "job_type" },
        { name: "Status", uid: "status" },
        { name: "Posted Date", uid: "posted_date" },
        { name: "Closing Date", uid: "closing_date" },
        { name: "Applications", uid: "applications" },
        { name: "Actions", uid: "actions" }
    ];

    const renderCell = (item, columnKey) => {
        switch (columnKey) {
            case "title":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize">{item.title}</p>
                        <p className="text-bold text-tiny capitalize text-default-400">{item.designation?.name}</p>
                    </div>
                );
            case "department":
                return item.department?.name || 'N/A';
            case "job_type":
                return (
                    <span className="capitalize">
                        {item.job_type?.replace('_', ' ') || 'N/A'}
                    </span>
                );
            case "status":
                return getStatusChip(item.status);
            case "posted_date":
                return item.posted_date ? format(new Date(item.posted_date), 'MMM dd, yyyy') : 'N/A';
            case "closing_date":
                return item.closing_date ? format(new Date(item.closing_date), 'MMM dd, yyyy') : 'N/A';
            case "applications":
                return (
                    <Chip size="sm" variant="flat" color="primary">
                        {item.applications_count || 0}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-end">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    aria-label="More actions"
                                >
                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Actions">
                                {permissions.includes('jobs.view') && (
                                    <DropdownItem
                                        key="view"
                                        startContent={<EyeIcon className="w-4 h-4" />}
                                        onPress={() => onView(item)}
                                    >
                                        View Details
                                    </DropdownItem>
                                )}
                                
                                {permissions.includes('jobs.update') && (
                                    <DropdownItem
                                        key="edit"
                                        startContent={<PencilIcon className="w-4 h-4" />}
                                        onPress={() => onEdit(item)}
                                    >
                                        Edit Job
                                    </DropdownItem>
                                )}
                                
                                {permissions.includes('job-applications.view') && (
                                    <DropdownItem
                                        key="applications"
                                        startContent={<DocumentTextIcon className="w-4 h-4" />}
                                        onPress={() => onApplications(item)}
                                    >
                                        View Applications ({item.applications_count || 0})
                                    </DropdownItem>
                                )}
                                
                                {permissions.includes('jobs.delete') && (
                                    <DropdownItem
                                        key="delete"
                                        className="text-danger"
                                        color="danger"
                                        startContent={<TrashIcon className="w-4 h-4" />}
                                        onPress={() => onDelete(item)}
                                    >
                                        Delete
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                return item[columnKey];
        }
    };

    return (
        <div className="w-full">
            <Table
                aria-label="Job Postings Table"
                classNames={{
                    wrapper: "glass-table",
                    th: "bg-transparent",
                    td: "group-data-[hover=true]:bg-default-50",
                }}
                isStriped
                removeWrapper
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn 
                            key={column.uid} 
                            align={column.uid === "actions" ? "end" : "start"}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody 
                    items={data} 
                    isLoading={loading}
                    loadingContent={<Spinner label="Loading..." />}
                    emptyContent="No job postings found"
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => (
                                <TableCell>{renderCell(item, columnKey)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default JobPostingsTable;
