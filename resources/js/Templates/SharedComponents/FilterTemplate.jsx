import React from 'react';
import { 
    Card, 
    CardBody, 
    CardHeader,
    Input,
    Select,
    SelectItem,
    Button,
    ButtonGroup,
    Chip
} from "@heroui/react";
import { Grid, Typography } from '@mui/material';
import { 
    FunnelIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    CalendarIcon
} from "@heroicons/react/24/outline";

/**
 * FilterTemplate - A reusable filter and search component
 * 
 * @param {Object} props
 * @param {Array} props.filters - Array of filter definitions
 * @param {Object} props.values - Current filter values
 * @param {Function} props.onChange - Filter change handler
 * @param {Function} props.onReset - Reset filters handler
 * @param {Array} props.quickFilters - Array of quick filter buttons
 * @param {string} props.activeQuickFilter - Active quick filter
 * @param {Function} props.onQuickFilterChange - Quick filter change handler
 * @param {boolean} props.isCollapsible - Whether filters can be collapsed
 * @param {boolean} props.defaultExpanded - Default expanded state
 * @param {string} props.title - Filter section title
 */
const FilterTemplate = ({
    filters = [],
    values = {},
    onChange,
    onReset,
    quickFilters = [],
    activeQuickFilter,
    onQuickFilterChange,
    isCollapsible = false,
    defaultExpanded = true,
    title = "Filters & Search",
    className = "",
    ...props
}) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    const handleFilterChange = (filterKey, value) => {
        if (onChange) {
            onChange(filterKey, value);
        }
    };

    const handleReset = () => {
        if (onReset) {
            onReset();
        }
    };

    const getActiveFiltersCount = () => {
        return Object.values(values).filter(value => 
            value !== '' && value !== 'all' && value !== null && value !== undefined
        ).length;
    };

    const renderFilter = (filter, index) => {
        const filterValue = values[filter.key] || filter.defaultValue || '';

        switch (filter.type) {
            case 'search':
                return (
                    <Input
                        key={index}
                        label={filter.label}
                        placeholder={filter.placeholder}
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        startContent={
                            filter.startIcon ? 
                                <filter.startIcon className="w-4 h-4 text-default-400" /> :
                                <MagnifyingGlassIcon className="w-4 h-4 text-default-400" />
                        }
                        variant="bordered"
                        classNames={{
                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                        }}
                        isClearable
                        onClear={() => handleFilterChange(filter.key, '')}
                    />
                );

            case 'select':
                return (
                    <Select
                        key={index}
                        label={filter.label}
                        selectedKeys={[String(filterValue)]}
                        onSelectionChange={(keys) => handleFilterChange(filter.key, Array.from(keys)[0])}
                        variant="bordered"
                        classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                        }}
                    >
                        {filter.options?.map((option) => (
                            <SelectItem key={option.key || option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                );

            case 'date':
                return (
                    <Input
                        key={index}
                        label={filter.label}
                        type={filter.inputType || 'date'}
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        variant="bordered"
                        startContent={filter.startIcon ? 
                            <filter.startIcon className="w-4 h-4 text-default-400" /> :
                            <CalendarIcon className="w-4 h-4 text-default-400" />
                        }
                        classNames={{
                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                        }}
                    />
                );

            case 'month':
                return (
                    <Input
                        key={index}
                        label={filter.label}
                        type="month"
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        variant="bordered"
                        startContent={<CalendarIcon className="w-4 h-4 text-default-400" />}
                        classNames={{
                            inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                        }}
                    />
                );

            case 'year':
                return (
                    <Select
                        key={index}
                        label={filter.label}
                        selectedKeys={[String(filterValue)]}
                        onSelectionChange={(keys) => handleFilterChange(filter.key, Array.from(keys)[0])}
                        variant="bordered"
                        classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                        }}
                    >
                        {filter.options?.map((option) => (
                            <SelectItem key={option.key || option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                );

            default:
                return null;
        }
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <Card className={`mb-6 bg-white/5 backdrop-blur-md border border-white/10 ${className}`}>
            <CardHeader 
                className={`pb-3 ${isCollapsible ? 'cursor-pointer' : ''}`}
                onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5 text-primary" />
                        <Typography variant="h6" className="text-foreground">
                            {title}
                        </Typography>
                        {activeFiltersCount > 0 && (
                            <Chip size="sm" color="primary" variant="flat">
                                {activeFiltersCount}
                            </Chip>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFiltersCount > 0 && (
                            <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                startContent={<XMarkIcon className="w-4 h-4" />}
                                onPress={handleReset}
                            >
                                Clear
                            </Button>
                        )}
                        {isCollapsible && (
                            <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                            >
                                <svg 
                                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            
            {(!isCollapsible || isExpanded) && (
                <CardBody>
                    {/* Quick Filters */}
                    {quickFilters.length > 0 && (
                        <div className="mb-4">
                            <Typography variant="body2" className="mb-2 text-default-600">
                                Quick Filters:
                            </Typography>
                            <ButtonGroup size="sm" variant="flat">
                                {quickFilters.map((quickFilter, index) => (
                                    <Button
                                        key={index}
                                        color={activeQuickFilter === quickFilter.key ? 'primary' : 'default'}
                                        variant={activeQuickFilter === quickFilter.key ? 'solid' : 'flat'}
                                        onPress={() => onQuickFilterChange && onQuickFilterChange(quickFilter.key)}
                                    >
                                        {quickFilter.label}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </div>
                    )}

                    {/* Filter Grid */}
                    <Grid container spacing={3}>
                        {filters.map((filter, index) => (
                            <Grid 
                                item 
                                xs={12} 
                                sm={filter.gridSize?.sm || 6} 
                                md={filter.gridSize?.md || 3} 
                                lg={filter.gridSize?.lg || 3}
                                key={filter.key || index}
                            >
                                {renderFilter(filter, index)}
                            </Grid>
                        ))}
                    </Grid>
                </CardBody>
            )}
        </Card>
    );
};

export default FilterTemplate;
